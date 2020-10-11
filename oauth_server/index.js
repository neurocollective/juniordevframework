const express = require('express');
const { Client } = require('pg');
const {
	bootstrapPostgresFunctions
} = require('./lib/postgres');
const {
	isTokenExpiredByAPICheck,
	writeStringToFile,
	getAuthUrlFromCredentials,
	getGmailUrl,
	getGmailProfile,
	requestToken,
	refreshToken
} = require('./lib');

// NOTE: got last token refresh at 1601250648435

const  {
  env: {
    CREDENTIALS_FILE_PATH = `${process.cwd()}/oauth_server/credentials.json`,
    TOKEN_FILE_PATH = `${process.cwd()}/oauth_server/token.json`,
    REDIRECT_AUTH_URLS: redirectEnvValue = 'true'
  }
} = process;

const REDIRECT_AUTH_URLS = redirectEnvValue.toLowerCase() == 'true' ? true : false;

const PORT = 8080;

const bootServer = async () => {
	const app = express();

	app.use(express.json()); // parse json bodies
	app.use(express.urlencoded({ extended: false })); // parse form bodies

	const FAKE_ASS_REDIS = {
		'uuid': 'email'
	};

	const dbFunctions = bootstrapPostgresFunctions(Client);

	let cryptr;
	let credentialsObject;

	app.use(express.static(`${process.cwd()}/oauth_server/public`));

	app.get('/oauth', async (req, res) => {

		const {
			query: {
				code,
				scope,
				state
			},
			cookies
		} = req;

		let token;
		let error;
		try {
			const { response, error: requestError, statusCode } = await requestToken(credentialsObject, code);
			token = response;
			error = requestError;
		} catch (err) {
			console.error('error running requestToken at /oauth:', err);
			requestError = err.message;
		}

		if (error || !token || !token['access_token']) {
			return res.status(500).json({
				error: `token not retrieved! statusCode from google: ${statusCode}, error: ${requestError}`
			});
		}

		const { statusCode, error: getProfileError, response } = await getGmailProfile(token['access_token']);

		if (getProfileError || Number(statusCode) > 399) {
			// still store token as orphaned? orphaned_oauth_token create-query exists
			return res.status(500).json({
				error: `/oauth got this error trying to use a newly issued token: ${getProfileError}`
			});
		}

		const { emailAddress } = response;

		const { rows: [user] } = await dbFunctions.getUserIdForEmail(emailAddress);

		if (getProfileError || !user) {
			// still store token as orphaned? orphaned_oauth_token create-query exists
			return res.status(500).json({ error: `/oauth found no user for email ${emailAddress}` });
		}

		const { id } = user;

		const now = new Date().getTime();

		const { rows: [existingToken] } = await dbFunctions.getOAuthTokenForUserId(id);

		if (!existingToken) {
			try {
				await dbFunctions.insertToken(token, id, now);
			} catch (err) {
				console.error('/oauth error trying to insertToken:', err);
				return res.status(500).send(err.message);
			}
		} else {
			await dbFunctions.updateTokenValueForUser(token, id);	
		}

		return res.redirect('/');
	});

	app.get('/email/profile', async (req, res) => {
		const {
			query: {
				email
			}
		} = req;

		const { rows: [user] } = await dbFunctions.getUserIdForEmail(email);

		if (!user) {
			return res.status(401).json({ error: 'unauthorized' });
		}

		const { rows: [token] } = await dbFunctions.getOAuthTokenForUserId(user.id);

		if (!token || !token.access_token) {
			console.log(`no tokens for user ${userId}`);
			return res.status(500).send();
		}

		const responseJson = await getGmailProfile(token.access_token);

		return res.status(Number(responseJson.statusCode)).json(responseJson);
	});

	// DESIGN DECISION - this endpoint should ALWAYS REDIRECT as google's auth need to be source of truth. 
	// No more refresh token, always get auth from here! If user is not storing cookies, they should always sign in here
	app.post('/login', async (req, res) => {

		const {
			body: {
				email
			}
		} = req;

		const { rows: [user] } = await dbFunctions.getUserIdForEmail(email);

		if (!user) {
			const error = 'no user for that email';
			
			if (REDIRECT_AUTH_URLS) {
				return res.redirect(`/?code=401&error=${error.split(' ').join('+')}`);
			}
			return res.status(401).json({ error });
		}

		const { id } = user;

		// db has a constraint on oauth_token that userId is UNIQUE
		const { rows: [token] } = await dbFunctions.getOAuthTokenForUserId(id);

		const tokenIsExpired = await isTokenExpiredByAPICheck(token);

		if (tokenIsExpired) {

			const authURL = getAuthUrlFromCredentials(credentialsObject, id, email);

			if (REDIRECT_AUTH_URLS) {
				return res.redirect(authURL);
			}
			return res.json({ authURL });
		}
			
		if (REDIRECT_AUTH_URLS) {
			return res.redirect('/?loggedin=true');
		}
		return res.status(200).json({ authorized: true }); 
	});

	app.post('/signup', async (req, res) => {

		const {
			body: {
				email,
				firstName,
				lastName
			}
		} = req;

		try {
			await dbFunctions.insertNewUser(email, firstName, lastName);
		} catch (err) {
			console.error('signup error:', err);

			const failMessage = 'could not create new user';
			if (REDIRECT_AUTH_URLS) {
				return res.redirect(`/?newusercreated=false&error=${failMessage.replace(/ /g, '+')}`);
			}
			return res.status(500).json({ error: failMessage });
		}

		if (REDIRECT_AUTH_URLS) {
			return res.redirect('/?newusercreated=true');
		}
		return res.status(200).json({ email, message: `new user ${firstName} ${lastName} created` });

	});

	app.listen(PORT, async () => {

		const { rows: [credentials] } = await dbFunctions.getCredentials();
		credentialsObject = credentials;
		
		console.log(`app listening on ${PORT}`);
	});
};

module.exports = {
	bootServer
};
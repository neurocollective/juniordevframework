const { Router } = require('express');
const { v4: uuid } = require('uuid');
const {
	getGmailProfile,
	requestToken,
	isTokenExpiredByAPICheck,
	getAuthUrlFromCredentials
} = require('../../lib');
const  {
  env: {
    REDIRECT_AUTH_URLS: redirectEnvValue = ''
  }
} = process;

const REDIRECT_AUTH_URLS = redirectEnvValue.toLowerCase() == 'true' ? true : false;

const getOAuthRoutes = (dbFunctions, redisFunctions, credentialsObject) => {

	const oAuthRouter = Router();

	oAuthRouter.get('/', async (req, res) => {

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

		const cookieValue = uuid();
		res.setCookie(COOKIE_KEY, cookieValue, { maxAge: COOKIE_MAX_AGE, httpOnly: true });
		
		try {
			await redisFunctions.mapCookieAndUserId(cookieValue, userId);
		} catch (err) {
			console.error('error setting key/value in redis:', err);
		}

		return res.redirect('/');
	});

	oAuthRouter.post('/login', async (req, res) => {

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

	return oAuthRouter;
};

module.exports = getOAuthRoutes;

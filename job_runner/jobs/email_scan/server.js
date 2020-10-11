const express = require('express');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

const  {
  env: {
    CREDENTIALS_FILE_PATH = `${process.cwd()}/job_runner/jobs/email_scan/credentials.json`,
    TOKEN_PATH = `${process.cwd()}/jobs/email_scan/token.json`,
  }
} = process;

// TODO: temporary, must become dynamic
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const {
	readFile,
	getClientAndCheckForPreAuthorization,
	getClientFromCredentials
} = require('./index2.js');

const PORT = 8080;

const getTokenForEmail = (email, password, oAuth2Client) => {
	// email ignored for now, later on token data should be in db, associated with an email
	return checkForToken(oAuth2Client);
};

const sessionMiddleware = (req, res, next) => {
	if (req.cookies) {
		console.log('req.cookies:', req.cookies);
		next();
	}
	next();
	// return res.redirect('/?loggedin=false');
};

// this should get me email and other stuff -> oAuth2Client.userinfo.get({});

// how to set a cookie (can do in middleware) -> res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });

const bootServer = async () => {
	const app = express();

	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(cookieParser());

	const FAKE_ASS_REDIS = {
		'uuid': 'email'
	};

	// const credentialsObject = await readFile(CREDENTIALS_FILE_PATH);

	let oAuth2Client;

	app.use(express.static(`${process.cwd()}/job_runner/jobs/email_scan/public`));

	app.use(sessionMiddleware);

	app.get('/oauth', (req, res) => {
		const {
			query: {
				code,
				scope
			},
			cookies
		} = req;

		console.log('/oauth query string:', req.query);
		console.log('/oauth sent cookies:', cookies);
		console.log('/oauth Signed Cookies: ', req.signedCookies);

		oAuth2Client.getToken(code, (err, token) => {
	      if (err) {
	        return console.error('Error retrieving access token', err);
	      }
	      oAuth2Client.setCredentials(token);
	      // Store the token to disk for later program executions
	      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
	        if (err) {
	          return console.error(err);
	        }
	        console.log('Token stored to', TOKEN_PATH);
	      });
	    });

		// add cookies to show logged in?
		return res.redirect('/');
	});

	app.post('/login', async (req, res) => {

		console.log('HAI');

		const {
			body: {
				email = 'johnny@johnnymccodes.com',
				password = 'password1'
			}
		} = req;

		// check for token

		console.log(email, password);

		const { oAuth2Client, authorized } = await getTokenForEmail(email, password, oAuth2Client);

		if (!authorized) {
			return res.redirect(`/authorize?email=${encodeURIComponent(email)}`);
		} 

		const uuid = uuidv4();
		FAKE_ASS_REDIS[uuid] = oAuth2Client;


		return res.send(`<html><body>login successful</body></html>`);
	});

	app.get('/authorize', (req, res) => {
		const {
			query: {
				email
			}
		} = req;

		const authUrl = oAuth2Client.generateAuthUrl({
		    access_type: 'offline',
		    scope: SCOPES,
		  });
		return res.redirect(authUrl);
	});

	app.listen(PORT, async () => {
		const credentialsObject = await readFile(CREDENTIALS_FILE_PATH);
		console.log('credentialsObject:', credentialsObject);
		oAuth2Client = getClientFromCredentials(credentialsObject);
		console.log(`app listening on ${PORT}`);
	});
};

module.exports = bootServer;
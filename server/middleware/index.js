const {
	env: {
		LOCAL_MODE
	}
} = process;
const {
	MIDDLEWARE: {
		VALID_TOKEN,
		USER_ID,
		REDIRECT_URL
	},
	COOKIES: {
		KEY: SESSION_KEY
	},
	ROUTING: {
		SLASH_LOGIN
	}
} = require('../lib/constants');
const {
	isTokenExpiredByAPICheck
} = require('../lib');

let local = false;
if (LOCAL_MODE && LOCAL_MODE.toLowerCase() === 'true') {
  local = true;
}

// const  {
//   env: {
//     REDIRECT_AUTH_URLS: redirectEnvValue = 'true'
//   }
// } = process;
// const REDIRECT_AUTH_URLS = redirectEnvValue.toLowerCase() == 'true' ? true : false;

const buildAuthMiddleware = (postgresFunctions, redisFunctions, credentialsObject) => {

	// const { getUserIdForCookie, mapCookieAndUserId } = redisFunctions;

	const checkForValidSession = async (req, res, next) => {

		const {
			cookies: {
				[SESSION_KEY]: cookieValue
			}
		} = req;

		if (local) {
			console.log(`cookie detected in checkForValidSession as ${cookieValue}`);
		}

		if (req.cookies[SESSION_KEY]) {
			const userId = await redisFunctions.getUserIdForCookie(cookieValue);
			req.userId = userId;
			return next();
		}
		if (local) {
			console.log('no userId found by checkForValidSession, sending redirect');
		}
		return res.status(304).json({ [REDIRECT_URL]: SLASH_LOGIN });
	};

	const checkForValidToken = async (req, res, next) => {

		req.validToken = false;
		const { [USER_ID]: userId } = req;

		// TODO - this should be redundant, handled by previous middleware
		if (!userId) {
			if (local) {
				console.log('no userId in checkForValidToken, sending redirect');
			}
			return res.json({ [REDIRECT_URL]: SLASH_LOGIN });
		}

		let tokenObject;
		try {
			tokenObject = await postgresFunctions.getTokenForUserId(userId);
		} catch (err) {
			console.error(`checkForValidToken got error ${err.message}`);
			return next();
		}

		const tokenIsValid = await isTokenExpiredByAPICheck(tokenObject);

		if (tokenIsValid) {
			req[VALID_TOKEN] = true;
			return next();
		}

		if (local) {
			console.log('invalid token in checkForValidToken, sending redirect');
		}
		const redirectURL = getAuthUrlFromCredentials(credentialsObject, id, email);

		return res.status(304).json({ [REDIRECT_URL]: redirectURL });
	};

	return [
		checkForValidSession,
		checkForValidToken
	];
};

module.exports = {
	buildAuthMiddleware
};

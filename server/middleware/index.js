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
} = require('../../lib/constants');
const {
  isTokenExpiredByAPICheck,
  getAuthUrlFromCredentials
} = require('../../lib');

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
      req[USER_ID] = userId;
      return next();
    }
    if (local) {
      console.log('no userId found by checkForValidSession, sending redirect');
    }
    return res.status(200).json({ [REDIRECT_URL]: SLASH_LOGIN });
  };

  const checkForValidToken = async (req, res, next) => {
    req.validToken = false;
    const { [USER_ID]: userId } = req;

    // TODO - this should be redundant, handled by previous middleware
    if (!userId) {
      if (local) {
        console.log('no userId in checkForValidToken, sending redirect');
      }
      return res.status(401).json({ [REDIRECT_URL]: SLASH_LOGIN });
    }

    let accessToken;
    try {
      const { rows } = await postgresFunctions.getOAuthTokenForUserId(userId);
      ([ { access_token: accessToken  } = {} ] = rows);
    } catch (err) {
      console.error(`checkForValidToken got error ${err.message}`);

      const { rows: [{ email }] } = await postgresFunctions.getEmailForUserId(userId);
      const redirectURL = getAuthUrlFromCredentials(credentialsObject, userId, email);
      return res.status(401).json({ [REDIRECT_URL]: redirectURL });
    }

    const tokenIsExpired = await isTokenExpiredByAPICheck(accessToken);

    if (!tokenIsExpired) {
      req[VALID_TOKEN] = true;
      return next();
    }

    if (local) {
      console.log('invalid token in checkForValidToken, sending redirect');
    }
    const { rows: [{ email }] } = await postgresFunctions.getEmailForUserId(userId);
    const redirectURL = getAuthUrlFromCredentials(credentialsObject, userId, email);
    return res.status(401).json({ [REDIRECT_URL]: redirectURL });
  };

  return [
    checkForValidSession,
    checkForValidToken
  ];
};

module.exports = {
  buildAuthMiddleware
};

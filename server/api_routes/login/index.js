const { Router } = require('express');
const  {
  env: {
    REDIRECT_AUTH_URLS: redirectEnvValue = ''
  }
} = process;
const {
  isTokenExpiredByAPICheck,
  getAuthUrlFromCredentials,
  getAuthURLAndSendRedirectJSON
} = require('../../../lib');
const {
  MIDDLEWARE: {
    REDIRECT_URL
  }
} = require('../../../lib/constants');

const REDIRECT_AUTH_URLS = redirectEnvValue.toLowerCase() == 'true' ? true : false;

const getLoginPageRouter = (dbFunctions, redisFunctions, credentialsObject) => {
  const loginRouter = Router();

  loginRouter.post('/', async (req, res) => {

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

    // if (tokenIsExpired) {

    //   const authURL = getAuthUrlFromCredentials(credentialsObject, id, email);

    //   if (REDIRECT_AUTH_URLS) {
    //     return res.redirect(authURL);
    //   }
    //   return res.status(401).json({ [REDIRECT_URL]: authURL });
    // }

    // const getAuthURLAndSendRedirectJSON = (res, contextObject, statusCode = 401) => {
    //   const { credentialsObject, id, email } = contextObject;
    //   const authURL = getAuthUrlFromCredentials(credentialsObject, id, email);
    //   if (REDIRECT_AUTH_URLS) {
    //     return res.redirect(authURL);
    //   }
    //   return res.status(statusCode).json({ [REDIRECT_URL]: authURL });
    // }

    if (tokenIsExpired) {
      const contextObject = { credentialsObject, id, email };
      return getAuthURLAndSendRedirectJSON(res, contextObject, 401);
    }
      
    if (REDIRECT_AUTH_URLS) {
      return res.redirect('/?loggedin=true');
    }
    return res.status(200).json({ authorized: true });
  });

  return loginRouter;
};

module.exports = getLoginPageRouter;

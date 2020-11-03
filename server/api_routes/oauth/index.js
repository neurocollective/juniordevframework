const { Router } = require('express');
// const { v4: uuid } = require('uuid');
const {
  getGmailProfile,
  requestToken,
  isTokenExpiredByAPICheck,
  getAuthUrlFromCredentials,
  createSessionCookie
} = require('../../lib');
const {
  // MIDDLEWARE: {
  //   REDIRECT_URL
  // },
  COOKIES: {
    KEY: COOKIE_KEY,
    COOKIE_MAX_AGE
  }
} = require('../../lib/constants');

// const  {
//   env: {
//     REDIRECT_AUTH_URLS: redirectEnvValue = ''
//   }
// } = process;

// const REDIRECT_AUTH_URLS = redirectEnvValue.toLowerCase() == 'true' ? true : false;

const getOAuthRoutes = (dbFunctions, redisFunctions, credentialsObject) => {

  const oAuthRouter = Router();

  // this route MUST redirect, as browser is sent here from google. No vue app will be loaded to handle JSON
  oAuthRouter.get('/', async (req, res) => {

    console.log('/api/oauth');
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
    let statusCode;
    try {
      const responseObject = await requestToken(credentialsObject, code);
      token = responseObject.response;
      error = responseObject.error;
      statusCode = responseObject.statusCode;
    } catch (err) {
      console.error('error running requestToken at /oauth:', err);
      requestError = err.message;
    }

    if (error || !token || !token['access_token']) {
      const error = `token not retrieved! statusCode from google: ${statusCode}, error: ${requestError}`;
      return res.redirect(`http://localhost:8080/?error=${encodeURIComponent(error)}`);
    }

    const {
      statusCode: gmailStatusCode,
      error: getProfileError,
      response
    } = await getGmailProfile(token['access_token']);

    if (getProfileError || Number(gmailStatusCode) > 399) {
      // still store token as orphaned? orphaned_oauth_token create-query exists
      const error = `/oauth got this error trying to use a newly issued token: ${getProfileError}`;
      return res.redirect(`http://localhost:8080/?error=${encodeURIComponent(error)}`);
    }

    const { emailAddress } = response;

    const { rows: [user] } = await dbFunctions.getUserIdForEmail(emailAddress);

    if (getProfileError || !user) {
      // still store token as orphaned? orphaned_oauth_token create-query exists
      const error = `/oauth found no user for email ${emailAddress}`;
      return res.redirect(`http://localhost:8080/?error=${encodeURIComponent(error)}`);
    }

    const { id: userId } = user;

    const now = new Date().getTime();

    const { rows: [existingToken] } = await dbFunctions.getOAuthTokenForUserId(userId);

    if (!existingToken) {
      console.log('inserting token');
      try {
        await dbFunctions.insertToken(token, userId, now);
      } catch (err) {
        const error = `/oauth error trying to insertToken:' ${err.message}`;
        console.error(error);
        return res.redirect(`http://localhost:8080/?error=${encodeURIComponent(error)}`);
      }
    } else {
      console.log('updating token');
      await dbFunctions.updateTokenValueForUser(token, userId);
    }

    // const cookieValue = uuid();
    // res.cookie(COOKIE_KEY, cookieValue, { maxAge: COOKIE_MAX_AGE, httpOnly: true });

    // try {
    //   await redisFunctions.mapCookieAndUserId(cookieValue, userId);
    // } catch (err) {
    //   console.error('error setting key/value in redis:', err);
    // }

    // const createSessionCookie = async (res, redisFunctions) => {
    //   const cookieValue = uuid();
    //   res.cookie(COOKIE_KEY, cookieValue, { maxAge: COOKIE_MAX_AGE, httpOnly: true });

    //   try {
    //     await redisFunctions.mapCookieAndUserId(cookieValue, userId);
    //   } catch (err) {
    //     console.error('error setting key/value in redis:', err);
    //     return Promise.reject(err);
    //   }

    //   return cookieValue;
    // };

    await createSessionCookie(res, redisFunctions, userId);

    console.log('sending user to /?authorized=true');
    return res.redirect('http://localhost:8080/?authorized=true');
  });

  return oAuthRouter;
};

module.exports = getOAuthRoutes;

const { Router } = require('express');
// const { v4: uuid } = require('uuid');
const {
  getGmailProfile,
  requestToken,
  createSessionCookie
} = require('../../../lib');

// const  {
//   env: {
//     REDIRECT_AUTH_URLS: redirectEnvValue = ''
//   }
// } = process;

// const REDIRECT_AUTH_URLS = redirectEnvValue.toLowerCase() == 'true' ? true : false;

const getOAuthRoutes = (dbFunctions, redisFunctions, credentialsObject) => {
  const oAuthRouter = Router();

  // this route MUST redirect, as browser is sent here from google.
  // No vue app will be loaded to handle JSON
  oAuthRouter.get('/', async (req, res) => {
    console.log('/api/oauth');
    const {
      query: {
        code,
      },
    } = req;

    let token;
    let error;
    let statusCode;
    try {
      ({ response: token, error, statusCode } = await requestToken(credentialsObject, code));
    } catch (err) {
      console.error('error running requestToken at /oauth:', err);
    }

    console.log('statusCode from requestToken response:', statusCode);
    console.log('token.refresh_token', token.refresh_token);

    if (error || !token || !token.access_token) {
      const errorMessage = `token not retrieved! statusCode from google: ${statusCode}, error: ${error}`;
      console.error('line 57 error:', errorMessage);
      console.error('token', token);
      return res.redirect(`http://localhost:8080/?error=${encodeURIComponent(errorMessage)}`);
    }

    const {
      statusCode: gmailStatusCode,
      error: getProfileError,
      response
    } = await getGmailProfile(token.access_token);

    if (getProfileError || Number(gmailStatusCode) > 399) {
      // still store token as orphaned? orphaned_oauth_token create-query exists
      const errorMessage = `/oauth got this error trying to use a newly issued token: ${getProfileError}`;
      // console.error('getProfileError', getProfileError);
      console.error('gmailStatusCode', gmailStatusCode);
      return res.redirect(`http://localhost:8080/?error=${encodeURIComponent(errorMessage)}`);
    }

    const { emailAddress } = response;

    const { rows: [user] } = await dbFunctions.getUserIdForEmail(emailAddress);

    if (getProfileError || !user) {
      // still store token as orphaned? orphaned_oauth_token create-query exists
      const errorMessage = `/oauth found no user for email ${emailAddress}`;
      return res.redirect(`http://localhost:8080/?error=${encodeURIComponent(errorMessage)}`);
    }

    const { id: userId } = user;

    const now = new Date().getTime();

    const { rows: [existingToken] } = await dbFunctions.getOAuthTokenForUserId(userId);

    if (!existingToken) {
      console.log('inserting token');
      try {
        await dbFunctions.insertToken(token, userId, now);
      } catch (err) {
        const errorMessage = `/oauth error trying to insertToken:' ${err.message}`;
        console.error(errorMessage);
        return res.redirect(`http://localhost:8080/?error=${encodeURIComponent(errorMessage)}`);
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

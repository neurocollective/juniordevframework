const {
  refreshToken,
  isTokenExpiredByAPICheck,
  listGmailMessages,
  getGmailMessageById,
  insertRefreshedToken,
  decodeBase64String,
  CONSTANTS
} = require('../../lib');

const {
  EMAIL_SCAN: {
    TARGET_MIME_TYPES_SET,
    TARGET_HEADERS_SET,
    HEADERS: {
      RECEIVED,
      FROM,
      TO
    }
  },
} = CONSTANTS;

const buildEmailFormatMapper = contextObject => ({ response }) => {
  const {
    TARGET_HEADERS_SET,
    TARGET_MIME_TYPES_SET,
    decodeBase64String
  } = contextObject;
  const {
    payload: {
      headers,
      body,
      parts = []
    }
  } = response;

  const relevantHeaders = headers.reduce((headerMap, headerObject, index) => {
    const { name, value } = headerObject;
    
    if (TARGET_HEADERS_SET.has(name)) {
      // if (name === RECEIVED) {
      //   headerMap[`${name}_${index}`] = value;    
      // } else {
      //   headerMap[name] = value;
      // }
      headerMap[name] = value;
      return headerMap;
    }

    return headerMap;
  }, {});

  const relevantBodyParts = parts.reduce((list, bodyObject, index) => {
    const { body, mimeType } = bodyObject;

    if (!body || !body.data) {
      return list;
    }

    if (TARGET_MIME_TYPES_SET.has(mimeType)) {
      const text = decodeBase64String(body.data);
      return list.concat([text]);
    }

    return list;
  }, []);

  return {
    headers: relevantHeaders,
    bodyParts: relevantBodyParts
  }
};

const scanEmails = async (pgFunctions, redisFunctions, userId) => {

  const { rows: [token] = [] } = await pgFunctions.getOAuthTokenForUserId(userId);
  const { rows: [credentialsObject] = [] } = await pgFunctions.getCredentials();

  if (!credentialsObject) {
    console.error('no credentials found in db');
    process.exit(1);
  }

  if (!token || !token['refresh_token']) {
    console.error('no refresh token data found in db');
    process.exit(1);
  }

  const accessToken = token['access_token'];

  const tokenIsExpired = await isTokenExpiredByAPICheck(accessToken);
  let refreshedToken;

  if (tokenIsExpired) {
    console.log('refreshing token before email scan...');
    refreshedToken = await refreshToken(credentialsObject, token, userId);

    await pgFunctions.insertRefreshedToken(refreshedToken, userId);
  } else {
    refreshedToken = token;
  }

  const { response, statusCode, error } = await listGmailMessages(refreshedToken);

  const { messages } = response;

  if (error) {
    console.error(error);
    process.exit(1);
  }

  const messagePromises = messages.map(({ id }) => getGmailMessageById(refreshedToken, id));
  
  let messageObjects;
  try {
    console.log('waiting for all getGmailMessageById api calls to finish...');
    messageObjects = await Promise.all(messagePromises);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  const emailFormatMapper = buildEmailFormatMapper({
    TARGET_HEADERS_SET,
    TARGET_MIME_TYPES_SET,
    decodeBase64String
  });

  const formattedEmails = messageObjects.map(emailFormatMapper);

  console.log('formattedEmails[0]', formattedEmails[0]);

  process.exit(0);
};

module.exports = {
  scanEmails
};

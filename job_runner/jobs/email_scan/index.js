/* eslint-disable */
import { scanIndeedEmail } from './indeed_utils';
import {
  refreshToken,
  isTokenExpiredByAPICheck,
  listGmailMessages,
  getGmailMessageById,
  decodeBase64String,
  getFormattedIdFromName,
  CONSTANTS
} from '../../../lib';

const {
  EMAIL_SCAN: {
    TARGET_MIME_TYPES_SET,
    TARGET_HEADERS_SET,
    HEADERS: {
      RECEIVED,
    },
    INDEED_APPLICATION_NOTIFY_ADDRESS,
  },
} = CONSTANTS;

const extractDateStringFromReceivedHeader = (str) => {
  const semiColonIndex = str.indexOf(';');
  const size = str.length;
  const dateBegin = str.slice(semiColonIndex + 1, size).trim();

  // TODO - does moment.js need the whole string?
  const hyphenIndex = dateBegin.indexOf('-');
  const plusIndex = dateBegin.indexOf('+');

  let sliced = dateBegin;
  if (hyphenIndex > -1) {
    sliced = sliced.slice(0, hyphenIndex);
  } else if (plusIndex > -1) {
    sliced = sliced.slice(0, plusIndex);
  }

  return sliced.trim();
};

const buildEmailFormatMapper = contextObject => ({ response }) => {
  const {
    TARGET_HEADERS_SET,
    TARGET_MIME_TYPES_SET,
    decodeBase64String
  } = contextObject;
  const {
    payload: {
      headers,
      // body,
      parts = []
    }
  } = response;

  const relevantHeaders = headers.reduce((headerMap, headerObject) => {
    const { name, value } = headerObject;

    // TODO write a helper extractTimeFromReceivedheader to create a new key, 'timeReceived'
    // `string.slice(indexof(';'), string.length).trim()` might work!

    if (TARGET_HEADERS_SET.has(name)) {
      // if (name === RECEIVED) {
      //   headerMap[`${name}_${index}`] = value;
      // } else {
      //   headerMap[name] = value;
      // }

      if (name === RECEIVED) {
        // const semiColonIndex = value.indexOf(';');
        // const size = value.length;
        // const date = value.slice(semiColonIndex + 1, size).trim();

        const dateString = extractDateStringFromReceivedHeader(value);
        // eslint-disable-next-line no-param-reassign
        headerMap.date = dateString;
      }

      // eslint-disable-next-line no-param-reassign
      headerMap[name] = value;
      return headerMap;
    }

    return headerMap;
  }, {});

  const relevantBodyParts = parts.reduce((list, bodyObject /* , index */) => {
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
    body: relevantBodyParts.join('')
  };
};

const buildEmailReducer = (context) => (accumulationObject, emailObject, index) => {

  // getFormattedIdFromName is your util for getting ids from company name

  const {
    allEntities = [],
    allContacts = [],
    allJobListings = [],
  } = context;
  const {
    messagesOnEdgeDate = [],
    entitiesToCreate = [],
    contactsToCreate = [],
    jobSearchActionsToCreate = [],
  } = accumulationObject;
  const {
    headers: {
      date,
      From: sentBy,
      To: to,
    },
    body: emailBody
  } = emailObject;

  if (sentBy.includes(INDEED_APPLICATION_NOTIFY_ADDRESS)) {
    // it's an indeed application
    const emailObject = scanIndeedEmail(emailBody, index);
    console.log('emailObject', emailObject);
    return {
      ...accumulationObject,
    };
  }

  return {
    ...accumulationObject
  };
};

const scanEmails = async (pgFunctions, redisFunctions, userId) => {
  const { rows: [token] = [] } = await pgFunctions.getOAuthTokenForUserId(userId);
  const { rows: [credentialsObject] = [] } = await pgFunctions.getCredentials();

  if (!credentialsObject) {
    console.error('no credentials found in db');
    process.exit(1);
  }

  if (!token || !token.refresh_token) {
    console.error('no refresh token data found in db');
    process.exit(1);
  }

  const accessToken = token.access_token;

  const tokenIsExpired = await isTokenExpiredByAPICheck(accessToken);
  let refreshedToken;

  if (tokenIsExpired) {
    console.log('refreshing token before email scan...');
    refreshedToken = await refreshToken(credentialsObject, token, userId);

    await pgFunctions.insertRefreshedToken(refreshedToken, userId);
  } else {
    console.log('token is valid,', token);
    refreshedToken = token;
  }

  const { response, error } = await listGmailMessages(refreshedToken);

  const { messages } = response;

  if (!messages) {
    console.log('ERROR, messages is falsy. response:', response);
    process.exit(1);
  }

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

  const formattedEmailObjects = messageObjects.map(emailFormatMapper);

  console.log('formattedEmailObjects[0].headers: \n', formattedEmailObjects[0].headers);
  // console.log('formattedEmailObjects[0].body: \n', formattedEmailObjects[0].body);

  const { rows: allEntities } = await pgFunctions.getAllJobEntities();
  const { rows: allContacts } = await pgFunctions.getAllJobContactsForUserId(userId);
  const { rows: allJobListings } = await pgFunctions.getAllJobListings();

  console.log('allEntities.length', allEntities.length);

  const accumulator = {
    messagesOnEdgeDate: [],
    entitiesToCreate: [],
    contactsToCreate: [],
    jobSearchActionsToCreate: [],
  };

  // TODO - get existing contact info for user from DB, insert into context
  const context = {
    allEntities,
    allContacts,
    allJobListings,
  };

  const emailReducer = buildEmailReducer(context);
  const dbOperationsObject = formattedEmailObjects.reduce(emailReducer, accumulator);

  const {
    messagesOnEdgeDate = [],
    entitiesToCreate = [],
    contactsToCreate = [],
    jobSearchActionsToCreate = [],
  } = dbOperationsObject;

  // create entities
  // create contacts
  // create job search actions

  process.exit(0);
};

export {
  scanEmails
};

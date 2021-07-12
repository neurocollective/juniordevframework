/* eslint-disable */
import moment from 'moment';
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

/*
  examples of raw date strings for `extractDateStringFromReceivedHeader` -> 
  by 2002:a54:2ecc:0:0:0:0:0 with SMTP id m12csp1480132ect;        Thu, 4 Feb 2021 14:54:10 -0800 (PST)
  from db229.mta.exacttarget.com (db229.mta.exacttarget.com. [13.111.0.229])        by mx.google.com with ESMTPS id 197si3710901qkd.39.2021.02.04.14.54.09        for <johnny@johnnymccodes.com>        (version=TLS1_2 cipher=ECDHE-ECDSA-AES128-GCM-SHA256 bits=128/128);        Thu, 04 Feb 2021 14:54:09 -0800 (PST)
  by db229.mta.exacttarget.com id h3hth42fmd4p for <johnny@johnnymccodes.com>; Thu, 4 Feb 2021 22:54:09 +0000 (envelope-from <bounce-648_HTML-126963812-4522-7327404-650445@bounce.s7.exacttarget.com>)
  by 2002:a54:3303:0:0:0:0:0 with SMTP id h3csp30439ecq;        Sun, 17 Jan 2021 00:32:00 -0800 (PST)
  from mailb-ge.linkedin.com (mailb-ge.linkedin.com. [2620:119:50c0:207::149])        by mx.google.com with ESMTPS id x11si16859789pfp.226.2021.01.17.00.31.59        for <johnny@johnnymccodes.com>        (version=TLS1_2 cipher=ECDHE-ECDSA-AES128-GCM-SHA256 bits=128/128);        Sun, 17 Jan 2021 00:31:59 -0800 (PST)
  by 2002:ab4:a54b:0:0:0:0:0 with SMTP id er11csp1840002ecb;        Sun, 10 Jan 2021 10:15:36 -0800 (PST)
  from mail64.indeed.com (mail64.indeed.com. [198.58.75.64])        by mx.google.com with ESMTPS id z3si8619078oih.94.2021.01.10.10.15.35        for <johnny@johnnymccodes.com>        (version=TLS1_2 cipher=ECDHE-ECDSA-AES128-GCM-SHA256 bits=128/128);        Sun, 10 Jan 2021 10:15:36 -0800 (PST)
  from notifications.post.post-mediumpriority-7dff879bf7-j7l8n (aus-smtp1.indeed.net [10.1.3.210]) by mail64.indeed.com (Postfix) with ESMTP id 4DDQ4R4JNJz7RXQ0 for <johnny@johnnymccodes.com>; Sun, 10 Jan 2021 12:15:35 -0600 (CST)
*/
const extractDateStringFromReceivedHeader = (str) => {
  const semiColonIndex = str.indexOf(';');
  const size = str.length;
  const dateBegin = str.slice(semiColonIndex + 1, size).trim();

  // dateBegin should look like this: 'Thu, 4 Feb 2021 14:54:10 -0800 (PST)'
  // `moment` constructor should be able to parse `dateBegin`'s format'

  let epoch;
  try {
    // TODO - moment is logging a warning for some inputs that they do not parse
    // but but throwing an actual error...
    epoch = moment(dateBegin).unix();
  } catch (error) {
    console.error(`error parsing via moment.js for this string: ${dateBegin}`);
    console.error('error is', error);
  }
  const hyphenIndex = dateBegin.indexOf('-');
  const plusIndex = dateBegin.indexOf('+');

  let sliced = dateBegin;
  if (hyphenIndex > -1) {
    sliced = sliced.slice(0, hyphenIndex);
  } else if (plusIndex > -1) {
    sliced = sliced.slice(0, plusIndex);
  }

  return {
    dateString: sliced.trim(),
    epoch,
  };
};

const buildEmailFormatMapper = contextObject => ({ response = {} }) => {
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
    },
    id,
    threadId,
    snippet,
  } = response;

  let relevantHeaders;
  try {
    relevantHeaders = headers.reduce((headerMap, headerObject) => {
      const { name, value } = headerObject;

      if (TARGET_HEADERS_SET.has(name)) {
        const headerMapCopy = { ...headerMap };

        if (name === RECEIVED) {
          const { dateString, epoch } = extractDateStringFromReceivedHeader(value);
          headerMapCopy.date = dateString;
          headerMapCopy.epoch = epoch;
        }
        headerMapCopy[name] = value;
        return headerMapCopy;
      }
      return headerMap;
    }, {});
  } catch (err) {
    console.error('error during headers reduce:', error);
  }

  let relevantBodyParts;
  try {
    relevantBodyParts = parts.reduce((list, bodyObject) => {
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
  } catch (err) {
    console.error('error during body reduce:', err);
  }

  return {
    headers: relevantHeaders,
    body: relevantBodyParts.join(''),
    id,
    threadId,
    snippet,
  };
};

// TODO - implement
const isEmailOnEdgeDate = (emailObject, lastScanDateString) => {
  const { date, epoch } = emailObject;
  // const nowAsDateString = nowMomentObject.format('MM/DD/YYYY');

  const isSameDate = date === lastScanDateString;
  return isSameDate;
};

const buildEmailScanReducer = (context) => {
  const {
    allEntities = [],
    allContacts = [],
    allJobListings = [],
    lastEmailScan = {},
    currentUnrecognizedEmails = [],
    edgeDateEmails,
    now,
  } = context;

  const entityNames = allEntities.map(({ name }) => name);
  const entityNameSet = new Set(entityNames);

  // TODO - there should be a `getStructuredId` function to standardize making this
  // lowercaseName_email string id
  const contactStructuredIds = allContacts.map(({ name, email }) => (
    `${name}_${email}`
  ));
  const contactIdSet = new Set(contactStructuredIds);

  const edgeDateEmailIds = edgeDateEmails.map(({ email_id: id }) => id);
  const edgeDateEmailIdSet = new Set(edgeDateEmailIds);

  const unrecognizedEmailIds = unrecognizedEmails.map(({ email_id: id }) => id);
  const unrecognizedEmailIdSet = new Set(unrecognizedEmailIds);

  return (accumulationObject, emailObject, index) => {
  // getFormattedIdFromName is your util for getting ids from company name

    const {
      newMessagesOnEdgeDate = [],
      entitiesToCreate = [],
      contactsToCreate = [],
      jobSearchActionsToCreate = [],
      unrecognizedEmails = [],
    } = accumulationObject;
    const {
      headers: {
        date,
        From: sentBy,
        To: to,
      },
      body: emailBody,
      id,
      threadId,
      snippet, // TODO - snippet needed? Consider need for snippet vs. potential privacy concerns (if stored).
    } = emailObject;
    const {
      last_email_scan_date: lastScanDateString,
      last_scan_epoch: lastScanEpoch,
    } = lastEmailScan;

    if (index === 0) {
      console.log('1st obj of email reducer:', emailObject);
    }

    const newMessagesOnEdgeDateCopy = newMessagesOnEdgeDate.slice();
    const isOnEdgeDate = isEmailOnEdgeDate(emailObject, lastScanDateString);

    if (isOnEdgeDate) {
      // skip if scanned last time
      if (edgeDateEmailIdSet.has(id)) {
        return accumulationObject;
      }
      newMessagesOnEdgeDateCopy.push(emailObject);
    }

    const isIndeed = sentBy.includes(INDEED_APPLICATION_NOTIFY_ADDRESS);
    const isMonster = false; // sentBy.includes(MONSTER_NOTIFY_ADDRESS);
    const isLinkedin = false; // sentBy.includes(LINKEDIN_NOTIFY_ADDRESS);


    // `scanIndeedEmail` and other site-specific scan functions should return this schema:
    // { jobTitle: string, entity: string, location: string, errors: string[] }
    if (isIndeed) {
      const scannedEmail = scanIndeedEmail(emailBody, index);
      jobSearchActionsToCreate.push({
        ...scannedEmail,
        actionType: 'indeed_application' // TODO - this should be a CONSTANT
      });
    } else if (isMonster) {
      // TODO - implement, should not be unrecognized
      unrecognizedEmails.push({ id, snippet, threadId });
    } else if (isLinkedin) {
      // TODO - implement, should not be unrecognized
      unrecognizedEmails.push({ id, snippet, threadId });
    } else {
      // default behavior: store email id as an unrecognized email, but NOT the email's content
      // snippet is witheld for privacy reasons
      unrecognizedEmails.push({ id, threadId });
    }

    return {
      ...accumulationObject,
      newMessagesOnEdgeDate: newMessagesOnEdgeDateCopy,
    };
  }
};

// TODO - how do we handle edge date emails if a scan is run twice in the same day?
// should the job exit if run same _day_ as last scan?
export const scanEmails = async (pgFunctions, redisFunctions, userId) => {
  console.log('scanEmails is running...');

  let credentialsObject;
  let token;
  try {
    const { rows: [oauthToken] = [] } = await pgFunctions.getOAuthTokenForUserId(userId);
    token = oauthToken;

    const { rows: [creds] = [] } = await pgFunctions.getCredentials();
    credentialsObject = creds;
  } catch (err) {
    console.log(`error getting credentials: <error>${err.message}</error>`);
    process.exit(1);
  }

  if (!credentialsObject) {
    console.error('no credentials found in db');
    process.exit(1);
  }

  if (!token || !token.refresh_token) {
    console.error('no refresh token data found in db');
    process.exit(1);
  }

  const accessToken = token.access_token;

  let refreshedToken;
  try {
    const tokenIsExpired = await isTokenExpiredByAPICheck(accessToken);

    if (tokenIsExpired) {
      console.log('token, expired, refreshing token before email scan...');
      refreshedToken = await refreshToken(credentialsObject, token, userId);

      if (!refreshedToken) {
        console.log('refreshedToken:', refreshedToken);
        console.error('something wrong with refreshedToken.');
        return process.exit(1);
      }
      await pgFunctions.insertRefreshedToken(refreshedToken, userId);
    } else {
      console.log('token is valid,', token);
      refreshedToken = token;
    }
  } catch (error) {
    console.log(`error running auth validations: <error>${error}</error>`);
  }

  let lastEmailScan;
  try {
    const { rows: [lastScan] } = await pgFunctions.getLastEmailsScanForUserId(userId);
    lastEmailScan = lastScan;
  } catch (error) {
    console.log(`error running getLastEmailsScanForUserId: <error>${error}</error>`);
  }

  const {
    last_scan_epoch: lastScanEpoch,
    last_email_scan_date: lastScanString,
  } = lastEmailScan;

  console.log('lastEmailScan', lastEmailScan);

  let response;
  let error;
  try {
    const {
      response: gmailMessageResponse,
      error: gmailMessageError
    } = await listGmailMessages(refreshedToken, lastScanString);
    response = gmailMessageResponse;
    error = gmailMessageError;
  } catch (error) {
    console.log(`error trying to listGmailMessages: ${error.message}`);
  }

  const { messages } = response;

  if (!messages) {
    console.log('ERROR, messages is falsy. response:', response);
    process.exit(1);
  }

  if (error) {
    console.error(`RUH ROH, error: <error>${error}</error>`);
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

  let formattedEmailObjects;
  try {
  // formattedEmailObjects are being processed for `emailReducer` coming up
    formattedEmailObjects = messageObjects.map(emailFormatMapper);
  } catch (err) {
    console.error('scanEmails got an error during messageObjects.map:', err);
    return process.exit(1);
  }

  const { rows: allEntities } = await pgFunctions.getAllJobEntities();

  // TODO - jobSearchContact has an EAV table, query it too an nest the data in objects 
  const { rows: allContacts } = await pgFunctions.getAllJobContactsForUserId(userId);
  const { rows: allJobListings } = await pgFunctions.getAllJobListings();

  // TODO - need edge date emails just for emails within X seconds of epoch comparison value 
  const { rows: edgeDateEmails } = await pgFunctions.getEdgeDateEmailsForUserId(userId);
  const { rows: currentUnrecognizedEmails } = await pgFunctions.getUnrecognizedEmailsForUserId(userId);


  const accumulator = {
    newMessagesOnEdgeDate: [],
    entitiesToCreate: [],
    contactsToCreate: [],
    jobSearchActionsToCreate: [],
    unrecognizedEmails: [],
    edgeDateEmails: [],
  };

  const now = moment();
  const jobRunningOnSameDayAsLastRun = now.format('MM/DD/YYYY') === lastScanString;

  const context = {
    allEntities,
    allContacts,
    allJobListings,
    lastEmailScan,
    currentUnrecognizedEmails,
    lastScanEpoch,
    lastScanString,
    now,
    jobRunningOnSameDayAsLastRun,
    edgeDateEmails,
  };

  const emailScanReducer = buildEmailScanReducer(context);
  const dbOperationsObject = formattedEmailObjects.reduce(emailScanReducer, accumulator);

  const {
    newMessagesOnEdgeDate = [],
    entitiesToCreate = [],
    contactsToCreate = [],
    jobSearchActionsToCreate = [],
  } = dbOperationsObject;

  console.log('edgeDateEmails:', edgeDateEmails);
  console.log('newMessagesOnEdgeDate:', newMessagesOnEdgeDate);
  console.log('entitiesToCreate', entitiesToCreate);
  console.log('jobSearchActionsToCreate', jobSearchActionsToCreate);

  // TODO - do I need this check? Can I safely delete old edge date emails now that I have epoch values?
  if (!jobRunningOnSameDayAsLastRun) {
    // wipe old records in edge_date_emails
    // then, add `newMessagesOnEdgeDate` to table.
  }



  // TODO - table edge_date-emails should be wiped if job is NOT being run on same date as last scan.
  // BUT if the run date is the same as the last scan, then the edge date emails should just be ADDED,
  // with no wipe of previous records

  // TODO =>
  // create entities
  // create contacts
  // create job search actions

  // TODO =>
  // create domain name mappings to contacts?

  // TODO =>
  // add last email scan row

  process.exit(0);
};

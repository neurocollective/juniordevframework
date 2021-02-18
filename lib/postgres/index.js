/* eslint-disable */
import { Client } from 'pg';
import moment from 'moment';
import CONSTANTS from '../constants';

const {
  CREDENTIALS_ACCESS_KEYS: {
    INSTALLED,
    WEB,
  },
} = CONSTANTS;

const {
  env: {
    SCHEMA_VERSION = 'v2'
  }
} = process;

import versionedQueries from './queries';

const {
  [SCHEMA_VERSION]: {
    queries,
    queryBuilders,
    createTableQueries
  }
} = versionedQueries;

const {
  getAllJobListingsQuery,
  insertUsersQuery,
  insertSeedJobListingsQuery,
  getAllUserIdsQuery,
  getCredentialsQuery,
  getAllJobEntitiesQuery,
} = queries;
const {
  buildGetAllUserJobListingsByIdQuery,
  buildGetJobListingDataForUserQuery,
  buildGetOAuthTokenForUserId,
  buildGetUserIdForEmail,
  buildInsertTokenQuery,
  buildInsertCredentialsQuery,
  buildInsertRefreshedTokenQuery,
  buildUpdateTokenForUserIdQuery,
  buildGetEmailForUserId,
  buildInsertEmailScanRecordQuery,
  buildGetjobContactsForUserQuery,
  buildGetLastEmailsScanForUserIdQuery,
  buildGetEdgeDateEmailsForUserIdQuery,
  buildGetUnrecognizedEmailsForUserIdQuery,
} = queryBuilders;

const buildInsertQueryFromJobListingResultObjects = (jobListingsResultsArray) => {
  const insertQuery = jobListingsResultsArray.reduce((queryString, jobListingObject, index, { length: size }) => {
    const lastIndex = size - 1;
    const {
      company,
      jobTitle,
      location,
      url,
      jobBoard
    } = jobListingObject;

    if (!company) {
      console.log(`missing company string, for jobTitle '${jobTitle}' at '${company}'`);
    }

    if (!jobTitle) {
      console.log(`missing jobTitle string, for jobTitle '${jobTitle}' at '${company}'`);
    }

    if (!location) {
      console.log(`missing location string, for jobTitle '${jobTitle}' at '${company}'`);
    }

    if (!url) {
      console.log(`missing url string, for jobTitle '${jobTitle}' at '${company}'`);
    }

    const suffix = (lastIndex === index) ? ';' : ',';

    const formattedValues = `(nextval('job_listing_id_seq'),'${company}','${jobTitle}','${location}',now(),'${jobBoard}','${url}',now())`;

    return `${queryString}${formattedValues}${suffix}`;
  }, 'INSERT INTO job_listing VALUES');

  return `BEGIN TRANSACTION;${insertQuery}END TRANSACTION;`;
};

const buildInsertQueryFromListings = (userListingsToAdd) => {
  const userListingEntries = Array.from(userListingsToAdd.entries());

  const fullInsertQuery = userListingEntries.reduce((queryString, [userId, listingIdsToAddSet], userListIndex) => {
    const lastUserIdIndex = userListingEntries.length - 1;

    const listingIdsArray = Array.from(listingIdsToAddSet);
    const fullQueryStringForUserId = listingIdsArray.reduce((subQueryString, listingId, listingIdIndex) => {
      const lastListingIdIndex = listingIdsArray.length - 1;
      const isLastIndex = userListIndex === lastUserIdIndex
        && lastListingIdIndex === listingIdIndex;

      const suffix = (isLastIndex) ? ';' : ',';

      const formattedValues = `(nextval('user_job_listing_id_seq'),${userId},'${listingId}')`;

      return `${subQueryString}${formattedValues}${suffix}`;
    }, '');

    return `${queryString}${fullQueryStringForUserId}`;
  }, 'INSERT INTO user_job_listing VALUES ');

  const thereIsDataToinsert = fullInsertQuery.includes('(');
  if (!thereIsDataToinsert) {
    return '';
  }

  return `BEGIN TRANSACTION;${fullInsertQuery}END TRANSACTION;`;
};

// All dbFunctions return a promise for pg's Result object
const buildDbFunctions = (client) => {
  if (!client || !client.query || typeof client.query !== 'function') {
    throw new Error('invalid client passed to buildDbFunctions');
  }
  return {
    createTables: async () => { // TODO - make a transaction?
      const queryNames = Object.keys(createTableQueries);

      await client.query('BEGIN;');

      for (let i = 0; i < queryNames.length; i++) {
        const name = queryNames[i];
        const query = createTableQueries[name];

        try {
          console.log(`running query ${name}`);
          await client.query(query);
        } catch (err) {
          console.error(`failed during ${name}()`);
          console.error(err);

          await client.query('ROLLBACK;');
          process.exit(1);
        }
      }

      await client.query('COMMIT;');
    },
    insertSeedDataIntoTables: async (credentialsObject, tokenObject, gmail) => {
      console.log('seeding...');
      console.log('credentials:', credentialsObject);

      let credentialsAccessKey = INSTALLED;

      if (!credentialsObject[credentialsAccessKey]) {
        credentialsAccessKey = WEB;
      }

      if (!credentialsObject[credentialsAccessKey]) {
        console.error(`neither credentials.${INSTALLED} nor credentials.${WEB} exist inside credentials object!`);
        process.exit(1);
      }

      const {
        [credentialsAccessKey]: {
          client_id,
          client_secret,
          redirect_uris
        }
      } = credentialsObject;

      // TODO - these value should be encrypted, a decryption step will be required here
      const insertCredentialsQuery = buildInsertCredentialsQuery(client_id, client_secret, redirect_uris.join(','));

      await client.query(insertCredentialsQuery);

      let gmailObjectValid;
      let email;
      let firstName;
      let lastName;

      try {
        ({ email, firstName, lastName } = gmail);
        gmailObjectValid = Boolean(email && firstName && lastName);
      } catch (e) {
        gmailObjectValid = false;
      }

      if (tokenObject && gmailObjectValid) {
        // insert new user w/ gmail object

        const query = queryBuilders.buildInsertUserQuery(email, firstName, lastName);
        await client.query(query);


        const insertTokenQuery = buildInsertTokenQuery(tokenObject, 1);
        await client.query(insertTokenQuery);
        return;
      }
      console.log('WARNING: invalid token.json or gmail.json, not inserting users or tokens');
    },
    insertJobListingResults: (jobListingResultObjectsArray) => {
      const query = buildInsertQueryFromJobListingResultObjects(jobListingResultObjectsArray);
      return client.query(query);
    },
    insertToken: (tokenObject, userId) => {
      const query = buildInsertTokenQuery(tokenObject, userId);
      return client.query(query);
    },
    insertRefreshedToken: (tokenObject, userId) => {
      const query = buildInsertRefreshedTokenQuery(tokenObject, userId);
      return client.query(query);
    },
    updateTokenValueForUser: (token, id) => client.query(buildUpdateTokenForUserIdQuery(token, id)),
    getAllJobListings: () => client.query(getAllJobListingsQuery),
    getAllUserIds: () => client.query(getAllUserIdsQuery),
    getAllJobEntities: () => client.query(getAllJobEntitiesQuery),
    disconnect: () => client.end(),
    getUserListings: (id) => {
      const query = buildGetAllUserJobListingsByIdQuery(id);
      return client.query(query);
    },
    // irrelevant in v2 schema?
    // getListingsForUser: (id) => {
    //   const query = buildGetJobListingDataForUserQuery(id);
    //   return client.query(query);
    // },
    getAllJobContactsForUserId: (userId) => {
      const query = buildGetjobContactsForUserQuery(userId);
      return client.query(query);
    },
    getOAuthTokenForUserId: (id) => {
      const query = buildGetOAuthTokenForUserId(id);
      return client.query(query);
    },
    getCredentials: () => {
      const query = getCredentialsQuery;
      return client.query(query);
    },
    getUserIdForEmail: (email) => {
      const query = buildGetUserIdForEmail(email);
      return client.query(query);
    },
    getEmailForUserId: (userId) => {
      const query = buildGetEmailForUserId(userId);
      return client.query(query);
    },
    insertUserListingsFromGeneratedQuery: (query) => client.query(query), // still needed?
    executeQuery: (query) => client.query(query),
    insertNewUser: (email, firstName, lastName, hashedPassword) => {
      const query = queryBuilders.buildInsertUserQuery(email, firstName, lastName, hashedPassword);
      return client.query(query);
    },
    beginTransaction: () => client.query('BEGIN;'),
    commitTransaction: () => client.query('COMMIT;'),
    rollbackTransaction: () => client.query('ROLLBACK;'),
    insertEmailScanRecord: (userId, unixEpoch) => {
      const query = buildInsertEmailScanRecordQuery(userId, unixEpoch);
      return client.query(query);
    },
    getLastEmailsScanForUserId: (userId) => {
      const query = buildGetLastEmailsScanForUserIdQuery(userId);
      return client.query(query);      
    },
    getEdgeDateEmailsForUserId: (userId) => {
      const query = buildGetEdgeDateEmailsForUserIdQuery(userId);
      return client.query(query);
    },
    getUnrecognizedEmailsForUserId: (userId) => {
      const query = buildGetUnrecognizedEmailsForUserIdQuery(userId);
      return client.query(query);      
    }
  };
};

const bootstrapPostgresFunctions = (Client, connectionString) => {
  let client;

  if (connectionString) {
    client = new Client({ connectionString });
  } else {
    console.log('postgres client using local defaults');
    client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'test',
      port: 5432
    });
  }

  console.log('postgres client connecting...');
  client.connect((err) => {
    if (err) {
      console.error('postgres connection error:', err.message);
      console.error(err.stack);
      process.exit(1);
    } else {
      console.log('postgres connected successfully.');
    }
  });
  return buildDbFunctions(client);
};

export {
  bootstrapPostgresFunctions,
  buildInsertQueryFromJobListingResultObjects,
  buildInsertQueryFromListings,
  buildDbFunctions
};
 
/* eslint-disable */
const {
  CONTACT_ACTION_TYPES: {
    EMAIL,
    LINKEDIN,
    PHONE,
    TEXT,
    INTERNET,
    IN_PERSON    
  },
  TABLES: {
    JOB_LISTING,
    APP_USER,
    USER_JOB_LISTING,
    JOB_SEARCH_CONTACT,
    CONTACT_ACTION,
    USER_PREFERENCES,
    USER_JOB_FILTERS,
    OAUTH_TOKEN,
    OAUTH_CREDENTIALS,
    EMAIL_SCAN_RECORD
  }
} = require('../../constants');
const createTableQueries = require('./create_tables');
const queryBuilders = require('./builders');

// create queries

// NOTE: raw values in createJobListingTableQuery are unformatted as they appeared in source, for later display
// company_name, location, job_title are expected to have been formatted prior to insert
// TODO - should there be a constraint on the non-raw values that disallows space characters?

// TODO - SQL injection risk present, queries need to be refactored to send parameters separately
/*
const createJobListingTableQuery = `
  CREATE TABLE ${JOB_LISTING} (
    id serial PRIMARY KEY,
    company_name text NOT NULL,
    job_title text NOT NULL,
    location text NOT NULL,
    raw_company_name text NOT NULL,
    raw_job_title text NOT NULL,
    raw_location text NOT NULL,
    discover_date timestamp NOT NULL,
    job_board text NOT NULL,
    apply_url text NOT NULL,
    last_posting_date timestamp NOT NULL,
    inactive_date timestamp,
    UNIQUE (company_name, job_title, location)
  );
`;

const createUserTableQuery = `
  CREATE TABLE ${APP_USER} (
    id serial PRIMARY KEY,
    email text UNIQUE,
    hashed_password text, -- allowed as null for now, in case we need a password later
    create_date timestamp NOT NULL,
    first_name text,
    last_name text,
    deactivate_date timestamp
  );
`;

const createUserJobListingTableQuery = `
  CREATE TABLE ${USER_JOB_LISTING} (
    id serial PRIMARY KEY,
    user_id integer REFERENCES ${APP_USER}(id),
    ${JOB_LISTING}_id integer REFERENCES ${JOB_LISTING}(id),
    date_applied timestamp,
    response_date timestamp, -- if a response occurs, should also become a contact
    ignored_date timestamp
  );
`;

// DETERMINATION - an application is not a contact_action. It might lead to one, but it is not a contact itself

const createContactTableQuery = `
  CREATE TABLE ${JOB_SEARCH_CONTACT} (
    id serial PRIMARY KEY,
    user_id integer REFERENCES ${APP_USER}(id),
    name text,
    email text,
    company text
  );
`;

// action_type = 'internet' is a catch-all for talking via an app platform other than linkedin
const createContactActionQuery = `
  CREATE TABLE ${CONTACT_ACTION} (
    id serial PRIMARY KEY,
    contact_id integer REFERENCES ${APP_USER}(id),
    action_type string NOT NULL,
    action_date timestamp,
    action_notes text
    CHECK (
      action_type = '${EMAIL}' OR action_type = '${PHONE}' OR action_type = '${IN_PERSON}'
      OR action_type = '${TEXT}' OR action_type = '${LINKEDIN}' OR action_type = '${INTERNET}'
    );
  );
`;

const createUserPreferencesTableQuery = `
  CREATE TABLE ${USER_PREFERENCES} (
    id serial PRIMARY KEY,
    user_id integer REFERENCES ${APP_USER}(id),
    preferred_job_title text
  );
`;

const createUserJobFiltersTableQuery = `
  CREATE TABLE ${USER_JOB_FILTERS} (
    id serial PRIMARY KEY,
    user_id integer REFERENCES ${APP_USER}(id),
    filter text NOT NULL --this should be a formatted string of blacklisted key/value pairs?
  );
`;


// values access_token and refresh_token should be encrypted at rest in the future
// NOTE: refresh token being ignored for now, leaving in table in case needed in future
const createOAuthTokenTableQuery = `
  CREATE TABLE ${OAUTH_TOKEN} (
    id serial PRIMARY KEY,
    user_id integer REFERENCES ${APP_USER}(id),
    token_type text NOT NULL,
    scope text NOT NULL,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    expires_in integer NOT NULL,
    received_time_log timestamp NOT NULL,
    UNIQUE (user_id)
  );
`;

const createOrphanedOAuthTokenTableQuery = `
  CREATE TABLE orphaned_${OAUTH_TOKEN} (
    verified_email text PRIMARY KEY,
    token_type text NOT NULL,
    scope text NOT NULL,
    access_token text NOT NULL,
    refresh_token text,
    expires_in integer NOT NULL,
    received_time_log timestamp NOT NULL
  );
`;

const createEmailScanRecordTableQuery = `
  CREATE TABLE ${EMAIL_SCAN_RECORD} (
    id serial PRIMARY KEY,
    user_id integer REFERENCES ${APP_USER}(id),
    last_scan timestamp NOT NULL,
    UNIQUE (user_id)
  );
`;

// client_secret MUST be encrypted at rest in the future. probably should encrypt redirect_uris as well
const createOAuthCredentialsTableQuery = `
  CREATE TABLE ${OAUTH_CREDENTIALS} (
    client_id text PRIMARY KEY,
    client_secret text NOT NULL,
    redirect_uris text NOT NULL -- comma-separated list of uris
  );
`;

*/

// insert queries

const insertSeedJobListingsQuery = `
  INSERT INTO ${JOB_LISTING} VALUES (
    nextval('${JOB_LISTING}_id_seq'),
    'giga_firm',
    'open source infiltrator',
    'nyc',
    now(),
    'indeed.com',
    now()
  ), 
  (
    nextval('${JOB_LISTING}_id_seq'),
    'douchr',
    'ten exxer',
    'nyc',
    now(),
    'indeed.com',
    now()
  );
`;

const insertUsersQuery = `
  INSERT INTO ${APP_USER} VALUES
  (
    nextval('${APP_USER}_id_seq'),
    'johny@johnnymccodes.com',
    'pw',
    now()
  );
`;

// read queries

const getAllJobListingsQuery = `
  SELECT * from ${JOB_LISTING};
`;

const getAllUserIdsQuery = `
  SELECT id FROM ${APP_USER};
`;

const getCredentialsQuery = `SELECT * FROM ${OAUTH_CREDENTIALS};`;

// queryBuilders

/*
const queryBuilders = {};

// app is ignoring hashedPassword, google oauth is the source of identity truth (for now)
queryBuilders.buildInsertUserQuery = (email, firstName = '', lastName = '', hashedPassword = 'pw') => `
  INSERT INTO ${APP_USER} VALUES(
    nextval('${APP_USER}_id_seq'),
    '${email}',
    '${hashedPassword}',
    now(),
    '${firstName}',
    '${lastName}'
  ) RETURNING id;
`;

queryBuilders.getAllTokensForUser = userId => `
  SELECT * FROM ${OAUTH_TOKEN} where user_id = ${userId};
`;

queryBuilders.buildGetAllUserJobListingsByIdQuery = (userId) => `
  SELECT * from ${USER_JOB_LISTING} where user_id = ${userId};
`;

queryBuilders.buildGetAllUserJobFiltersByIdQuery = (userId) => `
  SELECT * from ${USER_JOB_LISTING} where user_id = ${userId};
`;

queryBuilders.buildInsertTokenQuery = (tokenObject, userId) => {
  
  if (!tokenObject || !userId) {
    throw new Error('queryBuilders.buildInsertTokenQuery requires two arguments: tokenObject, userId.');
  }

  // ignoring refresh token for now, but row still exists in table, in case it will be supported in the future
  const {
    token_type,
    scope,
    access_token,
    refresh_token,
    expires_in,
  } = tokenObject;

  if (!token_type || !scope || !access_token || !expires_in) {
    throw new Error('queryBuilders.buildInsertTokenQuery received an incomplete tokenObject.');
  }

  const formattedScope = scope.split(' ').join(',');
  console.log('formattedScope', formattedScope);

  return `
    INSERT INTO ${OAUTH_TOKEN} VALUES (
      nextval('${OAUTH_TOKEN}_id_seq'),
      ${userId},
      '${token_type}',
      '${formattedScope}',
      '${access_token}',
      '${refresh_token}',
      '${expires_in}',
      now()
    );
  `;
};

queryBuilders.buildUpdateTokenForUserIdQuery = (tokenObject, userId) => {
  
  if (!tokenObject || !userId) {
    throw new Error('queryBuilders.buildInsertTokenQuery requires two arguments: tokenObject, userId.');
  }

  // ignoring refresh token for now, but row still exists in table, in case it will be supported in the future
  const {
    token_type,
    scope,
    access_token,
    // refresh_token,
    expires_in,
  } = tokenObject;

  if (!token_type || !scope || !access_token || !expires_in) {
    throw new Error('queryBuilders.buildInsertTokenQuery received an incomplete tokenObject.');
  }

  const formattedScope = scope.split(' ').join(',');
  console.log('formattedScope', formattedScope);

  return `
    UPDATE ${OAUTH_TOKEN} ot SET 
    access_token = '${access_token}',
    expires_in = ${expires_in},
    received_time_log = now(),
    token_type = '${token_type}',
    scope = '${formattedScope}'
    where ot.id = ${userId};
  `;
};

queryBuilders.buildInsertRefreshedTokenQuery = (tokenObject, userId) => {

  const {
    expires_in,
    access_token
  } = tokenObject;

  return `
    UPDATE ${OAUTH_TOKEN} SET 
    access_token = '${access_token}',
    expires_in = ${expires_in},
    received_time_log = now()
    where user_id = ${userId};
  `;
};

queryBuilders.buildInsertCredentialsQuery = (clientId, clientSecret, redirectURIsString) => {
  return `
    INSERT INTO ${OAUTH_CREDENTIALS} VALUES (
      '${clientId}',
      '${clientSecret}',
      '${redirectURIsString}'
    );
  `;
};

queryBuilders.buildInsertEmailScanRecordQuery = (userId, lastScanTime) => {
  return `
    INSERT INTO ${EMAIL_SCAN_RECORD} VALUES
    (
      nextval('${EMAIL_SCAN_RECORD}_id_seq'),
      ${userId},
      to_timestamp(${lastScanTime})
    );
  `;
};

// queryBuilders.buildUpdateEmailScanRecordQuery = (userId, lastScanTime) => {
//   return `
//     UPDATE ${EMAIL_SCAN_RECORD} SET last_scan=${lastScanTime}
//     WHERE user_id = ${userId};
//   `;
// };

queryBuilders.buildGetLatestEmailScanRecordQuery = (userId, lastScanTime) => {
  return `
    SELECT last_scan FROM ${EMAIL_SCAN_RECORD}
    WHERE user_id = ${userId}
    ORDER BY last_scan DESC
    LIMIT 1;
  `;
};

queryBuilders.buildGetJobListingDataForUserQuery = (userId) => `
  SELECT 
  jl.company_name, jl.job_title, jl.location, jl.raw_company_name, jl.raw_job_title, jl.raw_location, jl.job_board, jl.apply_url 
  from ${USER_JOB_LISTING} ujl
  JOIN job_listing jl 
  on ujl.job_listing_id = jl.id
  where user_id = ${userId};
`;

queryBuilders.buildGetOAuthTokenForUserId = (userId) => `
  SELECT *
  from ${OAUTH_TOKEN} oat
  where oat.user_id = ${userId};
`;

queryBuilders.buildGetUserIdForEmail = (email) => `
  SELECT id from ${APP_USER} ap where ap.email = '${email}';
`;

queryBuilders.buildGetEmailForUserId = (userId) => `
  SELECT email from ${APP_USER} where id = ${userId};
`;
*/

module.exports = {
  queries: {
    ...createTableQueries,
    getAllJobListingsQuery,
    insertUsersQuery,
    insertSeedJobListingsQuery,
    // createUserPreferencesTableQuery,
    // createJobListingTableQuery,
    // createUserTableQuery,
    // createUserJobListingTableQuery,
    // createOAuthTokenTableQuery,
    // createOAuthCredentialsTableQuery,
    // createEmailScanRecordTableQuery,
    getAllUserIdsQuery,
    getCredentialsQuery
  },
  queryBuilders
};
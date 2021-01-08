/* eslint-disable */
import CONSTANTS from '../../../constants';

const {
  EMAIL,
  LINKEDIN,
  PHONE,
  TEXT,
  INTERNET,
  IN_PERSON
} = CONSTANTS.CONTACT_ACTION_TYPES;

const {
  JOB_LISTING,
  APP_USER,
  USER_JOB_LISTING,
  JOB_SEARCH_CONTACT,
  CONTACT_ACTION,
  USER_PREFERENCES,
  USER_JOB_FILTERS,
  OAUTH_TOKEN,
  OAUTH_CREDENTIALS,
  EMAIL_SCAN_RECORD,
  JOB_SEARCH_ENTITY,
  JOB_SEARCH_ENTITY_EAV,
  JOB_SEARCH_ACTION,
} = CONSTANTS.TABLES;

// create queries

// NOTE: raw values in createJobListingTableQuery are unformatted as they appeared in source, for later display
// company_name, location, job_title are expected to have been formatted prior to insert
// TODO - should there be a constraint on the non-raw values that disallows space characters?

// TODO - SQL injection risk present, queries need to be refactored to send parameters separately

const createJobSearchEntityTableQuery = `
  CREATE TABLE ${JOB_SEARCH_ENTITY} (
    name text PRIMARY KEY,
    type text NOT NULL,
    create_date timestamp,
    primary_domain_name text, -- JOB_SEARCH_ENTITY_EAV may have others
    CHECK (
      type = 'company'
      OR type = 'other' -- TODO - need other types?
    )
  );
`;

// This table's primary purpose is to allow additional domain entries
// it may also be useful for company 'alias name' records
const createJobSearchEntityEavTableQuery = `
  CREATE TABLE ${JOB_SEARCH_ENTITY_EAV} (
    id serial PRIMARY KEY,
    entity_id int REFERENCES ${JOB_SEARCH_ENTITY}(name),
    key text NOT NULL,
    value text NOT NULL
  );
`;

const createJobListingTableQuery = `
  CREATE TABLE ${JOB_LISTING} (
    id serial PRIMARY KEY,
    entity_name text REFERENCES ${JOB_SEARCH_ENTITY}(name),
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
    UNIQUE (entity_name, job_title, location),
    CHECK (entity_name ~ '^[a-zA-Z0-9]') -- disallow spaces or special characters for entity_name
  );
`;

const createUserTableQuery = `
  CREATE TABLE ${APP_USER} (
    id serial PRIMARY KEY,
    email text UNIQUE,
    hashed_password text, -- allowed as null and not used for now. In case we need a password later.
    create_date timestamp NOT NULL,
    first_name text,
    last_name text,
    deactivate_date timestamp
  );
`;

// DETERMINATION - an application is not a contact_action. It might lead to one, but it is not a contact itself

const createJobSearchContactTableQuery = `
  CREATE TABLE ${JOB_SEARCH_CONTACT} (
    id serial PRIMARY KEY,
    user_id integer REFERENCES ${APP_USER}(id),
    name text,
    email text,
    entity_name text REFERENCES ${JOB_SEARCH_ENTITY}(name)
  );
`;

// TODO - move these to constants?
const ACTION_TYPE = 'action_type';
const COMMUNICATION_CHANNEL = 'communication_channel';
const APPLY = 'apply';
const FIRST_CONTACT = 'first-contact';
const FOLLOW_UP = 'follow-up';

// action_type = INTERNET is a catch-all for talking via an app platform other than linkedin
const createJobSearchActionTableQuery = `
  CREATE TABLE ${JOB_SEARCH_ACTION} (
    id serial PRIMARY KEY,
    contact_id integer REFERENCES ${APP_USER}(id),
    ${ACTION_TYPE} text NOT NULL,
    ${COMMUNICATION_CHANNEL} text NOT NULL,
    action_date timestamp,
    action_notes text,
    CHECK (
      ${ACTION_TYPE} = '${APPLY}'
      OR ${ACTION_TYPE} = '${FIRST_CONTACT}'
      OR ${ACTION_TYPE} = '${FOLLOW_UP}'
    ),
    CHECK (
      ${COMMUNICATION_CHANNEL} = '${EMAIL}'
      OR ${COMMUNICATION_CHANNEL} = '${PHONE}'
      OR ${COMMUNICATION_CHANNEL} = '${IN_PERSON}'
      OR ${COMMUNICATION_CHANNEL} = '${TEXT}'
      OR ${COMMUNICATION_CHANNEL} = '${LINKEDIN}'
      OR ${COMMUNICATION_CHANNEL} = '${INTERNET}'
    )
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

/* Example token json ->
  "access_token": "sdfasdf",
  "expires_in": 3599,
  "refresh_token": "adsfadsfasf",
  "scope": "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly",
  "token_type": "Bearer"
*/

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

export default {
  createJobSearchEntityTableQuery,
  createJobListingTableQuery,
  createUserTableQuery,
  createJobSearchContactTableQuery,
  createJobSearchActionTableQuery,
  createUserPreferencesTableQuery,
  createUserJobFiltersTableQuery,
  createOAuthTokenTableQuery,
  createOrphanedOAuthTokenTableQuery,
  createEmailScanRecordTableQuery,
  createOAuthCredentialsTableQuery
};

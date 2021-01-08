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
  EMAIL_SCAN_RECORD
} = CONSTANTS.TABLES;

// create queries

// NOTE: raw values in createJobListingTableQuery are unformatted as they appeared in source, for later display
// company_name, location, job_title are expected to have been formatted prior to insert
// TODO - should there be a constraint on the non-raw values that disallows space characters?

// TODO - SQL injection risk present, queries need to be refactored to send parameters separately

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
    action_type text NOT NULL,
    action_date timestamp,
    action_notes text
    CHECK (
      action_type = '${EMAIL}' OR action_type = '${PHONE}' OR action_type = '${IN_PERSON}'
      OR action_type = '${TEXT}' OR action_type = '${LINKEDIN}' OR action_type = '${INTERNET}'
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
  "access_token": "ya29.a0AfH6SMBJoVq04EneGvSg-BBINPgoJKXv_T5a-KYjjS10RAURdBJreDsRoeA0AZSiZeNEvl68ZHN_N3XAU-B3lZSkWa8y3t14lcg5iVZd-8R99pur8aRhiPNQOEYEiqFJVnP0H0sByIy-XgZpu875umGIWUh4cS6CbRM",
  "expires_in": 3599,
  "refresh_token": "1//0dU-cscmm8U6gCgYIARAAGA0SNwF-L9IryjzGnhd0VK5PhY9bc9acz6Mn3ybjCVzrF51V1UeBUGTS3SeBtWPagwxAbocGZJd2R1M",
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
  createJobListingTableQuery,
  createUserTableQuery,
  createUserJobListingTableQuery,
  createContactTableQuery,
  createContactActionQuery,
  createUserPreferencesTableQuery,
  createUserJobFiltersTableQuery,
  createOrphanedOAuthTokenTableQuery,
  createOAuthTokenTableQuery,
  createEmailScanRecordTableQuery,
  createOAuthCredentialsTableQuery
};

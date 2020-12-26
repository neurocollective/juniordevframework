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
} = require('../../../constants');

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

module.exports = queryBuilders;

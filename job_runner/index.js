const fs = require('fs');
const { Client } = require('pg');
const redis = require('redis');

const {
  createUserListings
} = require('./jobs/create_user_listings');
const {
  scanEmails
} = require('./jobs/email_scan');
const {
  JOB_COMMAND_CREATE_USER_LISTINGS,
  JOB_COMMAND_SCAN_EMAILS
} = require('../lib/constants');
const {
  bootstrapPostgresFunctions
} = require('../lib/postgres');
const {
  bootstrapRedisFunctions
} = require('../lib/redis');

const {
  env: {
    USER_ID: userId,
  }
} = process;

const main = async () => {
  if (!userId) {
    console.error('userId must be passed as an environment variable');
    process.exit(1);
  }
  const CONFIG = JSON.parse(fs.readFileSync(`${process.cwd()}/server/config.json`));
  const {
    dbConnection: connectionString = '',
    // tlsKeyPath,
    // tlsCertPath,
  } = CONFIG;

  const pgFunctions = await bootstrapPostgresFunctions(Client, connectionString);

  // TODO - is redis needed?
  const redisClient = redis.createClient();
  redisClient.on('connect', () => console.log('redis connected'));

  const redisFunctions = bootstrapRedisFunctions(redisClient);

  const [,, command] = process.argv;

  switch (command) {
    case JOB_COMMAND_CREATE_USER_LISTINGS: {
      return createUserListings(pgFunctions);
    }
    case JOB_COMMAND_SCAN_EMAILS: {
      return scanEmails(pgFunctions, redisFunctions, userId);
    }
    default: {
      console.error(`command ${command} not found, exiting.`);
    }
  }
  return 0;
};

main();

const {
  createUserListings
} = require('./jobs/create_user_listings');
const {
  scanEmails
} = require('./jobs/email_scan');
const {
  JOB_COMMAND_CREATE_USER_LISTINGS
} = require('../lib/constants');
const { Client } = require('pg');
const {
  bootstrapPostgresFunctions,
  bootstrapRedisFunctions
} = require('../lib/postgres');

const main = async () => {
  // console.log('HAI main()');

  const CONFIG = JSON.parse(fs.readFileSync(`${process.cwd()}/server/config.json`));

  const {
    dbConnection: connectionString = '',
    tlsKeyPath,
    tlsCertPath
  } = CONFIG;

  const pgFunctions = await bootstrapPostgresFunctions(Client, connectionString);

  // TODO - is redis needed?
  const redisClient = redis.createClient();
  redisClient.on('connect', () => console.log('redis connected'));

  const redisFunctions = bootStrapRedisFunctions(redisClient);

  const [,,command] = process.argv;

  switch(command) {
    case JOB_COMMAND_CREATE_USER_LISTINGS: {
      createUserListings(pgFunctions);
    }
    case JOB_COMMAND_SCAN_EMAILS: {
      scanEmails(pgFunctions, redisFunctions);
    }
    default: {
      console.error(`command ${command} not found, exiting.`);
    }
  }

};

main();
import fs from 'fs';
import { Client } from 'pg';
import redis from 'redis';

import {
  createUserListings
} from './jobs/create_user_listings';
import {
  scanEmails
} from './jobs/email_scan';
import CONSTANTS from '../lib/constants';
import {
  bootstrapPostgresFunctions
} from '../lib/postgres';
import {
  bootstrapRedisFunctions
} from '../lib/redis';

const {
  JOB_COMMAND_CREATE_USER_LISTINGS,
  JOB_COMMAND_SCAN_EMAILS
} = CONSTANTS;

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
  const CONFIG = JSON.parse(fs.readFileSync(`${__dirname}/../server/config.json`));
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

main()
.then(() => process.exit(0))
.catch(() => process.exit(1));

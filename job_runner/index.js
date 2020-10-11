const {
  createUserListings
} = require('./jobs/create_user_listings');
const {
  JOB_COMMAND_CREATE_USER_LISTINGS
} = require('../lib/constants');
const { Client } = require('pg');
const { bootstrapPostgresFunctions } = require('../lib/postgres');

const main = async () => {
  console.log('HAI main()');
  const pgFunctions = await bootstrapPostgresFunctions(Client);

  const [,,command] = process.argv;

  switch(command) {
    case JOB_COMMAND_CREATE_USER_LISTINGS: {
      createUserListings(pgFunctions);
    }
    default: {
      console.error(`command ${command} not found, exiting.`);
    }
  }

};

main();
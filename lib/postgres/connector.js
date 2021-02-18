import { Client } from 'pg';
import { bootstrapPostgresFunctions } from '.';
import { readJSONFromFile } from '../index';

export const insertAndSeed = async () => {
  // const {
  //   env: {
  //     USER_ID = 1
  //   }
  // } = process;

  console.log('inserting and seeding...');
  const dbFunctions = bootstrapPostgresFunctions(Client);

  await dbFunctions.createTables();

  let token;
  let credentials;
  let gmail;

  try {
    token = await readJSONFromFile(`${__dirname}/../../server/token.json`);
  } catch (error) {
    console.log('Failed to read token.json file. Error message is:', error.message);
    console.error('See README.md on how to get a valid token.json file');
  }

  try {
    credentials = await readJSONFromFile(`${__dirname}/../../server/credentials.json`);
  } catch (error) {
    console.log('Failed to read credentials.json file. Error message is:', error.message);
    console.error('See README.md on how to get a valid credentials.json file');
    console.error('credentials.json is required for seed. Fatal error, exiting.');
    process.exit(1);
  }

  try {
    gmail = await readJSONFromFile(`${__dirname}/../../server/gmail.json`);
  } catch (error) {
    console.log('Failed to read gmail.json file. Error message is:', error.message);
    console.error('See README.md on how to get a valid gmail.json file');
  }

  await dbFunctions.insertSeedDataIntoTables(credentials, token, gmail);

  console.log('insert and seed completed, disconnecting...');
  await dbFunctions.disconnect();

  process.exit(0);
};

export const getAllJobListings = async () => {
  const dbFunctions = bootstrapPostgresFunctions(Client);

  const resOne = await dbFunctions.getAllJobListings();
  const resTwo = await dbFunctions.getUserListings(0);

  console.log('job listings:', resOne.rows);
  console.log('user 0 listings:', resTwo.rows);

  await dbFunctions.disconnect();
};

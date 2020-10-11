const { Client } = require('pg');
const { bootstrapPostgresFunctions } = require('.');
const { readJSONFromFile } = require('../index.js');

const insertAndSeed = async () => {

	const {
		env: {
			USER_ID = 1
		}
	} = process;

	console.log('inserting and seeding...');
	const dbFunctions = bootstrapPostgresFunctions(Client);

	await dbFunctions.createTables();

	let token;
	let credentials;

	try {
		token = await readJSONFromFile(`${process.cwd()}/server/token.json`);
	} catch (error) {
		console.log('Failed to read token.json file. Error message is:', error.message);
	}

	try {
		credentials = await readJSONFromFile(`${process.cwd()}/server/credentials.json`);
	} catch (error) {
		console.log('Failed to read credentials.json file. Error message is:', error.message);
		console.error('Fatal, exiting. See README.md on how to get a valid credentials.json file');
		process.exit(1);
	}

	await dbFunctions.insertSeedDataIntoTables(credentials, token, USER_ID);
	// const res = await dbFunctions.getAllJobListings();

	// console.log('job listings:', res.rows);

	console.log('insert and seed completed, disconnecting...');
	await dbFunctions.disconnect();

	process.exit(0);
};

const getAllJobListings = async () => {
	const dbFunctions = bootstrapPostgresFunctions(Client);

	const resOne = await dbFunctions.getAllJobListings();
	const resTwo = await dbFunctions.getUserListings(0);

	console.log('job listings:', resOne.rows);
	console.log('user 0 listings:', resTwo.rows);

	await dbFunctions.disconnect();
};

module.exports = {
	insertAndSeed,
	getAllJobListings
};
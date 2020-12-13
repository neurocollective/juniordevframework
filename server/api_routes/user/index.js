const { Router } = require('express');
const { v4: uuid } = require('uuid');
const moment = require('moment');
const {
	COOKIES: {
		COOKIE_MAX_AGE,
		KEY: COOKIE_KEY
	}
} = require('../../lib/constants');
const {
	createSessionCookie,
	getAuthURLAndSendRedirectJSON
} = require('../../lib');
// const  {
//   env: {
//     REDIRECT_AUTH_URLS: redirectEnvValue = ''
//   }
// } = process;

// const REDIRECT_AUTH_URLS = redirectEnvValue.toLowerCase() == 'true' ? true : false;

const getUserRouter = (dbFunctions, redisFunctions, credentialsObject) => {

	const userRouter = Router();

	userRouter.post('/new', async (req, res) => {

		const {
			body: {
				email,
				firstName,
				lastName
			}
		} = req;

		console.log('sent:', email, firstName, lastName);
		if (!email) {
			return res.status(500).json({ error: 'email required' });
		}

		await dbFunctions.beginTransaction();

		let userId;
		try {
			const { rows: [newUser] } = await dbFunctions.insertNewUser(email, firstName, lastName);
			({ id: userId } = newUser);
		} catch (err) {
			console.error('signup error:', err);
			const failMessage = 'could not create new user';
			await dbFunctions.rollbackTransaction();
			return res.status(500).json({ error: failMessage });
		}

		try {
			const nowEpoch = moment().unix();
			const insertEmailScanRecordQuery = dbFunctions.insertEmailScanRecord(userId, nowEpoch);
		} catch (err) {
			console.error('create email scan record query error:', err);
			await dbFunctions.rollbackTransaction();
			return res.status(500).json({ error: failMessage });
		}

		await dbFunctions.commitTransaction();

		await createSessionCookie(res, redisFunctions, userId);

		const contextObject = { credentialsObject, userId, email };
    	return getAuthURLAndSendRedirectJSON(res, contextObject, 200);
	});

	return userRouter;
};

module.exports = getUserRouter;

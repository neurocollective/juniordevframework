const bootStrapRedisFunctions = (client) => {

	// making async to guarantee return value as Promise, docs are not clear
	const setKeyValue = async (key, value) => client.set(key, value);

	const getValueForKey = key => new Promise((resolve, reject) => {
		client.get(key, (err, reply) => {
			if (err || !reply) {
				return reject(err);
			}
			resolve(reply);
	  	});
	});

	const mapCookieAndUserId = (cookie, userId) => setKeyValue(cookie, userId);

	const getUserIdForCookie = (cookie) => getValueForKey(cookie);

	return {
		setKeyValue,
		getValueForKey,
		mapCookieAndUserId,
		getUserIdForCookie
	};
}

module.exports = { bootStrapRedisFunctions };
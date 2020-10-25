const bootStrapRedisFunctions = (client) => {

  // making async to guarantee return value as Promise, docs are not clear
  const setKeyValue = async (key, value) => {
    console.log('setValueForKey');
    return client.set(key, value);
  };

  const getValueForKey = key => new Promise((resolve, reject) => {
    console.log('getValueForKey');
    client.get(key, (err, reply) => {
      if (err) {
        console.log('rejecting, err is:', err, 'reply is', reply);
        return reject(err);
      }
      return resolve(reply);
    });
  });

  const getAllKeys = () => new Promise((resolve, reject) => {
    console.log('getAllKeys');
    client.keys('*', function (err, keys) {
      if (err) {
        return reject(err);
      }
      console.log('keys', keys);
      return resolve(keys);
    });
  });

  const mapCookieAndUserId = (cookie, userId) => setKeyValue(cookie, userId);

  const getUserIdForCookie = (cookie) => getValueForKey(cookie);

  return {
    setKeyValue,
    getValueForKey,
    getAllKeys,
    mapCookieAndUserId,
    getUserIdForCookie
  };
}

module.exports = { bootStrapRedisFunctions };
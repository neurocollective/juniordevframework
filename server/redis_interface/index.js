const {
  env: {
    TIME_TO_LIVE: envTTL
  }
} = process;

let TIME_TO_LIVE = 60 * 60;

if (envTTL) {
  TIME_TO_LIVE = Number(envTTL);
}

const bootstrapRedisFunctions = (client) => {
  const setKeyValue = (key, value) => new Promise((resolve, reject) => {
    // console.log('');
    client.set(key, value, 'EX', TIME_TO_LIVE, (err, statusString) => {
      if (err) {
        return reject(err);
      }
      return resolve(statusString);
    });
  });

  const set = setKeyValue;

  const getValueForKey = (key) => new Promise((resolve, reject) => {
    // console.log('getValueForKey');
    client.get(key, (err, reply) => {
      if (err) {
        console.log('rejecting, err is:', err, 'reply is', reply);
        return reject(err);
      }
      return resolve(reply);
    });
  });

  const get = getValueForKey;

  const getTTLForKey = (key) => new Promise((resolve, reject) => {
    // console.log('getValueForKey');
    client.ttl(key, (err, reply) => {
      if (err) {
        console.log('rejecting, err is:', err, 'reply is', reply);
        return reject(err);
      }
      return resolve(reply);
    });
  });

  const getAllKeys = () => new Promise((resolve, reject) => {
    // console.log('getAllKeys');
    client.keys('*', (err, keys) => {
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
    getUserIdForCookie,
    getTTLForKey,
    set,
    get
  };
};

export { bootstrapRedisFunctions };

const { Router } = require('express');
const {
  ROUTING: {
    SLASH_LOGIN,
    SLASH_OAUTH,
    SLASH_PAGELOAD,
    SLASH_USER
  }
} = require('../../lib/constants');

// const loginRoutes = require('./login');
// const pageLoadRoutes = require('./pageload');

const getLoginRoutes = require('./login');
const getPageLoadRoutes = require('./pageload');
const getOAuthRoutes = require('./oauth');
const getUserRoutes = require('./user');

const {
  env: {
    LOCAL_MODE
  }
} = process;

let local = false;
if (LOCAL_MODE && LOCAL_MODE.toLowerCase() === 'true') {
  local = true;
}

const { buildAuthMiddleware } = require('../middleware');

const getAPIRouter = (postgresFunctions, redisFunctions, credentialsObject) => {

  const apiRouter = Router();

  const authMiddleware = buildAuthMiddleware(postgresFunctions, redisFunctions, credentialsObject);

  const loginRoutes = getLoginRoutes(postgresFunctions, redisFunctions, credentialsObject);
  apiRouter.use(SLASH_LOGIN, loginRoutes);

  const oauthRoutes = getOAuthRoutes(postgresFunctions, redisFunctions, credentialsObject);
  apiRouter.use(SLASH_OAUTH, oauthRoutes);
  
  const pageLoadRoutes = getPageLoadRoutes(postgresFunctions, redisFunctions, credentialsObject);
  apiRouter.use(SLASH_PAGELOAD, authMiddleware, pageLoadRoutes);

  const userRoutes = getUserRoutes(postgresFunctions, redisFunctions, credentialsObject);
  apiRouter.use(SLASH_USER, userRoutes);

  // check values for given keys in redis
  if (local) {

    const redisRouter = Router();

    redisRouter.get('/get/:key', async (req, res) => {
      const {
        params: {
          key
        } = {}
      } = req;

      let value;
      try {
        value = await redisFunctions.getValueForKey(key);
      } catch (err) {
        console.error(err);
        return res.json({ error: 'ruh roh' });
      }
      return res.json({ [key]: value });
    });

    redisRouter.get('/ttl/:key', async (req, res) => {
      const {
        params: {
          key
        } = {}
      } = req;

      let ttl;
      try {
        ttl = await redisFunctions.getTTLForKey(key);
      } catch (err) {
        console.error(err);
        return res.json({ error: 'ruh roh' });
      }
      return res.json({ ttl });
    });

    redisRouter.get('/set/:key/:value', async (req, res) => {
      const {
        params: {
          key,
          value
        } = {}
      } = req;

      try {
        await redisFunctions.setKeyValue(key, value);
      } catch (err) {
        console.error(err);
        return res.json({ error: 'ruh roh' });        
      }
      return res.json({ [key]: value });
    });

    redisRouter.get('/all', async (req, res) => {
      let keys = null;
      try {
        keys = await redisFunctions.getAllKeys();
      } catch (err) {
        console.error('err', err);
        return res.json({ error: 'ruh roh' });        
      }
      return res.json({ allKeys: keys });
    });

    apiRouter.use('/redis', redisRouter);
  }

  return apiRouter;
};

module.exports = getAPIRouter;

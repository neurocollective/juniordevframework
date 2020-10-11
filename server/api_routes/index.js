const { Router } = require('express');

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
  // apiRouter.use(globalMiddleware);

  const loginRoutes = getLoginRoutes(postgresFunctions, redisFunctions, credentialsObject);
  apiRouter.use('/login', loginRoutes);

  const oauthRoutes = getOAuthRoutes(postgresFunctions, redisFunctions, credentialsObject);
  apiRouter.use('/oath', oauthRoutes);
  
  const pageLoadRoutes = getPageLoadRoutes(postgresFunctions, redisFunctions, credentialsObject);
  apiRouter.use('/pageload', authMiddleware, pageLoadRoutes);

  const userRoutes = getUserRoutes(postgresFunctions, redisFunctions, credentialsObject);
  apiRouter.use('/user', userRoutes);

  // check values for given keys in redis
  if (local) {
    apiRouter.get('/redis/get/:key', async (req, res) => {
      const {
        params: {
          key
        }
      } = req;

      const value = await redisFunctions.getValueForKey(key);
      return res.json({ [key]: value });
    });

    apiRouter.get('/redis/set/:key/:value', async (req, res) => {
      const {
        params: {
          key,
          value
        }
      } = req;

      await redisFunctions.setKeyValue(key, value);
      return res.json({ [key]: value });
    });
  }

  return apiRouter;
};

module.exports = getAPIRouter;

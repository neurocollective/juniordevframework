import express from 'express';
import cors from 'cors';
import redis from 'redis';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { Client } from 'pg';
import http from 'http';
import https from 'https';
import getAPIRoutes from './api_routes';
import {
  bootstrapPostgresFunctions
} from '../lib/postgres';
import {
  bootstrapRedisFunctions
} from '../lib/redis';

const app = express();

const CONFIG = JSON.parse(fs.readFileSync(`${__dirname}/config.json`));

const {
  dbConnection: connectionString = '',
  tlsKeyPath,
  tlsCertPath
} = CONFIG;

const postgresFunctions = bootstrapPostgresFunctions(Client, connectionString);

const redisClient = redis.createClient();
redisClient.on('connect', () => console.log('redis connected'));

const redisFunctions = bootstrapRedisFunctions(redisClient);

const {
  argv
} = process;

const useHTTP = !argv.find((arg) => arg.includes('--http'));

const HTTP_PORT = 80;
const HTTPS_PORT = 443;
let {
  env: {
    PORT = 3000,
    // eslint-disable-next-line prefer-const
    LOCAL_MODE
  }
} = process;

let local = false;
if (LOCAL_MODE && LOCAL_MODE.toLowerCase() === 'true') {
  local = true;
}

if (local) {
  console.log('Server starting in local mode.');
  console.log('Warning: local mode means some critical security features are OFF.');
  console.log('DO NOT expose local mode to public internet traffic!');
}

if (!useHTTP && !local) {
  PORT = HTTPS_PORT;
} else if (useHTTP && !local) {
  PORT = HTTP_PORT;
}

const useTLS = PORT === HTTPS_PORT;

let optionsForTLS;
if (useTLS) {
  optionsForTLS = {
    key: fs.readFileSync(tlsKeyPath),
    cert: fs.readFileSync(tlsCertPath)
  };
}

const bootServer = async () => {
  const { rows: [credentials] } = await postgresFunctions.getCredentials();
  console.log('credentials', credentials);

  // parsing middleware
  // TODO - this could be more targeted in middleware/index.js?
  // Avoiding unnecessary middleware could give small performance boost
  app.use((req, res, next) => {
    console.log('sanity check middleware');
    return next();
  });
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));

  if (!local) {
    app.use('/', express.static('public'));
  } else {
    // default CORS options:
    // {
    //   "origin": "*",
    //   "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    //   "preflightContinue": false,
    //   "optionsSuccessStatus": 204
    // }
    const corsOptions = { origin: ['http://localhost:8080', 'http://localhost:3000'] };
    const corsMiddleware = cors(corsOptions);
    const corsMiddlewareWithAllowCredentials = (req, res, next) => {
      res.set('Access-Control-Allow-Credentials', 'true'); // required for cross-origin cookie transfer, on client side
      corsMiddleware(req, res, next);
    };
    app.use(corsMiddlewareWithAllowCredentials);
  }

  // console.log(postgresFunctions);
  // console.log(redisFunctions);
  app.use('/api', getAPIRoutes(postgresFunctions, redisFunctions, credentials));

  if (useTLS) {
    https.createServer(optionsForTLS, app).listen(HTTPS_PORT, () => {
      console.log(`Express HTTPS server listening on port ${HTTPS_PORT}`);
    });
  } else {
    http.createServer(app).listen(PORT, () => {
      console.log(`Express HTTP server listening on port ${PORT}`);
    });
  }
};

export default bootServer;

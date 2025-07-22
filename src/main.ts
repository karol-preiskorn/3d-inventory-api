/**
 * @description API 3d-inventory. Project is a simple solution that allows you to build a spatial and database representation of all types of warehouses and server rooms.
 * @public
 */

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import figlet from 'figlet';
import fs from 'fs';
import helmet from 'helmet';
import https from 'https';
import methodOverride from 'method-override';
import morgan from 'morgan';
import morganBody from 'morgan-body';
import swaggerUi, { JsonObject } from 'swagger-ui-express';
import YAML from 'yaml';

import attributes from './routers/attributes';
import attributesDictionary from './routers/attributesDictionary';
import connections from './routers/connections';
import devices from './routers/devices';
import floors from './routers/floors';
import github from './routers/github';
import logs from './routers/logs';
import models from './routers/models';
import readme from './routers/readme';

import config from './utils/config';
import log from './utils/logger';
import { connectToCluster, connectToDb } from './utils/db';
import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';

const logger = log('index');

const PORT = config.PORT;

const HOST = config.HOST;

// Cloud Run configuration - use HTTP instead of HTTPS

const httpsOptions = {
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.crt')
};

const yamlFilename = process.env.API_YAML_FILE ?? './api.yaml';

const app = express();

// Initialize MongoDB connection
import type { MongoClient, Db } from 'mongodb';

let mongoClient: MongoClient;

let db: Db | undefined;

(async () => {
  try {
    mongoClient = await connectToCluster();
    db = connectToDb(mongoClient);
    logger.info('✅ MongoDB initialized successfully');
  } catch (error) {
    logger.error('❌ MongoDB initialization failed:', error);
    if (process.env.NODE_ENV === 'production') {
      // Don't exit in production, log the error and continue
      logger.error('Production: Running without database connection');
    }
  }
})();


app.use(cookieParser());
app.use(helmet());

try {
  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());

          return true;
        }
      }
    })
  );
} catch (error) {
  logger.error(`Error login in morgan: ${String(error)}`);
}

// Remove the manual CORS headers and replace with this:
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      // Local development
      'http://localhost:3001',
      'https://localhost:3001',
      'http://localhost:3000',
      'http://localhost:4200',
      'http://localhost:8080',
      'https://localhost:3000',
      'https://localhost:4200',
      'https://localhost:8080',

      // Cloud Run services
      'https://d-inventory-ui-wzwe3odv7q-ew.a.run.app',
      'https://d-inventory-api-wzwe3odv7q-ew.a.run.app',

      // Your custom domains
      'https://3d-inventory-api.ultimasolution.pl',
      'https://3d-inventory-ui.ultimasolution.pl'
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check for exact match or pattern match
    const isAllowed = allowedOrigins.some(allowed => {
      return allowed === origin;
    }) || /^https?:\/\/localhost:\d+$/.test(origin) || /^https:\/\/.*\.run\.app$/.test(origin) || /^https:\/\/.*\.ultimasolution\.pl$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-API-Key'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ['\'self\''],
    scriptSrc: ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\'', 'https:'],
    styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https:'],
    fontSrc: ['\'self\'', 'https:', 'data:'],
    imgSrc: ['\'self\'', 'data:', 'https:', 'blob:'],
    connectSrc: ['\'self\'', 'https:', 'wss:'],
    frameSrc: ['\'self\'', 'https:'],
    mediaSrc: ['\'self\'', 'https:'],
    objectSrc: ['\'none\''],
    baseUri: ['\'self\'']
  }
}));

app.use(express.json({ limit: '50mb' })); // Increase body size limit if needed
app.use(bodyParser.json()); // must parse body before morganBody as body will be logged

morganBody(app, {
  noColors: false,
  logReqDateTime: false,
  //dateTimeFormat: 'clf',
  logReqUserAgent: false,
  logIP: false,
  theme: 'darkened',
  stream: {
    write: (message: string) => {
      logger.info(message.trim());

      return true;
    }
  }
});

app.use(express.urlencoded({ extended: false }));

app.use(methodOverride());

// Register API routers
app.use('/readme', readme);
app.use('/logs', logs);
app.use('/devices', devices);
app.use('/models', models);
app.use('/attributes', attributes);
app.use('/attributesDictionary', attributesDictionary);
app.use('/connections', connections);
app.use('/floors', floors);
app.use('/github', github);

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Health check endpoint (required for Cloud Run)
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV,
    database: 'unknown',
    uptime: process.uptime()
  };

  try {
    if (mongoClient) {
      await mongoClient.db().admin().ping();
      health.database = 'connected';
    } else {
      health.database = 'not_initialized';
    }
  } catch {
    health.database = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.database === 'disconnected' ? 503 : 200;

  res.status(statusCode).json(health);
});

try {
  const file = fs.readFileSync(yamlFilename, 'utf8');

  const swaggerDocument = YAML.parse(file) as JsonObject;

  app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  logger.info(`Swagger api.yaml served successfully load ${JSON.stringify(swaggerDocument).length} bytes`);
} catch (err: unknown) {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const errorWithCode = err as { code?: string };

    if (errorWithCode.code === 'ENOENT') {
      logger.error(`File not found: ${yamlFilename}`);
    } else if (errorWithCode.code === 'EACCES') {
      logger.error(`No permission to file ${yamlFilename}`);
    } else if (err instanceof Error) {
      logger.error('Open swaggerUI exception: ' + err.message);
    } else {
      logger.error('Unknown error occurred.');
    }
  } else if (err instanceof Error) {
    logger.error('Open swaggerUI exception: ' + err.message);
  } else {
    logger.error('Unknown error occurred.');
  }
}

// OpenApi validation
try {
  app.use(
    OpenApiValidator.middleware({
      apiSpec: yamlFilename,
      validateRequests: true,
      validateResponses: true
    })
  );
  logger.info(`OpenApiValidator api.yaml served successfully from ${yamlFilename}`);
} catch (error) {
  logger.error(`OpenApiValidator: ${String(error)}`);
}

// Error-related middleware (404 and error handlers) grouped together for clarity

app.use((req: Request, res: Response) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    error: 'Not Found',
    status: 404
  });
});

// XHR client error handler
function xhrClientErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
    logger.error(`[main] Something failed. ${err.message}`);
    res.status(500).json({
      message: `[main] Something failed. ${err.message}`
    });
    next(err);
  } else {
    next(err);
  }
}

app.use(xhrClientErrorHandler);

app.use((err: Error, req: Request, res: Response) => {
  logger.error(`Unhandled error exception: ${err.message}. Stack: ${err.stack}`);
  res.status(500).json({
    message: `Internal Server Error - ${req.method} ${req.originalUrl}`,
    error: err.message,
    status: 500
  });
});

// Start the server
// Register error handler before listen
let server: HttpServer | HttpsServer;

if (process.env.NODE_ENV === 'production') {
  server = app.listen(Number(PORT), '0.0.0.0', () => {
    logger.info(
      figlet.textSync('\r\n\r\r\r\r\r3d-inventory-api GCP', {
        font: 'Mini',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 160,
        whitespaceBreak: true
      })
    );
    logger.info(`---- Server on GCP http://0.0.0.0:${PORT}`);
  });

  // Update signal handlers for HTTP server
  process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server.');
    server.close(() => {
      logger.debug('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server.');
    server.close(() => {
      logger.debug('HTTP server closed');
      process.exit(0);
    });
  });
} else {
  server = https.createServer(httpsOptions, app);

  server.on('error', (err: Error) => {
    logger.error(`Error listen on address https://${HOST}:${PORT}: ${String(err)}\nStack: ${err.stack}`);
  });

  server.listen(Number(PORT), HOST, () => {
    logger.info('\n' +
      figlet.textSync('3d-inventory-mongo-api DEV', {
        font: 'Mini',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 160,
        whitespaceBreak: true
      })
    );

    logger.info(`Server on DEV https://${HOST}:${PORT}`);
  });
  // Signal handlers for HTTPS server
  process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTPS server.');
    server.close(() => {
      logger.debug('HTTPS server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTPS server.');
    server.close(() => {
      logger.debug('HTTPS server closed');
      process.exit(0);
    });
  });
}
export default server;

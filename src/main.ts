/**
 * @description API 3d-inventory. Project is a simple solution that allows you to build a spatial and database representation of all types of warehouses and server rooms.
 * @public
 */

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import type { CorsOptions } from 'cors';
import cors from 'cors';
import { constants as cryptoConstants } from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import rateLimit from 'express-rate-limit';
import figlet from 'figlet';
import fs from 'fs';
import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';
import https from 'https';
import kleur from 'kleur';
import methodOverride from 'method-override';
import type { Db, MongoClient } from 'mongodb';
import morgan from 'morgan';
import morganBody from 'morgan-body';
import swaggerUi, { JsonObject } from 'swagger-ui-express';
import YAML from 'yaml';
import attributes from './routers/attributes';
import attributesDictionary from './routers/attributesDictionary';
import login from './routers/login';
import connections from './routers/connections';
import devices from './routers/devices';
import floors from './routers/floors';
import github from './routers/github';
import logs from './routers/logs';
import models from './routers/models';
import readme from './routers/readme';
import config from './utils/config';
import { connectToCluster, connectToDb } from './utils/db';
import getLogger from './utils/logger';

const logger = getLogger('main');

const proc = '[main]';

const PORT = config.PORT;

const HOST = config.HOST;

// Cloud Run configuration - use HTTP instead of HTTPS

let httpsOptions: https.ServerOptions = {
  secureOptions: cryptoConstants.SSL_OP_NO_SSLv3 | cryptoConstants.SSL_OP_NO_TLSv1 | cryptoConstants.SSL_OP_NO_TLSv1_1,
  honorCipherOrder: true,
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
  requestCert: true,
  rejectUnauthorized: false
};

if (process.env.NODE_ENV !== 'production') {
  try {
    httpsOptions = {
      ...httpsOptions,
      key: fs.readFileSync('./cert/server.key'),
      cert: fs.readFileSync('./cert/server.crt')
    };
  } catch (error) {
    logger.error(`${proc}SSL certificates not found, using HTTP only: ${error}`);
  }
}

const yamlFilename = process.env.API_YAML_FILE ?? './api.yaml';

export const app = express();

const allowedOrigins = [
  // Local development
  'http://localhost:4200',
  'https://localhost:4200',
  'http://localhost:8080',
  'https://localhost:8080',
  'http://127.0.0.1:8080',
  'https://127.0.0.1:8080',
  'http://0.0.0.0:8080',
  'https://0.0.0.0:8080',
  // Local Docker development
  'http://172.17.0.2:8080',
  'http://172.17.0.3:8080',
  'http://172.17.20.2:8080',
  'http://172.17.20.3:8080',
  // Cloud Run services
  'https://d-inventory-ui-wzwe3odv7q-ew.a.run.app',
  'https://d-inventory-api-wzwe3odv7q-ew.a.run.app',
  // Ultima Solution domains
  'https://3d-inventory-api.ultimasolution.pl',
  'https://3d-inventory-ui.ultimasolution.pl',
  // MongoDB Atlas
  'https://cluster0.htgjako.mongodb.net'
  // Add more allowed origins as needed
];

const LOCALHOST_ORIGIN_REGEX = /^https?:\/\/localhost:\d+$/;

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (typeof origin === 'undefined' || origin === null) {
      logger.info(`[CORS DEBUG] No origin header - allowing: ${origin}`);

      return callback(null, true);
    }

    const isAllowed =
      allowedOrigins.includes(origin) ||
      LOCALHOST_ORIGIN_REGEX.test(origin);

    if (isAllowed) {
      logger.info(`[CORS DEBUG] Origin allowed: ${origin}`);

      return callback(null, true);
    } else {
      logger.warn(`[CORS DEBUG] Origin blocked: ${origin}`);

      const corsError = new Error(`CORS policy: This origin is not allowed: ${origin}`);

      // @ts-expect-error: Assigning custom 'status' property to Error object for CORS handling
      corsError.status = 403;
      // @ts-expect-error Assigning custom 'origin' property to Error object for CORS handling
      corsError.origin = origin;

      return callback(corsError, false);
    }
  },
  credentials: true,
  methods: ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
  allowedHeaders: [
    'Accept',
    'Authorization',
    'Cache-Control',
    'Content-Type',
    'Origin',
    'X-API-Key',
    'X-Requested-With',
    'Bearer'
  ]
};


// Middleware for rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10), // Limit each IP to 100 requests per windowMs default
  message: { message: process.env.RATE_LIMIT_MESSAGE }
});

// Apply the rate limiter to all requests
app.use(limiter);

app.use(cors(corsOptions));

let mongoClient: MongoClient | null = null;

let db: Db | null = null;

(async () => {
  try {
    if (config.ATLAS_URI) {
      mongoClient = await connectToCluster();
      db = connectToDb(mongoClient);
      await db.admin().ping();
      //logger.info(`✅ MongoDB connected to database: ${config.DBNAME}`);
    } else {
      logger.warn('⚠️ No MongoDB URI provided, running without database');
    }
  } catch (error) {
    logger.error(`❌ MongoDB initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    if (process.env.NODE_ENV === 'production') {
      logger.error('Production: Running without database connection');
      mongoClient = null;
    } else {
      // Exit in development if MongoDB is required
      process.exit(1);
    }
  }
})();


app.use(cookieParser());
// app.use(helmet());

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
  logger.error(`${proc} Error login in morgan: ${String(error)}`);
}


// CSP configuration
// app.use(helmet.contentSecurityPolicy({
//   directives: {
//     defaultSrc: ['\'self\''],
//     scriptSrc: ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\'', 'https:'],
//     styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https:'],
//     fontSrc: ['\'self\'', 'https:', 'data:'],
//     imgSrc: ['\'self\'', 'data:', 'https:', 'blob:'],
//     connectSrc: ['\'self\'', 'https:', 'wss:'],
//     frameSrc: ['\'self\'', 'https:'],
//     mediaSrc: ['\'self\'', 'https:'],
//     objectSrc: ['\'none\''],
//     baseUri: ['\'self\''],
//     // Add a CSP violation reporting endpoint
//     reportUri: ['/csp-violation-report'] // Supported by most browsers
//     // reportTo: ['csp-endpoint'] // Modern reporting (requires additional configuration)
//   }
// }));

app.use(express.json({ limit: '50mb' })); // Increase body size limit if needed
app.use(bodyParser.json()); // must parse body before morganBody as body will be logged

// CSP violation reporting endpoint
app.post('/csp-violation-report', (req, res) => {
  logger.warn(`${proc} CSP Violation:`, req.body);
  res.status(204).end();
});

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
app.use('/login', login)

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Health check endpoint (required for Cloud Run)
app.get('/health', async (_req, res) => {
  const health: {
    status: string;
    timestamp: string;
    port: typeof PORT;
    environment: typeof process.env.NODE_ENV;
    uptime: number;
    database: 'unknown' | 'connected' | 'not_initialized' | 'disconnected';
    error: string | null;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    database: 'unknown',
    error: null
  };


  try {
    if (mongoClient) {
      await mongoClient.db(config.DBNAME).admin().ping();
      health.database = 'connected';
    } else {
      health.database = 'not_initialized';
      health.status = 'degraded';
    }
  } catch(error) {
    health.database = 'disconnected';
    health.status = 'degraded';
    health.error = error instanceof Error ? error.message : String(error);
    logger.warn(`${proc} Database ping failed: ${health.error}`);
  }

  const statusCode = (health.database === 'disconnected' || health.database === 'not_initialized') ? 503 : 200;

  res.status(statusCode).json(health);
});

try {
  const file = fs.readFileSync(yamlFilename, 'utf8');

  const swaggerDocument = YAML.parse(file) as JsonObject;

  app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  logger.info(`✅ Swagger ${yamlFilename} served successfully load ${JSON.stringify(swaggerDocument).length} bytes`);
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
app.use(
  OpenApiValidator.middleware({
    apiSpec: yamlFilename,
    validateRequests: true,
    // Enable response validation only in non-production environments for easier debugging
    validateResponses: process.env.NODE_ENV !== 'production'
  })
);


// Error-related middleware (404 and error handlers) grouped together for clarity
app.use((req: Request, res: Response) => {
  logger.warn(`${proc} 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: `${proc} Endpoint not found: ${req.method} ${req.originalUrl}`,
    error: 'Not Found',
    status: 404
  });
});

// XHR client error handler
function xhrClientErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
    logger.error(`[main/xhrClientErrorHandler] Something failed. ${err.message}`);
    res.status(500).json({
      message: `[main/xhrClientErrorHandler] Something failed. ${err.message}`
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
    module: 'main',
    procedure: 'unhandledError',
    message: `Internal Server Error Unhandled error- ${req.method} ${req.originalUrl}`,
    error: err.message
  });
});

let server: HttpServer | HttpsServer;

if (process.env.NODE_ENV === 'production') {
  server = app.listen(Number(PORT), '0.0.0.0', () => {
    logger.info(
      figlet.textSync('3d-inventory-api GCP', {
        font: 'Mini',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 160,
        whitespaceBreak: true
      })
    );
    logger.info(`Server on GCP https://${HOST}:${PORT}`);
    logger.info(`Server on GCP https://${HOST}:${PORT}/doc (Swagger UI)`);
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
  // Development server with HTTPS
  server = https.createServer(httpsOptions, app).listen(Number(PORT), HOST, () => {
    logger.info(
      '\n\n'+figlet.textSync('3d-inventory-api', {
        font: 'Nancyj-Fancy',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: process.stdout.columns || 180,
        whitespaceBreak: true
      })
    );
    logger.info(`✅ Development ver. ${kleur.green(process.env.npm_package_version ?? 'unknown')} `);
    logger.info(`✅ Server on ${kleur.green(`https://${HOST}:${PORT}`)}`);
    logger.info(`✅ Server on ${kleur.green(`https://${HOST}:${PORT}/doc (Swagger UI)`)}`);
  });

  server.on('error', (err: Error) => {
    logger.error(`Error listen on address https://${HOST}:${PORT}: ${String(err)}\nStack: ${err.stack}`);
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

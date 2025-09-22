/**
 * @description API 3d-inventory. Project is a simple solution that allows you to build a spatial and database representation of all types of warehouses and server rooms.
 *
 * @public
 */

import { constants as cryptoConstants } from 'crypto'
import fs from 'fs'
import type { Server as HttpServer } from 'http'
import https, { type Server as HttpsServer } from 'https'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors, { type CorsOptions } from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import * as OpenApiValidator from 'express-openapi-validator'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import figlet from 'figlet'
import helmet from 'helmet'
import kleur from 'kleur'
import methodOverride from 'method-override'
import morgan from 'morgan'
import morganBody from 'morgan-body'
import { createAttributesRouter } from './routers/attributes'
import createAttributesDictionaryRouter from './routers/attributesDictionary'
import { createConnectionsRouter } from './routers/connections'
import createDevicesRouter from './routers/devices'
import createDocRouter from './routers/doc'
import { createFloorsRouter } from './routers/floors'
import createGithubRouter from './routers/github'
import createHealthRouter from './routers/health'
import createLoginRouter from './routers/login'
import { createLogsRouter } from './routers/logs'
import { createModelsRouter } from './routers/models'
import { createReadmeRouter } from './routers/readme'
import rolesRouter from './routers/roles'
import userManagementRouter from './routers/user-management'
import { InitializationService } from './services/InitializationService'
import config from './utils/config'
import { getDb } from './utils/db'
import getLogger from './utils/logger'

const logger = getLogger('main')
const proc = '[main]'
const PORT = config.PORT
const HOST = config.HOST
// Cloud Run configuration - use HTTP instead of HTTPS
let httpsOptions: https.ServerOptions = {
  secureOptions: cryptoConstants.SSL_OP_NO_SSLv3 | cryptoConstants.SSL_OP_NO_TLSv1 | cryptoConstants.SSL_OP_NO_TLSv1_1,
  honorCipherOrder: true,
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
  requestCert: true,
  rejectUnauthorized: false
}

if (process.env.NODE_ENV !== 'production') {
  try {
    httpsOptions = {
      ...httpsOptions,
      key: fs.readFileSync('./cert/server.key'),
      cert: fs.readFileSync('./cert/server.crt')
    }
  } catch (error) {
    logger.error(`${proc}SSL certificates not found, using HTTP only: ${error}`)
  }
}

const yamlFilename = process.env.API_YAML_FILE ?? './api.yaml'

export const app = express()

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
]
const LOCALHOST_ORIGIN_REGEX = /^https?:\/\/localhost:\d+$/
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (typeof origin === 'undefined' || origin === null) {
      logger.info(`[CORS DEBUG] No origin header - allowing: ${origin}`)

      return callback(null, true)
    }

    const isAllowed =
      allowedOrigins.includes(origin) ||
      LOCALHOST_ORIGIN_REGEX.test(origin)

    if (isAllowed) {
      logger.info(`[CORS DEBUG] Origin allowed: ${origin}`)

      return callback(null, true)
    } else {
      logger.warn(`[CORS DEBUG] Origin blocked: ${origin}`)

      const corsError = new Error(`CORS policy: This origin is not allowed: ${origin}`)

      // @ts-expect-error: Assigning custom 'status' property to Error object for CORS handling
      corsError.status = 403
      // @ts-expect-error Assigning custom 'origin' property to Error object for CORS handling
      corsError.origin = origin

      return callback(corsError, false)
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
}
// Middleware for rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10), // Limit each IP to 100 requests per windowMs default
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ''), // Use the official helper for IPv4/IPv6 safety
  message: { message: process.env.RATE_LIMIT_MESSAGE }
})

// Apply the rate limiter to all requests
app.use(limiter)

app.use(cors(corsOptions))


export let db: Awaited<ReturnType<typeof getDb>> | null = null;

(async () => {
  db = await getDb()

  if (db === null) {
    if (config.ATLAS_URI) {
      logger.error('❌ Could not connect to the database, exiting.')

      process.exit(1)
    } else {
      logger.warn('⚠️ No MongoDB URI provided, running without database')
    }
  }
})()

app.use(cookieParser())

try {
  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim())

          return true
        }
      }
    })
  )
} catch (error) {
  logger.error(`${proc} Error login in morgan: ${String(error)} `)
}


// CSP configuration
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
    baseUri: ['\'self\''],
    // Add a CSP violation reporting endpoint
    reportUri: ['/csp-violation-report'] // Supported by most browsers
    // reportTo: ['csp-endpoint'] // Modern reporting (requires additional configuration)
  }
}))

app.use(express.json({ limit: '50mb' })) // Increase body size limit if needed
app.use(bodyParser.json()) // must parse body before morganBody as body will be logged

// CSP violation reporting endpoint
app.post('/csp-violation-report', (req, res) => {
  logger.warn(`${proc} CSP Violation: `, req.body)
  res.status(204).end()
})

morganBody(app, {
  noColors: false,
  logReqDateTime: false,
  //dateTimeFormat: 'clf',
  logReqUserAgent: false,
  logIP: false,
  theme: 'darkened',
  stream: {
    write: (message: string) => {
      logger.info(message.trim())

      return true
    }
  }
})

app.use(express.urlencoded({ extended: false }))

app.use(methodOverride())

// Register API routers
app.use('/readme', createReadmeRouter())
app.use('/logs', createLogsRouter())
app.use('/devices', createDevicesRouter())
app.use('/models', createModelsRouter())
app.use('/attributes', createAttributesRouter())
app.use('/attributesDictionary', createAttributesDictionaryRouter())
app.use('/connections', createConnectionsRouter())
app.use('/doc', createDocRouter())
app.use('/floors', createFloorsRouter())
app.use('/github', createGithubRouter())
app.use('/login', createLoginRouter())
app.use('/health', createHealthRouter())
app.use('/user-management', userManagementRouter)
app.use('/roles', rolesRouter)

app.get('/favicon.ico', (req, res) => {
  res.status(204).end()
})

// OpenApi validation
app.use(
  OpenApiValidator.middleware({
    apiSpec: yamlFilename,
    validateRequests: true,
    // Enable response validation only in non-production environments for easier debugging
    validateResponses: process.env.NODE_ENV !== 'production'
  })
)


// Error-related middleware (404 and error handlers) grouped together for clarity
app.use((req: Request, res: Response) => {
  logger.warn(`${proc} 404 Not Found: ${req.method} ${req.originalUrl} `)
  res.status(404).json({
    message: `${proc} Endpoint not found: ${req.method} ${req.originalUrl} `,
    error: 'Not Found',
    status: 404
  })
})

// XHR client error handler
function xhrClientErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
    logger.error(`[main / xhrClientErrorHandler] Something failed.${err.message} `)
    res.status(500).json({
      message: `[main / xhrClientErrorHandler] Something failed.${err.message} `
    })
    next(err)
  } else {
    next(err)
  }
}

app.use(xhrClientErrorHandler)

app.use((err: Error, req: Request, res: Response) => {
  logger.error(`Unhandled error exception: ${err.message}.Stack: ${err.stack} `)
  res.status(500).json({
    module: 'main',
    procedure: 'unhandledError',
    message: `Internal Server Error Unhandled error - ${req.method} ${req.originalUrl} `,
    error: err.message
  })
})

app.set('trust proxy', 1) // or true, or the number of proxies in front of your app

// Initialize database with default users and roles
async function initializeDatabase() {
  try {
    const initService = InitializationService.getInstance()
    const needsInit = await initService.isInitializationNeeded()

    if (needsInit) {
      logger.info('Initializing database with default users and roles...')
      await initService.initializeApplication()
      logger.info('Database initialization completed successfully')
    } else {
      logger.info('Database already initialized')
    }
  } catch (error) {
    logger.error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`)
    logger.warn('Continuing without initialization - manual setup may be required')
  }
}

let server: HttpServer | HttpsServer | undefined

// Only start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  if (process.env.NODE_ENV === 'production') {
    server = app.listen(Number(PORT), '0.0.0.0', async () => {
      logger.info(
        figlet.textSync('3d-inventory-api GCP', {
          font: 'Mini',
          horizontalLayout: 'default',
          verticalLayout: 'default',
          width: 160,
          whitespaceBreak: true
        })
      )
      logger.info(`Server on GCP https://${HOST}:${PORT}`)
      logger.info(`Server on GCP https://${HOST}:${PORT}/doc (Swagger UI)`)
      logger.info(`Server on GCP https://${HOST}:${PORT}/health (Status)`)

      // Initialize database after server starts
      await initializeDatabase()
    })

    // Update signal handlers for HTTP server
    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server.')
      if (server) {
        server.close(() => {
          logger.debug('HTTP server closed')
          process.exit(0)
        })
      }
    })

    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server.')
      if (server) {
        server.close(() => {
          logger.debug('HTTP server closed')
          process.exit(0)
        })
      }
    })
  } else {
    // Development server with HTTPS
    server = https.createServer(httpsOptions, app).listen(Number(PORT), HOST, async () => {
      logger.info(
        '\n\n' + figlet.textSync('3d-inventory-api', {
          font: 'Nancyj-Fancy',
          horizontalLayout: 'default',
          verticalLayout: 'default',
          width: process.stdout.columns || 180,
          whitespaceBreak: true
        })
      )
      logger.info(`✅ Development ver. ${kleur.green(process.env.npm_package_version ?? 'unknown')} `)
      logger.info(`✅ Server on ${kleur.green(`https://${HOST}:${PORT}`)}`)
      logger.info(`✅ ${kleur.green(`https://${HOST}:${PORT}/doc  - Swagger UI`)}`)
      logger.info(`✅ ${kleur.green(`https://${HOST}:${PORT}/health  - Status`)}`)

      // Initialize database after server starts
      await initializeDatabase()
    })

    server.on('error', (err: Error) => {
      logger.error(`Error listen on address https://${HOST}:${PORT}: ${String(err)}\nStack: ${err.stack}`)
    })

    // Signal handlers for HTTPS server
    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTPS server.')
      if (server) {
        server.close(() => {
          logger.debug('HTTPS server closed')
          process.exit(0)
        })
      }
    })

    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTPS server.')
      if (server) {
        server.close(() => {
          logger.debug('HTTPS server closed')
          process.exit(0)
        })
      }
    })
  }
}

// Export the app for testing, server for production
export default process.env.NODE_ENV === 'test' ? app : (server || app)

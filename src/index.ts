/**
 * @description API 3d-inventory. Project is a simple solution that allows you to build a spatial and database representation of all types of warehouses and server rooms.
 * @version 2024-03-31 C2RLO - transform to typescript
 * @version 2023-12-29 C2RLO - Initial
 * @public
 */

import './utils/config.js';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csurf from 'csurf';
import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
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

import attributes from './routers/attributes.js';
import attributesDictionary from './routers/attributesDictionary.js';
import connections from './routers/connections.js';
import devices from './routers/devices.js';
import floors from './routers/floors.js';
import logs from './routers/logs.js';
import models from './routers/models.js';
import readme from './routers/readme.js';
import log from './utils/logger.js';

const logger = log('index')

const PORT = Number(process.env.PORT) || 3001
const HOST = process.env.HOST ?? 'localhost'
const COOKIE_EXPIRESIN = process.env.COOKIE_EXPIRESIN ?? '3600000'

const httpsOptions = {
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.crt')
}

const yamlFilename = process.env.API_YAML_FILE ?? './dist/src/api.yaml'

const app = express()

app.use(cookieParser())
app.use(helmet())
app.use(csurf({ cookie: true }))

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
  logger.error(`Error login in morgan: ${String(error)}`)
}

app.use(cors())

app.use(function (_, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', `http://${HOST}:${PORT}`)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})

app.use(express.json())
app.use(bodyParser.json()) // must parse body before morganBody as body will be logged

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

// Load the api routes
app.use('/readme', readme)
app.use('/logs', logs)
app.use('/devices', devices)
app.use('/models', models)
app.use('/attributes', attributes)
app.use('/attributesDictionary', attributesDictionary)
app.use('/connections', connections)
app.use('/floors', floors)

fs.open(yamlFilename, 'r', (err: NodeJS.ErrnoException | null) => {
  if (err) {
    if (err.code === 'ENOENT') {
      logger.error("File doesn' exist")
      return
    }
    if (err.code === 'EACCES') {
      logger.error('No permission')
      return
    }
    logger.error('Unknown Error')
  } else {
    logger.info(`File api.yaml opened successfully from ${yamlFilename}`)
  }
})

try {
  const file = fs.readFileSync(yamlFilename, 'utf8')
  const swaggerDocument = YAML.parse(file) as JsonObject
  app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  logger.info(`swaggerDocument api.yaml served successfully load ${JSON.stringify(swaggerDocument).length} bytes`)
} catch (e) {
  if (typeof e === 'string') {
    logger.warn(e.toUpperCase())
  } else if (e instanceof Error) {
    logger.error('Open swaggerUI exception: ' + e.message)
  } else {
    logger.error('Unknown error occurred.')
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
  )
  logger.info(`OpenApiValidator api.yaml served successfully from ${yamlFilename}`)
} catch (error) {
  logger.error(`OpenApiValidator: ${String(error)}`)
}

interface CustomError extends Error {
  status?: number
  errors?: unknown
}

const errorHandler: ErrorRequestHandler = (err: CustomError, req: Request, res: Response, next) => {
  logger.error(err)
  res.status(err.status ?? 500).json({
    message: err.message,
    errors: Array.isArray(err.errors) || (typeof err.errors === 'object' && err.errors !== null) ? (err.errors as Record<string, unknown>) : undefined
  })
}

interface ClientError extends Error {
  status?: number
}

interface ClientRequest extends Request {
  xhr: boolean
}

function clientErrorHandler(err: ClientError, req: ClientRequest, res: Response, next: NextFunction): void {
  if (req.xhr) {
    logger.error(err)
    res.status(500).send({ error: 'Something failed!' })
  } else {
    logger.error(err)
    next(err)
  }
}

app.use(methodOverride())
app.use(clientErrorHandler)
app.use(errorHandler)

const httpsServer = https.createServer(httpsOptions, app)

const server = app.listen(Number(PORT), HOST, () => {
  logger.info(
    '\n' +
      figlet.textSync('3d-inventory-mongo-api', {
        font: 'Mini',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 160,
        whitespaceBreak: true
      })
  )
  logger.info(`server on https://${HOST}:${PORT} docker: https://172.17.0.2:${PORT} | MongoDb: ${process.env.DBNAME} `)
})

app.use((err: Error, req: Request, res: Response) => {
  logger.error(err)
  res.status(500).send('Internal Server Error')
})

server.on('error', (err: Error) => {
  if (err instanceof Error && err.message.includes('EADDRINUSE')) {
    logger.error(`Adress http://${HOST}:${PORT} already in use.`)
  } else {
    logger.error(`Error listen on adress http://${HOST}:${PORT}: ${String(err)}`)
  }
})

process.on('SIGTERM', () => {
  logger.debug('SIGTERM signal received: closing HTTP server.')
  server.close(() => {
    logger.debug('HTTP server closed')
  })
})

export default server

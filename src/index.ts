/**
 * @description API 3d-inventory. Project is a simple solution that allows you to build a spatial and database representation of all types of warehouses and server rooms.
 * @version 2024-03-31 C2RLO - transform to typescript
 * @version 2023-12-29 C2RLO - Initial
 * @public
 * @alpha 3d-inventory API
 */

import './utils/loadEnvironment'

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import csurf from 'csurf'
import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import * as OpenApiValidator from 'express-openapi-validator'
import fs from 'fs'
import helmet from 'helmet'
import morgan from 'morgan'
import morganBody from 'morgan-body'
import swaggerUi, { JsonObject } from 'swagger-ui-express'
import YAML from 'yaml'

import attributes from './routers/attributes'
import attributesDictionary from './routers/attributesDictionary'
import connections from './routers/connections'
import devices from './routers/devices'
import floors from './routers/floors'
import logs from './routers/logs'
import models from './routers/models'
import readme from './routers/readme'
import { logger } from './utils/logger'

const PORT = process.env.PORT || 8080
const yamlFilename = process.env.API_YAML_FILE || 'src/api/openapi.yaml'

const app = express()
app.use(helmet())
app.use(cookieParser())
app.use(csurf({ cookie: true }))

try {
  app.use(
    morgan(
      function (tokens: morgan.TokenIndexer<express.Request, express.Response>, req: express.Request, res: express.Response): string {
        return [
          //tokens.date(req, res, 'iso'),
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'),
          '-',
          tokens['response-time'](req, res),
          'ms',
        ].join(' ')
      },
      { stream: { write: (message: string) => logger.info(message.trim()) } as unknown as NodeJS.WritableStream },
    ),
  )
} catch (error) {
  logger.error(`[morgan] ${String(error)}`)
}

app.use(cors())

app.use(function (_, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', `http://localhost:${PORT}`)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})

app.use(express.json())
app.use(bodyParser.json())

morganBody(app, {
  noColors: true,
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
      logger.error("File Doesn't Exist")
      return
    }
    if (err.code === 'EACCES') {
      logger.error('No Permission')
      return
    }
    logger.error('Unknown Error')
  }
})

// app.use((err: ErrorRequestHandler, req: Request, res: Response) => {
//   console.error(err)
//   //res.status(500).send('Internal Server Error')
// })

try {
  const file = fs.readFileSync(yamlFilename, 'utf8')
  const swaggerDocument = YAML.parse(file) as JsonObject
  app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  logger.info(`Open SwaggerUI in http://localhost:${PORT}/`)
} catch (e) {
  if (typeof e === 'string') {
    logger.warn(e.toUpperCase())
  } else if (e instanceof Error) {
    logger.error('[Open SwaggerUI] Exception ' + e.message + ', open: ' + encodeURI('https://stackoverflow.com/search?q=[js]' + e.message))
  } else {
    logger.error('Unknown error occurred')
  }
}

// OpenApi validation
try {
  app.use(
    OpenApiValidator.middleware({
      apiSpec: yamlFilename,
      validateRequests: true,
      validateResponses: true,
    }),
  )
  // logger.info("OpenApiValidator started")
} catch (error) {
  logger.error(`OpenApiValidator: ${String(error)}`)
}

interface CustomError extends Error {
  status?: number
  errors?: unknown
}

const errorHandler: ErrorRequestHandler = (err: CustomError, req: Request, res: Response) => {
  logger.error(err)
  res.status(err.status || 500).json({
    message: err.message,
    errors: Array.isArray(err.errors) || (typeof err.errors === 'object' && err.errors !== null) ? (err.errors as Record<string, unknown>) : undefined,
  })
}

app.use(errorHandler)

// Create the server instance using createServer function
const server = app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`)
}) // Start the server

app.use((err: Error, req: Request, res: Response) => {
  logger.error(err)
  res.status(500).send('Internal Server Error')
}) // Error handling

server.on('error', (err: Error) => {
  if (err instanceof Error && err.message.includes('EADDRINUSE')) {
    logger.error('Error: address already in use')
  } else {
    logger.error(`[listen] ${String(err)}`)
  }
}) // Error handling

process.on('SIGTERM', () => {
  logger.debug('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    logger.debug('HTTP server closed')
  })
})

export default server

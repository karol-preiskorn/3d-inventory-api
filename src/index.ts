/**
 * @description API 3d-inventory. Project is a simple solution that allows you to build a spatial and database representation of all types of warehouses and server rooms.
 * @version 2024-03-31 C2RLO - transform to typescript
 * @version 2023-12-29 C2RLO - Initial
 * @public
 * @alpha
 */

import './utils/loadEnvironment';

import bodyParser from 'body-parser';
import cors from 'cors';
import express, { ErrorRequestHandler, Request, Response } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import fs from 'fs';
import morgan from 'morgan';
import morganBody from 'morgan-body';
import swaggerUi, { JsonObject } from 'swagger-ui-express';
import YAML from 'yaml';

import attributes from './routers/attributes';
import attributesDictionary from './routers/attributesDictionary';
import connections from './routers/connections';
import devices from './routers/devices';
import floors from './routers/floors';
import logs from './routers/logs';
import models from './routers/models';
import readme from './routers/readme';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 8080
const yamlFilename = process.env.API_YAML_FILE || 'src/api/openapi.yaml'

/**
 * @public
 */
const app = express()

try {
  app.use(
    morgan(
      function (tokens: morgan.TokenIndexer<express.Request, express.Response>, req: express.Request, res: express.Response): string {
        return [
          tokens.date(req, res, 'iso'),
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'),
          '-',
          tokens['response-time'](req, res),
          'ms',
        ].join(' ')
      },
      { stream: { write: () => {} } as unknown as NodeJS.WritableStream },
    ),
  )
} catch (error) {
  logger.error(`[morgan] ${String(error)}`)
}

/**
 * @internal
 */
app.use(cors())

app.use(function (req, res) {
  res.header('Access-Control-Allow-Origin', `http://localhost:${PORT}`)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
})

app.use(express.json())
app.use(bodyParser.json())

morganBody(app, {
  noColors: true,
  stream: { write: () => true },
})

app.use((error: ErrorRequestHandler, request: Request, response: Response) => {
  console.error(error)
  response.send('Internal Server Error')
  response.status(500).end()
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

fs.open(yamlFilename, 'r', (err) => {
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

// Create the server instance using createServer function
const server = app.listen(PORT, () => {
  logger.info(`README on http://localhost:${PORT}/readme`)
})

server.on('error', (err) => {
  if (err instanceof Error && err.message.includes('EADDRINUSE')) {
    logger.error('Error: address already in use')
  } else {
    logger.error(`[listen] ${String(err)}`)
  }
})

process.on('SIGTERM', () => {
  logger.debug('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    logger.debug('HTTP server closed')
  })
})

// server.close(() => {
//   logger.debug('Closing HTTP server')
//   server.close(() => {
//     logger.debug('HTTP server closed')
//   })
// })

/**
 * @public
 */
export default app

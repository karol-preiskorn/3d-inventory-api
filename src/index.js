/**
 * @file        /index.js
 * @description API 3d-inventory. Project is a simple solution that allows you to build a spatial and database representation of all types
 *              of warehouses and server rooms.
 * @version 2023-12-29  C2RLO - Initial
 */

import express from 'express'
import * as OpenApiValidator from 'express-openapi-validator'
import fs from 'fs'
import morgan from 'morgan'
import morganBody from 'morgan-body'
import swaggerUi from 'swagger-ui-express'
import bodyParser from 'body-parser'
import YAML from 'yaml'
import helmet from 'helmet'
import './utils/loadEnvironment.js'
import devices from './routers/devices.js'
import models from './routers/models.js'
import logs from './routers/logs.js'
import readme from './routers/readme.js'
import attributes from './routers/attributes.js'
import attributesDictionary from './routers/attributesDictionary.js'
import connections from './routers/connections.js'
import floors from './routers/floors.js'
import { logger, stream } from './utils/logger.js'
import { banner } from './utils/banner.js'


const PORT = process.env.PORT || 8080
const app = express()

try {
  // const accessLogStream = fs.createWriteStream("./logs/access.log", { flags: "a" })
  app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ].join(' ')
  }, { stream }))
} catch (error) {
  logger.error(`[morgan] ${error}`)
}

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.DOMAIN) // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use(express.json())
app.use(bodyParser.json())
morganBody(app, {
  noColors: true,
  stream
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

banner()

// Global error handling
app.use((err, _req, res, next) => {
  logger.error(`Uh oh! An unexpected error occurred. ${err}`)
  res.status(500).send(`Uh oh! An unexpected error occurred. ${err}`)
})

app.use(express.json())
const yamlFilename = 'src/api/openapi.yaml'

fs.open(yamlFilename, 'r', (err, fd) => {
  if (err) {
    if (err.code === 'ENOENT') {
      logger.error('File Doesn\'t Exist')
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
  const swaggerDocument = YAML.parse(file)
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
  app.use(OpenApiValidator.middleware({
    apiSpec: yamlFilename,
    validateRequests: true,
    validateResponses: true
  }))
  // logger.info("OpenApiValidator started")
} catch (error) {
  logger.error(`OpenApiValidator: ${error}`)
}

app.use(helmet())
app.set('trust proxy', true) // HTTPS and forwarding proxies App Engine terminates HTTPS connections at the load balancer and forwards requests to your application. Some applications need to determine the original request IP and protocol. The user's IP address is available in the standard X-Forwarded-For header. Applications that require this information should configure their web framework to trust the proxy.

// Start the Express server
app
  .listen(PORT, () => {
    logger.info(`README on http://localhost:${PORT}/readme`)
  })
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error('Error: address already in use')
    } else {
      logger.error(`[listen] ${err}`)
    }
  })

process.on('SIGTERM', () => {
  logger.debug('SIGTERM signal received: closing HTTP server')
  app.close(() => {
    logger.debug('HTTP server closed')
  })
})


export default app

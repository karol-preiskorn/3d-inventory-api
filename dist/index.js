'use strict'
/**
 * @file /index.js
 * @description API 3d-inventory. Project is a simple solution that allows you to build a spatial and database representation of all types of warehouses and server rooms.
 * @version 2024-03-31 C2RLO - transform to typescript
 * @version 2023-12-29 C2RLO - Initial
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        var desc = Object.getOwnPropertyDescriptor(m, k)
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k]
            },
          }
        }
        Object.defineProperty(o, k2, desc)
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v })
      }
    : function (o, v) {
        o['default'] = v
      })
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k)
    __setModuleDefault(result, mod)
    return result
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const body_parser_1 = __importDefault(require('body-parser'))
const express_1 = __importDefault(require('express'))
const OpenApiValidator = __importStar(require('express-openapi-validator'))
const fs_1 = __importDefault(require('fs'))
const morgan_1 = __importDefault(require('morgan'))
const morgan_body_1 = __importDefault(require('morgan-body'))
const swagger_ui_express_1 = __importDefault(require('swagger-ui-express'))
const yaml_1 = __importDefault(require('yaml'))
const attributes_js_1 = __importDefault(require('./routers/attributes.js'))
const attributesDictionary_js_1 = __importDefault(
  require('./routers/attributesDictionary.js'),
)
const connections_js_1 = __importDefault(require('./routers/connections.js'))
const devices_js_1 = __importDefault(require('./routers/devices.js'))
const floors_js_1 = __importDefault(require('./routers/floors.js'))
const logs_js_1 = __importDefault(require('./routers/logs.js'))
const models_js_1 = __importDefault(require('./routers/models.js'))
const readme_js_1 = __importDefault(require('./routers/readme.js'))
require('./utils/loadEnvironment.js')
const logger_js_1 = require('./utils/logger.js')
const PORT = process.env.PORT || 8080
const yamlFilename = process.env.API_YAML_FILE || 'src/api/openapi.yaml'
const app = (0, express_1.default)()
try {
  app.use(
    (0, morgan_1.default)(
      function (tokens, req, res) {
        return [
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'),
          '-',
          tokens['response-time'](req, res),
          'ms',
        ].join(' ')
      },
      { stream: { write: (message, _encoding) => {} } },
    ),
  )
} catch (error) {
  logger_js_1.logger.error(`[morgan] ${error}`)
}
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.DOMAIN) // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})
app.use(express_1.default.json())
app.use(body_parser_1.default.json())
;(0, morgan_body_1.default)(app, {
  noColors: true,
  stream: { write: (message, _encoding) => {} },
})
app.use(express_1.default.urlencoded({ extended: false }))
// Load the api routes
app.use('/readme', readme_js_1.default)
app.use('/logs', logs_js_1.default)
app.use('/devices', devices_js_1.default)
app.use('/models', models_js_1.default)
app.use('/attributes', attributes_js_1.default)
app.use('/attributesDictionary', attributesDictionary_js_1.default)
app.use('/connections', connections_js_1.default)
app.use('/floors', floors_js_1.default)
app.use((err, _req, res, _next) => {
  logger_js_1.logger.error(`Uh oh! An unexpected error occurred. ${err}`)
  res.status(500).send(`Uh oh! An unexpected error occurred. ${err}`)
})
fs_1.default.open(yamlFilename, 'r', (err, _fd) => {
  if (err) {
    if (err.code === 'ENOENT') {
      logger_js_1.logger.error("File Doesn't Exist")
      return
    }
    if (err.code === 'EACCES') {
      logger_js_1.logger.error('No Permission')
      return
    }
    logger_js_1.logger.error('Unknown Error')
  }
})
try {
  const file = fs_1.default.readFileSync(yamlFilename, 'utf8')
  const swaggerDocument = yaml_1.default.parse(file)
  app.use(
    '/',
    swagger_ui_express_1.default.serve,
    swagger_ui_express_1.default.setup(swaggerDocument),
  )
  logger_js_1.logger.info(`Open SwaggerUI in http://localhost:${PORT}/`)
} catch (e) {
  if (typeof e === 'string') {
    logger_js_1.logger.warn(e.toUpperCase())
  } else if (e instanceof Error) {
    logger_js_1.logger.error(
      '[Open SwaggerUI] Exception ' +
        e.message +
        ', open: ' +
        encodeURI('https://stackoverflow.com/search?q=[js]' + e.message),
    )
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
  logger_js_1.logger.error(`OpenApiValidator: ${error}`)
}
// Create the server instance using createServer function
const server = app.listen(PORT, () => {
  logger_js_1.logger.info(`README on http://localhost:${PORT}/readme`)
})
server.on('error', (err) => {
  if (err instanceof Error && err.message.includes('EADDRINUSE')) {
    logger_js_1.logger.error('Error: address already in use')
  } else {
    logger_js_1.logger.error(`[listen] ${err}`)
  }
})
process.on('SIGTERM', () => {
  logger_js_1.logger.debug('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    logger_js_1.logger.debug('HTTP server closed')
  })
})
exports.default = app
//# sourceMappingURL=index.js.map

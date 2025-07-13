"use strict"
/**
 * @description API 3d-inventory. Project is a simple solution that allows you to build a spatial and database representation of all types of warehouses and server rooms.
 * @public
 */
var _a, _b
Object.defineProperty(exports, "__esModule", { value: true })
require("./utils/config")
var body_parser_1 = require("body-parser")
var cookie_parser_1 = require("cookie-parser")
var cors_1 = require("cors")
var express_1 = require("express")
var OpenApiValidator = require("express-openapi-validator")
var figlet_1 = require("figlet")
var fs_1 = require("fs")
var helmet_1 = require("helmet")
var https_1 = require("https")
var method_override_1 = require("method-override")
var morgan_1 = require("morgan")
var morgan_body_1 = require("morgan-body")
var swagger_ui_express_1 = require("swagger-ui-express")
var yaml_1 = require("yaml")
var attributes_1 = require("./routers/attributes")
var attributesDictionary_1 = require("./routers/attributesDictionary")
var connections_1 = require("./routers/connections")
var devices_1 = require("./routers/devices")
var floors_1 = require("./routers/floors")
var github_1 = require("./routers/github")
var logs_1 = require("./routers/logs")
var models_1 = require("./routers/models")
var readme_1 = require("./routers/readme")
var logger_1 = require("./utils/logger")
var logger = (0, logger_1.default)('index')
var PORT = Number(process.env.PORT) || 3001
var HOST = (_a = process.env.HOST) !== null && _a !== void 0 ? _a : 'localhost'
var httpsOptions = {
  key: fs_1.default.readFileSync('./cert/server.key'),
  cert: fs_1.default.readFileSync('./cert/server.crt')
}
var yamlFilename = (_b = process.env.API_YAML_FILE) !== null && _b !== void 0 ? _b : './api.yaml'
var app = (0, express_1.default)()
app.use((0, cookie_parser_1.default)())
app.use((0, helmet_1.default)())
try {
  app.use((0, morgan_1.default)(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
      write: function (message) {
        logger.info(message.trim())
        return true
      }
    }
  }))
}
catch (error) {
  logger.error("Error login in morgan: ".concat(String(error)))
}
app.use((0, cors_1.default)())
app.use(function (req, res, next) {
  var allowedOrigins = [
    "https://".concat(HOST, ":").concat(PORT),
    'https://172.17.0.2:3001',
    'https://172.17.0.3:3001',
    'https://172.20.0.2:3001',
    'https://172.20.0.3:3001',
    'https://cluster0.htgjako.mongodb.net',
    'https://localhost:3000',
    'https://localhost:3001'
  ]
  var origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})
app.use(function (_req, res, next) {
  res.header('Content-Security-Policy', "default-src 'self'; connect-src *; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;")
  next()
})
app.use(express_1.default.json())
app.use(body_parser_1.default.json()); // must parse body before morganBody as body will be logged
(0, morgan_body_1.default)(app, {
  noColors: false,
  logReqDateTime: false,
  //dateTimeFormat: 'clf',
  logReqUserAgent: false,
  logIP: false,
  theme: 'darkened',
  stream: {
    write: function (message) {
      logger.info(message.trim())
      return true
    }
  }
})
app.use(express_1.default.urlencoded({ extended: false }))
app.use((0, method_override_1.default)())
// Register API routers
app.use('/readme', readme_1.default)
app.use('/logs', logs_1.default)
app.use('/devices', devices_1.default)
app.use('/models', models_1.default)
app.use('/attributes', attributes_1.default)
app.use('/attributesDictionary', attributesDictionary_1.default)
app.use('/connections', connections_1.default)
app.use('/floors', floors_1.default)
app.use('/github', github_1.default)
fs_1.default.access(yamlFilename, fs_1.default.constants.R_OK, function (err) {
  if (err) {
    if (err.code === 'ENOENT') {
      logger.warn("File not found: ".concat(yamlFilename))
    }
    else if (err.code === 'EACCES') {
      logger.error("No permission to file ".concat(yamlFilename))
    }
    else {
      logger.error('Unknown Error during access api.yaml: ' + err.message)
    }
  }
  else {
    logger.info("File api.yaml opened successfully from ".concat(yamlFilename))
  }
})
try {
  var file = fs_1.default.readFileSync(yamlFilename, 'utf8')
  var swaggerDocument = yaml_1.default.parse(file)
  app.use('/', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument))
  logger.info("swaggerDocument api.yaml served successfully load ".concat(JSON.stringify(swaggerDocument).length, " bytes"))
}
catch (e) {
  if (typeof e === 'string') {
    logger.warn(e.toUpperCase())
  }
  else if (e instanceof Error) {
    logger.error('Open swaggerUI exception: ' + e.message)
  }
  else {
    logger.error('Unknown error occurred.')
  }
}
// OpenApi validation
try {
  app.use(OpenApiValidator.middleware({
    apiSpec: yamlFilename,
    validateRequests: true,
    validateResponses: true
  }))
  logger.info("OpenApiValidator api.yaml served successfully from ".concat(yamlFilename))
}
catch (error) {
  logger.error("OpenApiValidator: ".concat(String(error)))
}
// Error-related middleware (404 and error handlers) grouped together for clarity
app.use(function (req, res) {
  logger.warn("404 Not Found: ".concat(req.method, " ").concat(req.originalUrl))
  res.status(404).json({
    message: 'Endpoint not found',
    error: 'Not Found',
    status: 404
  })
})
// XHR client error handler
function xhrClientErrorHandler(err, req, res, next) {
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
    logger.error(err)
    res.status(500).json({
      message: 'Something failed!'
    })
    next(err)
  }
  else {
    next(err)
  }
}
app.use(xhrClientErrorHandler)
// General error handler
app.use(function (err, _, res, next) {
  logger.error("Unhandled error: ".concat(err.message, ". Stack: ").concat(err.stack))
  next(err)
})
//
// httpsServer
//
var nl = '\n'
var httpsServer = https_1.default.createServer(httpsOptions, app)
var server = httpsServer.listen(Number(PORT), HOST, function () {
  logger.info("".concat(nl) +
    figlet_1.default.textSync('3d-inventory-mongo-api', {
      font: 'Mini',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 160,
      whitespaceBreak: true
    }))
  logger.info("Server on https://".concat(HOST, ":").concat(PORT))
  logger.info("Atlas MongoDb: https://cloud.mongodb.com/v2/6488bf6ff7acab10310111b5#/overview db: ".concat(process.env.DBNAME))
})
server.on('error', function (err) {
  logger.error("Error listen on address https://".concat(HOST, ":").concat(PORT, ": ").concat(String(err)))
})
process.on('SIGTERM', function () {
  logger.info('SIGTERM signal received: closing HTTPS server.')
  server.close(function () {
    logger.debug('HTTPS server closed')
    process.exit(0)
  })
})
exports.default = server

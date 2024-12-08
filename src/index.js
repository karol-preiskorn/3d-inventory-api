"use strict";
/**
 * @description API 3d-inventory. Project is a simple solution that allows you to build a spatial and database representation of all types of warehouses and server rooms.
 * @version 2024-03-31 C2RLO - transform to typescript
 * @version 2023-12-29 C2RLO - Initial
 * @public
 * @alpha 3d-inventory API
 */
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
require("./utils/loadEnvironment.js");
var body_parser_1 = require("body-parser");
var cookie_parser_1 = require("cookie-parser");
var cors_1 = require("cors");
var express_1 = require("express");
var OpenApiValidator = require("express-openapi-validator");
var express_session_1 = require("express-session");
var fs_1 = require("fs");
var helmet_1 = require("helmet");
var morgan_1 = require("morgan");
var morgan_body_1 = require("morgan-body");
var swagger_ui_express_1 = require("swagger-ui-express");
var yaml_1 = require("yaml");
var attributes_js_1 = require("./routers/attributes.js");
var attributesDictionary_js_1 = require("./routers/attributesDictionary.js");
var connections_js_1 = require("./routers/connections.js");
var devices_js_1 = require("./routers/devices.js");
var floors_js_1 = require("./routers/floors.js");
var logs_js_1 = require("./routers/logs.js");
var models_js_1 = require("./routers/models.js");
var readme_js_1 = require("./routers/readme.js");
var logger_js_1 = require("./utils/logger.js");
var PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8080;
var HOST = (_b = process.env.HOST) !== null && _b !== void 0 ? _b : 'localhost';
var COOKIE_EXPIRESIN = (_c = process.env.COOKIE_EXPIRESIN) !== null && _c !== void 0 ? _c : '3600000';
var yamlFilename = (_d = process.env.API_YAML_FILE) !== null && _d !== void 0 ? _d : 'src/api/openapi.yaml';
var app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
var sessionConfig = (0, express_session_1.default)({
    secret: (_e = process.env.SESSION_SECRET) !== null && _e !== void 0 ? _e : 'default_secret',
    resave: false,
    saveUninitialized: false,
    name: 'sessid',
    cookie: {
        maxAge: parseInt(COOKIE_EXPIRESIN), // Used for expiration time.
        sameSite: 'strict', // Cookies will only be sent in a first-party context. 'lax' is default value for third-parties.
        httpOnly: true, // Mitigate the risk of a client side script accessing the cookie.
        domain: HOST, // Used to compare against the domain of the server in which the URL is being requested.
        secure: true,
    },
});
app.use(sessionConfig);
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
try {
    app.use((0, morgan_1.default)(function (tokens, req, res) {
        return [
            tokens.date(req, res, 'iso'),
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens['response-time'](req, res),
            'ms',
        ].join(' ');
    }, { stream: { write: function (message) { return logger_js_1.logger.info(message.trim()); } } }));
}
catch (error) {
    logger_js_1.logger.error("[morgan] ".concat(String(error)));
}
app.use((0, cors_1.default)());
app.use(function (_, res, next) {
    res.header('Access-Control-Allow-Origin', "http://".concat(HOST, ":").concat(PORT));
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
(0, morgan_body_1.default)(app, {
    noColors: true,
});
app.use(express_1.default.urlencoded({ extended: false }));
// Load the api routes
app.use('/readme', readme_js_1.default);
app.use('/logs', logs_js_1.default);
app.use('/devices', devices_js_1.default);
app.use('/models', models_js_1.default);
app.use('/attributes', attributes_js_1.default);
app.use('/attributesDictionary', attributesDictionary_js_1.default);
app.use('/connections', connections_js_1.default);
app.use('/floors', floors_js_1.default);
fs_1.default.open(yamlFilename, 'r', function (err) {
    if (err) {
        if (err.code === 'ENOENT') {
            logger_js_1.logger.error("File Doesn't Exist");
            return;
        }
        if (err.code === 'EACCES') {
            logger_js_1.logger.error('No Permission');
            return;
        }
        logger_js_1.logger.error('Unknown Error');
    }
});
try {
    var file = fs_1.default.readFileSync(yamlFilename, 'utf8');
    var swaggerDocument = yaml_1.default.parse(file);
    app.use('/', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    logger_js_1.logger.info("Open SwaggerUI in http://".concat(HOST, ":").concat(PORT, "/"));
}
catch (e) {
    if (typeof e === 'string') {
        logger_js_1.logger.warn(e.toUpperCase());
    }
    else if (e instanceof Error) {
        logger_js_1.logger.error('[Open SwaggerUI] Exception ' + e.message + ', open: ' + encodeURI('https://stackoverflow.com/search?q=[js]' + e.message));
    }
    else {
        logger_js_1.logger.error('Unknown error occurred');
    }
}
// OpenApi validation
try {
    app.use(OpenApiValidator.middleware({
        apiSpec: yamlFilename,
        validateRequests: true,
        validateResponses: true,
    }));
    // logger.info("OpenApiValidator started")
}
catch (error) {
    logger_js_1.logger.error("OpenApiValidator: ".concat(String(error)));
}
var errorHandler = function (err, req, res) {
    var _a;
    logger_js_1.logger.error(err);
    res.status((_a = err.status) !== null && _a !== void 0 ? _a : 500).json({
        message: err.message,
        errors: Array.isArray(err.errors) || (typeof err.errors === 'object' && err.errors !== null) ? err.errors : undefined,
    });
};
app.use(errorHandler);
// Create the server instance using createServer function
var server = app.listen(PORT, function () {
    logger_js_1.logger.info("Server is running on http://".concat(HOST, ":").concat(PORT));
}); // Start the server
app.use(function (err, req, res) {
    logger_js_1.logger.error(err);
    res.status(500).send('Internal Server Error');
}); // Error handling
server.on('error', function (err) {
    if (err instanceof Error && err.message.includes('EADDRINUSE')) {
        logger_js_1.logger.error('Error: address already in use');
    }
    else {
        logger_js_1.logger.error("[listen] ".concat(String(err)));
    }
}); // Error handling
process.on('SIGTERM', function () {
    logger_js_1.logger.debug('SIGTERM signal received: closing HTTP server');
    server.close(function () {
        logger_js_1.logger.debug('HTTP server closed');
    });
});
exports.default = server;

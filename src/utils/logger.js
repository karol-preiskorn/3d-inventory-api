"use strict";
/**
 * Logger utility using Winston.
 *
 * Provides logging to both console and daily rotated log files.
 * Each log entry includes a timestamp, module name, and formatted message.
 * Handles exceptions and supports child loggers for module-specific logging.
 *
 * @module utils/logger
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.default = getLogger;
require("winston-daily-rotate-file");
var winston_1 = require("winston");
var createLogger = winston_1.default.createLogger, format = winston_1.default.format, transports = winston_1.default.transports;
var logFormat = format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format(function (info) {
    var _a;
    info.moduleName = (_a = info.moduleName) !== null && _a !== void 0 ? _a : 'default';
    info.level = info.level.toUpperCase();
    info.message = typeof info.message === 'string' ? info.message.trim() : info.message;
    return info;
})(), format.printf(function (_a) {
    var timestamp = _a.timestamp, moduleName = _a.moduleName, level = _a.level, message = _a.message;
    return "".concat(timestamp, " [").concat(moduleName, "] ").concat(level, ": ").concat(message);
}));
exports.logger = createLogger({
    level: 'debug',
    handleExceptions: true,
    transports: [
        new transports.DailyRotateFile({
            filename: 'logs/%DATE%.log',
            datePattern: 'YYYYMMDD',
            maxFiles: '14d',
            format: logFormat
        }),
        new transports.Console({
            format: logFormat
        })
    ]
});
/**
 * Returns a child logger with the specified module name.
 *
 * @param moduleName - The name of the module for log identification.
 * @returns A child logger instance with the module name set.
 */
function getLogger(moduleName) {
    return exports.logger.child({ moduleName: moduleName });
}

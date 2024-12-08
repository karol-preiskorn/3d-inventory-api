"use strict";
/**
 * @description: log information to console and files.
 * @module: utils
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = exports.logger = void 0;
require("winston-daily-rotate-file");
var winston_1 = require("winston");
var combine = winston_1.format.combine, timestamp = winston_1.format.timestamp, printf = winston_1.format.printf, colorize = winston_1.format.colorize;
var myFormat = printf(function (_a) {
    var level = _a.level, message = _a.message, timestamp = _a.timestamp;
    var parentModuleInfo = '';
    if (process.env.PARENT_MODULE) {
        parentModuleInfo = " parent-module: ".concat(process.env.PARENT_MODULE);
    }
    return "".concat(timestamp, " ").concat(level, ": ").concat(message).concat(parentModuleInfo);
});
exports.logger = (0, winston_1.createLogger)({
    transports: [
        new winston_1.transports.DailyRotateFile({
            level: 'debug',
            handleExceptions: true,
            filename: 'logs/%DATE%.log',
            datePattern: 'YYYYMMDD',
            maxFiles: '1d',
            format: combine(winston_1.format.splat(), timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }), myFormat),
        }),
        new winston_1.transports.Console({
            level: 'debug',
            handleExceptions: true,
            format: combine(winston_1.format.splat(), colorize(), timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }), myFormat),
        }),
    ],
});
exports.stream = {
    write: function (message) {
        message = message.substring(0, message.lastIndexOf('\n')).replace('\n', '');
        exports.logger.info(message);
    },
};
exports.default = exports.logger;

"use strict";
/**
 * File:        /src/util/logger.ts
 * Description:
 * Used by:
 * Dependency:
 *
 * Date        By       Comments
 * ----------  -------  ------------------------------
 * 2023-12-11  C2RLO
 * 2023-12-02  C2RLO    Initial add parent-module
 **/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const { combine, timestamp, label, printf, colorize } = winston_1.format;
const myCustomLevels = {
    levels: {
        info: 0,
        warning: 1,
        error: 2,
        debug: 3
    },
    colors: {
        info: "green",
        warning: "yellow",
        error: "red",
        debug: "pink"
    }
};
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});
const transport = new winston_daily_rotate_file_1.default({
    filename: "logs/debug-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "3d"
});
transport.on("rotate", function (oldFilename, newFilename) {
    // do something fun
});
const logger = (0, winston_1.createLogger)({
    levels: myCustomLevels.levels,
    format: combine(colorize({ all: true }), label({ label: __filename.slice(__dirname.length + 1) }), 
    // label({ label: path.basename(parentModule()) }),
    winston_1.format.errors({ stack: true }), winston_1.format.splat(), timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
    }), myFormat),
    transports: [
        new winston_1.transports.Console(),
        // new transports.File({ filename: "logs/error.log", handleExceptions: true })
        transport
    ]
});
(0, winston_1.addColors)(myCustomLevels.colors);
exports.default = logger;

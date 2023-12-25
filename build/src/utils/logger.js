"use strict";
/*
 * File:        /src/util/logger.ts
 * Description:
 * Used by:
 * Dependency:
 *
 * TODO logger.error not works
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-12-22  C2RLO  Add parent-module as label
 * 2023-12-02  C2RLO  Initial add parent-module
 */
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, timestamp, label, printf, colorize } = winston_1.format;
// const myCustomLevels = {
//   levels: {
//     info: 0,
//     warning: 1,
//     error: 2,
//     debug: 3
//   },
//   colors: {
//     info: "green",
//     warning: "yellow",
//     error: "red",
//     debug: "pink"
//   }
// }
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});
const logger = (0, winston_1.createLogger)({
    level: "info",
    defaultMeta: { service: "user-service" },
    // levels: myCustomLevels.levels,
    format: combine(colorize({ all: true }), label({ label: __filename.slice(__dirname.length + 1) }), 
    // label({ label:  path.basename(module.parent.filename)}),
    winston_1.format.splat(), timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
    }), myFormat),
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({ filename: "logs/error.log", handleExceptions: true })
    ]
});
// addColors(myCustomLevels.colors)
exports.default = logger;

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

const { createLogger, format, transports, addColors } = require("winston")
const { combine, timestamp, printf, colorize } = format

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

const logger = createLogger({
  level: "info",
  defaultMeta: { service: "user-service" },
  // levels: myCustomLevels.levels,
  format: combine(
    colorize({ all: true }),
    // label({ label: __filename.slice(__dirname.length + 1) }),
    // label({ label:  path.basename(module.parent.filename)}),
    format.splat(),
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/error.log", handleExceptions: true })
  ]
})

// addColors(myCustomLevels.colors)

module.exports = logger

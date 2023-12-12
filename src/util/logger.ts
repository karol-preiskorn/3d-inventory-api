/**
 * File:        /src/util/logger.ts
 * Description:
 * Used by:
 * Dependency:
 *
 * Date        By       Comments
 * ----------  -----  ------------------------------
 * 2023-12-11  C2RLO  Add rotation
 * 2023-12-02  C2RLO  Initial add parent-module
 **/

import { createLogger, format, transports, addColors } from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import path from "path"

const { combine, timestamp, label, printf, colorize } = format

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
}

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})

const transport: DailyRotateFile = new DailyRotateFile({
  filename: "logs/debug-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  zippedArchive: true,
  maxSize: "2m",
  maxFiles: "3d"
})

transport.on("rotate", function (oldFilename, newFilename) {
  // do something fun
})

const logger = createLogger({
  levels: myCustomLevels.levels,
  format: combine(
    colorize({ all: true }),
    label({ label: __filename.slice(__dirname.length + 1) }),
    // label({ label: path.basename(parentModule()) }),
    format.errors({ stack: true }),
    format.splat(),
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    myFormat
  ),
  transports: [
    new transports.Console(),
    // new transports.File({ filename: "logs/error.log", handleExceptions: true })
    transport
  ]
})

addColors(myCustomLevels.colors)

export default logger

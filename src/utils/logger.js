/**
 * @file:        /src/util/logger.ts
 * @description: log information to console and files
 * @version 2024-01-30 C2RLO - Add rotate files
 * @version 2023-12-22 C2RLO - Add parent-module as label
 * @version 2023-12-02 C2RLO - Initial add parent-module
 */

import { createLogger, format, transports } from 'winston'
import 'winston-daily-rotate-file'

const { combine, timestamp, printf, colorize } = format

const transport = new transports.DailyRotateFile({
  filename: 'logs/%DATE%.log',
  datePattern: 'YYYYMMDD',
  zippedArchive: true,
  maxSize: '1m',
  maxFiles: '1d',
})

transport.on('rotate', function (oldFilename, newFilename) {
  // do something fun
})

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

createLogger.emitErrs = true

export const logger = createLogger({
  transports: [
    transport,
    new transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
      format: combine(
        //   // label({ label: __filename.slice(__dirname.length + 1) }),
        //   // label({ label:  path.basename(module.parent.filename)}),
        format.splat(),
        colorize(),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.ff',
        }),
        myFormat,
      ),
    }),
    new transports.File({
      level: 'info',
      filename: 'logs/api.log',
      handleExceptions: true,
      json: true,
      maxsize: 1024, // 1MB
      maxFiles: 3,
      colorize: false,
    }),
  ],
})

export const stream = {
  write: function (message, encoding) {
    message = message.substring(0, message.lastIndexOf('\n')).replace('\n', '')
    logger.info(message)
  },
}

export default { logger, stream }

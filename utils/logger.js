/**
 * @file:        /src/util/logger.ts
 * @description: log information to console and files
 * @version 2023-12-22 C2RLO - Add parent-module as label
 * @version 2023-12-02 C2RLO - Initial add parent-module
 */

import { createLogger, format, transports } from 'winston'
const { combine, timestamp, printf, colorize } = format

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

createLogger.emitErrs = true

export const logger = createLogger({
  transports: [
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
          format: 'YYYY-MM-DD HH:mm:ss.ff'
        }),
        myFormat
      )
    }),
    new transports.File({
      level: 'info',
      filename: './logs/api.log',
      handleExceptions: true,
      json: true,
      maxsize: 1024000, // 1MB
      maxFiles: 3,
      colorize: false
    })
  ]
})

export const stream = {
  write: function (message, encoding) {
    // logger.info(message)
    logger.info(message.substring(0,message.lastIndexOf('\n\r')))
  }
}

export default { logger, stream }

/**
 * @file:        /src/util/logger.ts
 * @description: log information to console and files
 * @version 2024-01-30 C2RLO - Add rotate files
 * @version 2023-12-22 C2RLO - Add parent-module as label
 * @version 2023-12-02 C2RLO - Initial add parent-module
 */

import 'winston-daily-rotate-file'

import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf, colorize } = format
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message} ${process.env.PARENT_MODULE ? `parent-module: ${process.env.PARENT_MODULE}` : ''}`
})

const transport = new transports.DailyRotateFile({
  filename: 'logs/%DATE%.log',
  datePattern: 'YYYYMMDD',
  maxFiles: '3d',
  level: 'debug',
})

// transport.on('rotate', function (_oldFilename, _newFilename) {
//   // do something fun
// });

export const logger = createLogger({
  transports: [
    transport,
    new transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: combine(
        format.splat(),
        colorize(),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        myFormat,
      ),
    }),
    new transports.File({
      level: 'debug',
      filename: 'logs/api.log',
      handleExceptions: true,
      maxsize: 1024, // 1MB
      maxFiles: 3,
    }),
  ],
})

export const stream = {
  write: function (message: string) {
    message = message.substring(0, message.lastIndexOf('\n')).replace('\n', '')
    logger.info(message)
  },
}

export default { logger, stream }

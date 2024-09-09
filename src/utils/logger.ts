/**
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

export const logger = createLogger({
  transports: [
    new transports.DailyRotateFile({
      level: 'debug',
      handleExceptions: true,
      filename: 'logs/%DATE%.log',
      datePattern: 'YYYYMMDD',
      maxFiles: '1d',
      format: combine(
        format.splat(),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        myFormat,
      ),
    }),
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
  ],
})

export const stream = {
  write: function (message: string) {
    message = message.substring(0, message.lastIndexOf('\n')).replace('\n', '')
    logger.info(message)
  },
}

export default { logger, stream }

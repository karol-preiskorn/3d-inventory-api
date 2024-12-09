/**
 * @description: log information to console and files.
 * @module: utils
 */

import 'winston-daily-rotate-file'

import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf, colorize } = format
const myFormat = printf(({ level, message, timestamp }: { level: string, message: unknown, timestamp?: string }) => {
  let parentModuleInfo = ''
  if (process.env.PARENT_MODULE) {
    parentModuleInfo = ` parent-module: ${process.env.PARENT_MODULE}`
  }
  return `${timestamp} ${level}: ${message}${parentModuleInfo}`
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
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        myFormat
      )
    }),
    new transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: combine(
        format.splat(),
        colorize(),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        myFormat
      )
    })
  ]
})

export const stream = {
  write: function (message: string) {
    message = message.substring(0, message.lastIndexOf('\n')).replace('\n', '')
    logger.info(message)
  }
}

export default logger

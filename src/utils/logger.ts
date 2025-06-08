/**
 * Logger utility using Winston.
 *
 * Provides logging to both console and daily rotated log files.
 * Each log entry includes a timestamp, module name, and formatted message.
 * Handles exceptions and supports child loggers for module-specific logging.
 *
 * @module utils/logger
 */

import 'winston-daily-rotate-file';

import winston from 'winston';

const { createLogger, format, transports } = winston;

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format((info) => {
    info.moduleName = info.moduleName ?? 'default';
    info.level = info.level.toUpperCase();
    info.message = typeof info.message === 'string' ? info.message.trim() : info.message;
    return info;
  })(),
  format.printf(({ timestamp, moduleName, level, message }) =>
    `${timestamp} [${moduleName}] ${level}: ${message}`
  )
);

export const logger = createLogger({
  level: 'debug',
  handleExceptions: true,
  transports: [
    new transports.DailyRotateFile({
      filename: 'logs/%DATE%.log',
      datePattern: 'YYYYMMDD',
      maxFiles: '14d',
      format: logFormat
    }),
    new transports.Console({
      format: logFormat
    })
  ]
});

/**
 * Returns a child logger with the specified module name.
 *
 * @param moduleName - The name of the module for log identification.
 * @returns A child logger instance with the module name set.
 */
export default function getLogger(moduleName: string) {
  return logger.child({ moduleName });
}

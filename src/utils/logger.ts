/**
 * @description: Logs information to console and files using Winston.
 *               The logger includes two transports: a DailyRotateFile transport
 *               for saving logs to files with a date-based naming pattern, and a
 *               Console transport for outputting logs to the console. Both transports
 *               handle exceptions, and the logs are formatted to include a module name
 *               and a custom message format.
 * @module: utils
 */

import 'winston-daily-rotate-file';

import winston from 'winston';

export const logger = winston.createLogger({
  transports: [
    new winston.transports.DailyRotateFile({
      level: 'debug',
      handleExceptions: true,
      filename: 'logs/%DATE%.log',
      datePattern: 'YYYYMMDD',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format((info) => {
          info.moduleName = info.moduleName || 'default'; // Add default moduleName if not present
          return info;
        })(),
        winston.format.printf(options => {
          return `[${options.moduleName}] ${options.level}: ${options.message}$`;
        })
      )
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: winston.format.printf(options => {
        return `[${options.moduleName}] ${options.level}: ${options.message}`;
      })
    })
  ]
});

export default function (name: any) {
  return logger.child({ moduleName: name });
}

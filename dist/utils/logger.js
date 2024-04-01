'use strict'
/**
 * @file:        /src/util/logger.ts
 * @description: log information to console and files
 * @version 2024-01-30 C2RLO - Add rotate files
 * @version 2023-12-22 C2RLO - Add parent-module as label
 * @version 2023-12-02 C2RLO - Initial add parent-module
 */
Object.defineProperty(exports, '__esModule', { value: true })
exports.stream = exports.logger = void 0
const winston_1 = require('winston')
require('winston-daily-rotate-file')
const { combine, timestamp, printf, colorize } = winston_1.format
const transport = new winston_1.transports.DailyRotateFile({
  filename: 'logs/%DATE%.log',
  datePattern: 'YYYYMMDD',
  zippedArchive: true,
  maxSize: '1m',
  maxFiles: '1d',
})
transport.on('rotate', function (_oldFilename, _newFilename) {
  // do something fun
})
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})
exports.logger = (0, winston_1.createLogger)({
  transports: [
    transport,
    new winston_1.transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: combine(
        winston_1.format.splat(),
        colorize(),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.ff',
        }),
        myFormat,
      ),
    }),
    new winston_1.transports.File({
      level: 'info',
      filename: 'logs/api.log',
      handleExceptions: true,
      maxsize: 1024, // 1MB
      maxFiles: 3,
    }),
  ],
})
exports.stream = {
  write: function (message, _encoding) {
    message = message.substring(0, message.lastIndexOf('\n')).replace('\n', '')
    exports.logger.info(message)
  },
}
exports.default = { logger: exports.logger, stream: exports.stream }
//# sourceMappingURL=logger.js.map

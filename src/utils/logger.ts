/**
 * Logger utility using Pino.
 * Optimized for Cloud Run and Google Cloud Logging.
 */

import pino from 'pino';

// Cloud Run/Production configuration
const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  // Cloud Run structured logging
  ...(isProduction && {
    formatters: {
      level: (label) => ({ severity: label.toUpperCase() })
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`
  }),

  // Development pretty printing
  ...(!isProduction && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
        singleLine: true
      }
    }
  })
});

/**
 * Returns a child logger with the specified module name.
 */
export default function getLogger(moduleName: string) {
  return logger.child({ module: moduleName });
}

export { logger };

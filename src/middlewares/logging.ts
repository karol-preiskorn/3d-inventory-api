import { RequestHandler } from 'express';
import getLogger from '../utils/logger';

const logger = getLogger('logging-middleware');

/**
 * Enhanced request logging middleware
 */
export const requestLogger: RequestHandler = (req, res, next) => {
  const startTime = Date.now();

  const { method, originalUrl, ip, headers } = req;

  const userAgent = headers['user-agent'] || 'Unknown';

  const contentType = headers['content-type'] || 'Not specified';

  // Log request start
  logger.info(`🚀 ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent} - Content-Type: ${contentType}`);

  // Store original response timing
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const { statusCode } = res;

    const statusEmoji = statusCode >= 400 ? '❌' : statusCode >= 300 ? '🔄' : '✅';

    logger.info(`${statusEmoji} ${method} ${originalUrl} - ${statusCode} - ${duration}ms`);
  });

  next();
};

/**
 * Error logging middleware
 */
export const errorLogger: RequestHandler = (req, res, next) => {
  // Store original res.status and res.json methods
  const originalStatus = res.status;

  const originalJson = res.json;

  // Override res.status to capture status codes
  res.status = function (code: number) {
    if (code >= 400) {
      logger.warn(`⚠️ ${req.method} ${req.originalUrl} - Status: ${code}`);
    }

    return originalStatus.call(this, code);
  };

  // Override res.json to log error responses
  res.json = function (body: unknown) {
    if (res.statusCode >= 400 && body && typeof body === 'object') {
      const errorBody = body as Record<string, unknown>;

      logger.error(`💥 ${req.method} ${req.originalUrl} - Error Response: Status ${res.statusCode}, Error: ${errorBody.error || 'Unknown Error'}, Message: ${errorBody.message || 'No message provided'}`);
    }

    return originalJson.call(this, body);
  };

  next();
};

/**
 * Performance monitoring middleware
 */
export const performanceMonitor: RequestHandler = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();

    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    if (duration > 1000) { // Log slow requests (>1 second)
      logger.warn(`🐌 Slow request: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
    } else if (duration > 500) { // Log moderately slow requests (>500ms)
      logger.info(`⏰ ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
    }
  });

  next();
};

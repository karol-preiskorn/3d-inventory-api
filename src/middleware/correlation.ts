/**
 * Correlation ID middleware for request tracing
 * Generates and tracks correlation IDs for better observability
 */

import { randomUUID } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import getLogger from '../utils/logger'

const logger = getLogger('correlation')

export interface RequestWithCorrelation extends Request {
  correlationId: string
  startTime: bigint
}

/**
 * Generate a new correlation ID
 */
export function generateCorrelationId(): string {
  return `req_${randomUUID().replace(/-/g, '').substring(0, 16)}`
}

/**
 * Middleware to add correlation ID to requests
 * Also adds performance tracking
 */
export const correlationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const correlationId =
    (req.headers['x-correlation-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    generateCorrelationId()

  // Add correlation ID to request
  ;(req as RequestWithCorrelation).correlationId = correlationId
  ;(req as RequestWithCorrelation).startTime = process.hrtime.bigint()

  // Add correlation ID to response headers
  res.setHeader('x-correlation-id', correlationId)

  // Log request start with correlation ID
  logger.info(`[${correlationId}] Request started: ${req.method} ${req.originalUrl} - IP: ${req.ip}`)

  // Override res.end to log request completion
  const originalEnd = res.end

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.end = function (...args: any[]): Response {
    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - (req as RequestWithCorrelation).startTime) / 1000000 // ms
    const logMessage = `[${correlationId}] Request completed: ${req.method} ${req.originalUrl} - ${res.statusCode} - ${Math.round(duration * 100) / 100}ms`

    if (res.statusCode >= 400) {
      logger.warn(logMessage)
    } else {
      logger.info(logMessage)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (originalEnd as any).apply(this, args)
  }

  next()
}

/**
 * Get correlation ID from request
 */
export function getCorrelationId(req: Request): string {
  return (req as RequestWithCorrelation).correlationId || 'unknown'
}

/**
 * Get request start time
 */
export function getRequestStartTime(req: Request): bigint {
  return (req as RequestWithCorrelation).startTime || process.hrtime.bigint()
}

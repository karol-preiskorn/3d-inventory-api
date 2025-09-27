/**
 * @file errors.ts
 * @description Centralized error handling utilities and custom error classes
 */

import { NextFunction, Request, Response } from 'express'
import getLogger from './logger'

const logger = getLogger('errors')

/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: Record<string, unknown>
  public readonly isOperational: boolean

  constructor(statusCode: number, message: string, code?: string, details?: Record<string, unknown>, isOperational = true) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code || `ERROR_${statusCode}`
    this.details = details
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Predefined error types for common scenarios
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, message, 'VALIDATION_ERROR', details)
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`

    super(404, message, 'NOT_FOUND')
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(409, message, 'CONFLICT_ERROR', details)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access') {
    super(401, message, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden') {
    super(403, message, 'FORBIDDEN')
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(500, 'Database operation failed', 'DATABASE_ERROR', { originalMessage: message, ...details })
  }
}

/**
 * Standard API response interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    timestamp: string
    requestId?: string
    version?: string
  }
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, meta?: Partial<ApiResponse['meta']>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  }
}

/**
 * Error response helper
 */
export function errorResponse(error: ApiError, requestId?: string): ApiResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId
    }
  }
}

// MongoDB error interface
interface MongoError extends Error {
  code?: number
  keyValue?: Record<string, unknown>
  path?: string
  value?: unknown
}

// Validation error interface
interface ValidationErrorDetail {
  field?: string
  param?: string
  path?: string
  msg: string
  value?: unknown
}

/**
 * Global error handling middleware
 */
export function errorHandler(error: Error | ApiError, req: Request, res: Response, _next: NextFunction): void {
  const requestId = (req as Request & { correlationId?: string }).correlationId || 'unknown'

  // Log error details (simplified for logger compatibility)
  logger.error(`API Error occurred - ${error.message}`)

  // Handle known API errors
  if (error instanceof ApiError) {
    res.status(error.statusCode).json(errorResponse(error, requestId))

    return
  }

  // Handle MongoDB duplicate key errors
  const mongoError = error as MongoError

  if (mongoError.code === 11000) {
    const duplicateError = new ConflictError('Resource already exists', { duplicateFields: Object.keys(mongoError.keyValue || {}) })

    res.status(duplicateError.statusCode).json(errorResponse(duplicateError, requestId))

    return
  }

  // Handle MongoDB CastError (invalid ObjectId)
  if (error.name === 'CastError') {
    const castError = new ValidationError('Invalid ID format', { field: mongoError.path, value: mongoError.value })

    res.status(castError.statusCode).json(errorResponse(castError, requestId))

    return
  }

  // Handle unexpected errors
  const unexpectedError = new ApiError(500, 'Internal server error', 'INTERNAL_ERROR', undefined, false)

  res.status(500).json(errorResponse(unexpectedError, requestId))
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  const requestId = (req as Request & { correlationId?: string }).correlationId || 'unknown'
  const notFoundError = new NotFoundError('Endpoint', req.path)

  logger.warn(`Endpoint not found - ${req.method} ${req.path}`)

  res.status(404).json(errorResponse(notFoundError, requestId))
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler<T extends Request = Request>(fn: (req: T, res: Response, next: NextFunction) => Promise<void>) {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Validation error formatter for express-validator
 */
export function formatValidationErrors(errors: ValidationErrorDetail[]): ValidationError {
  const details = errors.map((error) => ({
    field: error.field || error.param || error.path,
    message: error.msg,
    value: error.value
  }))

  return new ValidationError('Validation failed', { errors: details })
}

import Ajv, { ErrorObject, JSONSchemaType } from 'ajv'
import addFormats from 'ajv-formats'
import { NextFunction, Request, Response } from 'express'
import getLogger from '../utils/logger'

const logger = getLogger('validation')
const ajv = new Ajv({
  allErrors: true,
  removeAdditional: false,
  useDefaults: true,
  coerceTypes: true
})

// Add format support (email, date-time, etc.)
addFormats(ajv)

/**
 * Standardized API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Array<{
      field?: string
      message: string
    }>
  }
  meta: {
    timestamp: string
    version: string
    total?: number
    page?: number
    limit?: number
  }
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.3',
      ...meta
    }
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(code: string, message: string, details?: Array<{ field?: string; message: string }>): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.3'
    }
  }
}

/**
 * Convert AJV validation errors to our standard format
 */
function formatValidationErrors(errors: ErrorObject[]): Array<{ field?: string; message: string }> {
  return errors.map((error) => ({
    field: error.instancePath ? error.instancePath.substring(1) : error.schemaPath,
    message: `${error.instancePath || 'root'} ${error.message}`
  }))
}

/**
 * Middleware to validate request body against JSON schema
 */
export function validateBody<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema)

  return (req: Request, res: Response, next: NextFunction) => {
    if (!validate(req.body)) {
      logger.warn(`Request body validation failed: ${req.method} ${req.url}`)

      const errorResponse = createErrorResponse('VALIDATION_ERROR', 'Request body validation failed', formatValidationErrors(validate.errors || []))

      return res.status(400).json(errorResponse)
    }

    next()
  }
}

/**
 * Middleware to validate query parameters against JSON schema
 */
export function validateQuery<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema)

  return (req: Request, res: Response, next: NextFunction) => {
    if (!validate(req.query)) {
      logger.warn(`Query parameters validation failed: ${req.method} ${req.url}`)

      const errorResponse = createErrorResponse('VALIDATION_ERROR', 'Query parameters validation failed', formatValidationErrors(validate.errors || []))

      return res.status(400).json(errorResponse)
    }

    next()
  }
}

/**
 * Middleware to validate URL parameters against JSON schema
 */
export function validateParams<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema)

  return (req: Request, res: Response, next: NextFunction) => {
    if (!validate(req.params)) {
      logger.warn(`URL parameters validation failed: ${req.method} ${req.url}`)

      const errorResponse = createErrorResponse('VALIDATION_ERROR', 'URL parameters validation failed', formatValidationErrors(validate.errors || []))

      return res.status(400).json(errorResponse)
    }

    next()
  }
}

/**
 * Middleware to format all responses with standard structure
 */
export function responseFormatter(req: Request, res: Response, next: NextFunction) {
  // Store the original json method
  const originalJson = res.json

  // Override the json method to format responses
  res.json = function (data: unknown) {
    // If data is already in our standard format, don't modify it
    if (data && typeof data === 'object' && 'success' in data && 'meta' in data) {
      return originalJson.call(this, data)
    }

    // Format the response
    const formattedResponse: ApiResponse = {
      success: res.statusCode >= 200 && res.statusCode < 400,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.3'
      }
    }

    return originalJson.call(this, formattedResponse)
  }

  next()
}

/**
 * Common JSON schemas for validation
 */
export const CommonSchemas = {
  /**
   * MongoDB ObjectId pattern
   */
  mongoId: {
    type: 'string' as const,
    pattern: '^[0-9A-Fa-f]{24}$',
    minLength: 24,
    maxLength: 24
  },

  /**
   * Pagination parameters
   */
  pagination: {
    type: 'object' as const,
    properties: {
      page: {
        type: 'number' as const,
        minimum: 1,
        default: 1
      },
      limit: {
        type: 'number' as const,
        minimum: 1,
        maximum: 100,
        default: 20
      },
      sort: {
        type: 'string' as const,
        pattern: '^[a-zA-Z_][a-zA-Z0-9_]*:(asc|desc)$',
        nullable: true
      },
      search: {
        type: 'string' as const,
        minLength: 1,
        maxLength: 100,
        nullable: true
      }
    },
    additionalProperties: true
  } as JSONSchemaType<{
    page?: number
    limit?: number
    sort?: string | null
    search?: string | null
    [key: string]: unknown
  }>,

  /**
   * ID parameter schema
   */
  idParam: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string' as const,
        pattern: '^[0-9A-Fa-f]{24}$',
        minLength: 24,
        maxLength: 24
      }
    },
    required: ['id'] as const,
    additionalProperties: false
  } as JSONSchemaType<{ id: string }>
}

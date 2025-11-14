---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**/*.ts,**/*.js'
description: Error Handling Standards & Patterns for 3D Inventory API
---

# Error Handling Standards

This document defines error handling patterns and standards for the 3D Inventory API.

## Error Class Hierarchy

### Base Error Class

```typescript
// ✅ CORRECT - Base API error class
export class ApiError extends Error {
  public statusCode: number
  public isOperational: boolean
  public timestamp: string

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.timestamp = new Date().toISOString()

    Error.captureStackTrace(this, this.constructor)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
```

### Specific Error Classes

```typescript
// ✅ CORRECT - Domain-specific error classes
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details?: any) {
    super(message, 400)
    this.name = 'ValidationError'
    if (details) {
      this.details = details
    }
  }

  public details?: any
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource', id?: string) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource already exists') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}

export class DatabaseError extends ApiError {
  constructor(message = 'Database operation failed') {
    super(message, 500, false)
    this.name = 'DatabaseError'
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, message?: string) {
    super(message || `External service ${service} is unavailable`, 503, false)
    this.name = 'ExternalServiceError'
  }
}
```

## Error Handling Middleware

### Global Error Handler

```typescript
// ✅ CORRECT - Comprehensive error handling middleware
import { Request, Response, NextFunction } from 'express'
import getLogger from '../utils/logger'

const logger = getLogger('error-handler')

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  // Log all errors
  logger.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
  })

  // Handle operational errors (ApiError)
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      timestamp: error.timestamp,
      path: req.path,
      ...(error instanceof ValidationError &&
        error.details && {
          details: error.details,
        }),
    })
    return
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      timestamp: new Date().toISOString(),
    })
    return
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token has expired',
      timestamp: new Date().toISOString(),
    })
    return
  }

  // Handle MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    const mongoError = error as any

    // Duplicate key error
    if (mongoError.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Resource already exists',
        timestamp: new Date().toISOString(),
      })
      return
    }

    // General MongoDB error
    res.status(500).json({
      success: false,
      message: 'Database operation failed',
      timestamp: new Date().toISOString(),
    })
    return
  }

  // Handle validation errors from libraries
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString(),
    })
    return
  }

  // Handle unexpected errors
  logger.error('Unexpected error:', error)

  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message

  res.status(500).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && {
      stack: error.stack,
    }),
  })
}
```

### Not Found Handler

```typescript
// ✅ CORRECT - 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError('Endpoint', req.path)
  next(error)
}

// Register before error handler
app.use(notFoundHandler)
app.use(errorHandler)
```

## Error Handling in Controllers

### Try-Catch Pattern

```typescript
// ✅ CORRECT - Proper error handling in controllers
export const getDeviceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    // Validate input
    if (!id || !ObjectId.isValid(id)) {
      throw new ValidationError('Invalid device ID format')
    }

    // Get device from service
    const deviceService = DeviceService.getInstance()
    const device = await deviceService.getDeviceById(id)

    // Check if found
    if (!device) {
      throw new NotFoundError('Device', id)
    }

    // Return success response
    res.json(successResponse(device))
  } catch (error) {
    // Pass to error handler
    next(error)
  }
}
```

### Async Error Wrapper

```typescript
// ✅ CORRECT - Async error wrapper utility
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Usage - no try-catch needed
export const getDevices = asyncHandler(async (req, res, next) => {
  const devices = await deviceService.getDevices()
  res.json(successResponse(devices))
})
```

## Error Handling in Services

### Service Layer Errors

```typescript
// ✅ CORRECT - Error handling in services
export class DeviceService {
  async getDeviceById(id: string): Promise<Device> {
    try {
      const db = getDatabase()
      const collection = db.collection('devices')

      const device = await collection.findOne({
        _id: new ObjectId(id),
      })

      if (!device) {
        throw new NotFoundError('Device', id)
      }

      return device as Device
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logger.error('Error retrieving device:', error)
      throw new DatabaseError('Failed to retrieve device')
    }
  }

  async createDevice(deviceData: CreateDeviceRequest): Promise<Device> {
    try {
      // Validate business rules
      await this.validateDeviceData(deviceData)

      // Check for duplicates
      const exists = await this.deviceExists(deviceData.position)
      if (exists) {
        throw new ConflictError('Device already exists at this position')
      }

      const db = getDatabase()
      const collection = db.collection('devices')

      const result = await collection.insertOne({
        ...deviceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return {
        ...deviceData,
        _id: result.insertedId.toString(),
      } as Device
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logger.error('Error creating device:', error)
      throw new DatabaseError('Failed to create device')
    }
  }

  private async validateDeviceData(data: CreateDeviceRequest): Promise<void> {
    const errors: string[] = []

    if (!data.name || data.name.trim().length < 3) {
      errors.push('Device name must be at least 3 characters')
    }

    if (!data.modelId) {
      errors.push('Model ID is required')
    }

    if (!data.position || data.position.x < 0 || data.position.y < 0) {
      errors.push('Valid position coordinates are required')
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors)
    }
  }
}
```

## Validation Error Handling

### Input Validation

```typescript
// ✅ CORRECT - Comprehensive validation with detailed errors
export const validateCreateDevice = (req: Request, res: Response, next: NextFunction): void => {
  const { name, modelId, position, attributes } = req.body
  const errors: Record<string, string> = {}

  // Validate name
  if (!name) {
    errors.name = 'Device name is required'
  } else if (typeof name !== 'string') {
    errors.name = 'Device name must be a string'
  } else if (name.trim().length < 3) {
    errors.name = 'Device name must be at least 3 characters'
  }

  // Validate modelId
  if (!modelId) {
    errors.modelId = 'Model ID is required'
  } else if (!ObjectId.isValid(modelId)) {
    errors.modelId = 'Invalid Model ID format'
  }

  // Validate position
  if (!position) {
    errors.position = 'Position is required'
  } else {
    if (typeof position.x !== 'number') {
      errors['position.x'] = 'X coordinate must be a number'
    } else if (position.x < 0) {
      errors['position.x'] = 'X coordinate must be non-negative'
    }

    if (typeof position.y !== 'number') {
      errors['position.y'] = 'Y coordinate must be a number'
    } else if (position.y < 0) {
      errors['position.y'] = 'Y coordinate must be non-negative'
    }
  }

  // Validate attributes if provided
  if (attributes && !Array.isArray(attributes)) {
    errors.attributes = 'Attributes must be an array'
  }

  // If validation errors, throw ValidationError
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors)
  }

  next()
}
```

## Error Logging

### Structured Error Logging

```typescript
// ✅ CORRECT - Structured error logging
import winston from 'winston'

const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
})

export const logError = (error: Error, context?: Record<string, any>): void => {
  errorLogger.error({
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  })
}

// Usage
try {
  await deviceService.createDevice(deviceData)
} catch (error) {
  logError(error as Error, {
    operation: 'createDevice',
    userId: req.user?.id,
    deviceData,
  })
  throw error
}
```

## Error Response Format

### Standardized Error Responses

```typescript
// ✅ CORRECT - Consistent error response format
export interface ErrorResponse {
  success: false
  message: string
  timestamp: string
  path?: string
  statusCode?: number
  details?: any
  stack?: string
}

export const formatErrorResponse = (error: ApiError, req: Request): ErrorResponse => {
  const response: ErrorResponse = {
    success: false,
    message: error.message,
    timestamp: error.timestamp,
    path: req.path,
    statusCode: error.statusCode,
  }

  // Add validation details if available
  if (error instanceof ValidationError && error.details) {
    response.details = error.details
  }

  // Add stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = error.stack
  }

  return response
}
```

## Testing Error Handling

```typescript
// ✅ CORRECT - Test error scenarios
describe('Error Handling', () => {
  describe('getDeviceById', () => {
    it('should throw ValidationError for invalid ID', async () => {
      await expect(deviceService.getDeviceById('invalid-id')).rejects.toThrow(ValidationError)
    })

    it('should throw NotFoundError for non-existent device', async () => {
      const validId = new ObjectId().toString()

      await expect(deviceService.getDeviceById(validId)).rejects.toThrow(NotFoundError)
    })

    it('should throw DatabaseError on connection failure', async () => {
      mockDb.collection.mockImplementation(() => {
        throw new Error('Connection failed')
      })

      await expect(deviceService.getDeviceById(validId)).rejects.toThrow(DatabaseError)
    })
  })

  describe('Error Handler Middleware', () => {
    it('should return 400 for ValidationError', async () => {
      const response = await request(app).post('/api/devices').send({ name: '' }).expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Validation')
    })

    it('should return 404 for NotFoundError', async () => {
      const response = await request(app).get('/api/devices/nonexistent-id').expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('not found')
    })
  })
})
```

## Related Documentation

- [api_design.instructions.md](./api_design.instructions.md)
- [database_patterns.instructions.md](./database_patterns.instructions.md)
- [logging.instructions.md](./logging.instructions.md)
- [test_coverage_standards.instructions.md](./test_coverage_standards.instructions.md)

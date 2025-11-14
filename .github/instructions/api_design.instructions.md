---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**/*.ts,**/*.js'
description: REST API Design Standards for 3D Inventory API
---

# REST API Design Standards

This document defines REST API design patterns and standards for the 3D Inventory API.

## HTTP Methods & Status Codes

### Standard HTTP Methods

```typescript
// GET - Retrieve resources (read-only, idempotent)
router.get('/api/devices', getDevices) // 200 OK
router.get('/api/devices/:id', getDeviceById) // 200 OK or 404 Not Found

// POST - Create new resources (not idempotent)
router.post('/api/devices', createDevice) // 201 Created

// PUT - Replace entire resource (idempotent)
router.put('/api/devices/:id', updateDevice) // 200 OK or 404 Not Found

// PATCH - Partial update (not always idempotent)
router.patch('/api/devices/:id', patchDevice) // 200 OK or 404 Not Found

// DELETE - Remove resource (idempotent)
router.delete('/api/devices/:id', deleteDevice) // 204 No Content or 404
```

### HTTP Status Codes

```typescript
// Success codes (2xx)
export const HTTP_STATUS = {
  OK: 200, // Successful GET, PUT, PATCH
  CREATED: 201, // Successful POST
  ACCEPTED: 202, // Request accepted, processing
  NO_CONTENT: 204, // Successful DELETE

  // Client error codes (4xx)
  BAD_REQUEST: 400, // Invalid request data
  UNAUTHORIZED: 401, // Authentication required
  FORBIDDEN: 403, // Insufficient permissions
  NOT_FOUND: 404, // Resource not found
  CONFLICT: 409, // Duplicate resource
  UNPROCESSABLE_ENTITY: 422, // Validation failed

  // Server error codes (5xx)
  INTERNAL_SERVER_ERROR: 500, // Unexpected server error
  SERVICE_UNAVAILABLE: 503, // Service temporarily down
}
```

## Request/Response Patterns

### Standard Response Format

```typescript
// ✅ CORRECT - Consistent response structure
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  meta?: {
    timestamp: string
    [key: string]: any
  }
}

// Success response
export const successResponse = <T>(data: T, message = 'Success', meta?: any): ApiResponse<T> => ({
  success: true,
  message,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    ...meta,
  },
})

// Error response
export const errorResponse = (message: string, errors?: any[]): ApiResponse<null> => ({
  success: false,
  message,
  data: null,
  meta: {
    timestamp: new Date().toISOString(),
    errors,
  },
})
```

### Paginated Responses

```typescript
// ✅ CORRECT - Pagination pattern
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const paginatedResponse = <T>(data: T[], page: number, limit: number, total: number): PaginatedResponse<T> => ({
  success: true,
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
})

// Controller usage
export const getDevices = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10

  const devices = await deviceService.getDevices(page, limit)
  const total = await deviceService.count()

  res.json(paginatedResponse(devices, page, limit, total))
}
```

## Endpoint Naming Conventions

### Resource-Based URLs

```typescript
// ✅ CORRECT - RESTful resource naming
/api/devices              // Collection
/api/devices/:id          // Individual resource
/api/devices/:id/connections  // Nested resource
/api/models               // Separate resource collection
/api/users                // User management

// ❌ INCORRECT - Action-based URLs (avoid)
/api/getDevices
/api/createDevice
/api/deleteDevice
```

### Query Parameters

```typescript
// ✅ CORRECT - Query parameters for filtering, sorting, pagination
GET /api/devices?page=1&limit=10&sort=name&order=asc&category=server

// Controller implementation
export const getDevices = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    category,
    search
  } = req.query

  const filters: any = {}

  if (category) {
    filters.category = category
  }

  if (search) {
    filters.$text = { $search: search as string }
  }

  const devices = await deviceService.findMany(filters, {
    skip: (Number(page) - 1) * Number(limit),
    limit: Number(limit),
    sort: { [sort as string]: order === 'asc' ? 1 : -1 }
  })

  res.json(successResponse(devices))
}
```

## Request Validation

### Input Validation Pattern

```typescript
// ✅ CORRECT - Validate all input data
export const createDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, modelId, position, attributes } = req.body

    // Validate required fields
    if (!name || typeof name !== 'string') {
      throw new ValidationError('Device name is required and must be a string')
    }

    if (!modelId || typeof modelId !== 'string') {
      throw new ValidationError('Model ID is required')
    }

    if (!position || typeof position !== 'object') {
      throw new ValidationError('Position is required')
    }

    // Validate position structure
    if (typeof position.x !== 'number' || typeof position.y !== 'number') {
      throw new ValidationError('Position must have numeric x and y coordinates')
    }

    // Validate business rules
    if (position.x < 0 || position.y < 0) {
      throw new ValidationError('Position coordinates must be non-negative')
    }

    // Proceed with validated data
    const device = await deviceService.create({
      name: name.trim(),
      modelId,
      position,
      attributes: attributes || [],
    })

    res.status(HTTP_STATUS.CREATED).json(successResponse(device, 'Device created successfully'))
  } catch (error) {
    next(error)
  }
}
```

## Error Handling

### Custom Error Classes

```typescript
// ✅ CORRECT - Structured error hierarchy
export class ApiError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed') {
    super(message, HTTP_STATUS.BAD_REQUEST)
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, HTTP_STATUS.UNAUTHORIZED)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN)
  }
}

export class DatabaseError extends ApiError {
  constructor(message = 'Database operation failed') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
```

### Global Error Handler

```typescript
// ✅ CORRECT - Global error handling middleware
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json(errorResponse(error.message))
    return
  }

  // Log unexpected errors
  logger.error('Unexpected error:', error)

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse(message))
}

// Register as last middleware
app.use(errorHandler)
```

## API Versioning

```typescript
// ✅ CORRECT - Version in URL path
const v1Router = express.Router()
v1Router.get('/devices', getDevices)
app.use('/api/v1', v1Router)

const v2Router = express.Router()
v2Router.get('/devices', getDevicesV2)
app.use('/api/v2', v2Router)

// Current version without version prefix (redirects to latest)
app.use('/api', v2Router)
```

## CORS Configuration

```typescript
// ✅ CORRECT - Secure CORS setup
import cors from 'cors'

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || []

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
```

## Rate Limiting

```typescript
// ✅ CORRECT - API rate limiting
import rateLimit from 'express-rate-limit'

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: errorResponse('Too many requests, please try again later'),
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', apiLimiter)

// Stricter limits for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: errorResponse('Too many authentication attempts'),
})

app.use('/api/login', authLimiter)
```

## Documentation Requirements

### OpenAPI/Swagger Documentation

```typescript
/**
 * @openapi
 * /api/devices:
 *   post:
 *     summary: Create a new device
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeviceRequest'
 *     responses:
 *       201:
 *         description: Device created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export const createDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Implementation
}
```

## Testing API Endpoints

```typescript
// ✅ CORRECT - Comprehensive endpoint testing
describe('POST /api/devices', () => {
  it('should create device with valid data', async () => {
    const deviceData = {
      name: 'Test Device',
      modelId: 'model-123',
      position: { x: 10, y: 20 },
    }

    const response = await request(app).post('/api/devices').set('Authorization', `Bearer ${validToken}`).send(deviceData).expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.data).toMatchObject(deviceData)
  })

  it('should return 400 for invalid data', async () => {
    const invalidData = { name: '' }

    const response = await request(app).post('/api/devices').set('Authorization', `Bearer ${validToken}`).send(invalidData).expect(400)

    expect(response.body.success).toBe(false)
  })

  it('should return 401 without authentication', async () => {
    await request(app).post('/api/devices').send({}).expect(401)
  })
})
```

## Related Documentation

- [authentication.instructions.md](./authentication.instructions.md)
- [error_handling.instructions.md](./error_handling.instructions.md)
- [swagger.instructions.md](./swagger.instructions.md)
- [code_quality_standards.instructions.md](./code_quality_standards.instructions.md)

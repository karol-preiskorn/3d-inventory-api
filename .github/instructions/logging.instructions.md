---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**/*.ts,**/*.js'
description: Logging Standards & Requirements for 3D Inventory API
---

# Logging Standards

This document defines logging patterns and standards for the 3D Inventory API.

## Winston Logger Configuration

### Logger Setup

```typescript
// ✅ CORRECT - Winston logger configuration
import winston from 'winston'
import config from './config'

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
)

const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: '3d-inventory-api' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
})

// Console output in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  )
}

export default function getLogger(module: string) {
  return logger.child({ module })
}
```

## Log Levels

### Standard Log Levels

```typescript
// ✅ CORRECT - Use appropriate log levels
const logger = getLogger('UserService')

// ERROR - Application errors that need immediate attention
logger.error('Database connection failed', { error: err.message })

// WARN - Warning conditions that should be reviewed
logger.warn('Rate limit approaching threshold', {
  user: userId,
  attempts: 4,
})

// INFO - Important application events
logger.info('User logged in successfully', {
  username: user.username,
  ip: req.ip,
})

// HTTP - HTTP request logging (typically via middleware)
logger.http('GET /api/devices', {
  statusCode: 200,
  responseTime: '45ms',
})

// VERBOSE - Detailed application flow
logger.verbose('Processing device creation', { deviceData })

// DEBUG - Debugging information (development only)
logger.debug('Cache hit', { key: cacheKey, ttl: 3600 })

// SILLY - Very detailed debugging (rarely used)
logger.silly('Variable state', { variableValue })
```

## Logging Patterns

### Request/Response Logging

```typescript
// ✅ CORRECT - HTTP request logging middleware
import { Request, Response, NextFunction } from 'express'
import morgan from 'morgan'

// Custom token for user ID
morgan.token('user-id', (req: Request) => {
  return req.user?.id || 'anonymous'
})

// Custom token for response time in ms
morgan.token('response-time-ms', (req: Request, res: Response) => {
  const responseTime = res.getHeader('X-Response-Time')
  return responseTime ? `${responseTime}ms` : '-'
})

// Logging format
const logFormat = ':method :url :status :response-time-ms - :user-id'

export const requestLogger = morgan(logFormat, {
  stream: {
    write: (message: string) => {
      const logger = getLogger('http')
      logger.http(message.trim())
    },
  },
})

// Usage
app.use(requestLogger)
```

### Service Layer Logging

```typescript
// ✅ CORRECT - Service method logging
export class DeviceService {
  private logger = getLogger('DeviceService')

  async createDevice(deviceData: CreateDeviceRequest): Promise<Device> {
    this.logger.info('Creating device', {
      name: deviceData.name,
      modelId: deviceData.modelId,
    })

    try {
      const device = await this.repository.create(deviceData)

      this.logger.info('Device created successfully', {
        deviceId: device._id,
        name: device.name,
      })

      return device
    } catch (error) {
      this.logger.error('Failed to create device', {
        error: (error as Error).message,
        deviceData,
      })
      throw error
    }
  }

  async deleteDevice(id: string): Promise<void> {
    this.logger.warn('Deleting device', { deviceId: id })

    try {
      await this.repository.deleteById(id)

      this.logger.info('Device deleted', { deviceId: id })
    } catch (error) {
      this.logger.error('Failed to delete device', {
        deviceId: id,
        error: (error as Error).message,
      })
      throw error
    }
  }
}
```

### Database Logging

```typescript
// ✅ CORRECT - Database operation logging
export async function connectToCluster(): Promise<MongoClient> {
  const logger = getLogger('database')

  try {
    logger.info('Connecting to MongoDB Atlas...')

    const client = new MongoClient(config.MONGODB_URI, options)
    await client.connect()

    logger.info('Successfully connected to MongoDB', {
      database: config.DB_NAME,
      poolSize: config.DB_MAX_POOL_SIZE,
    })

    return client
  } catch (error) {
    logger.error('MongoDB connection failed', {
      error: (error as Error).message,
      uri: config.MONGODB_URI.replace(/\/\/.*@/, '//*****@'), // Mask credentials
    })
    throw error
  }
}
```

## Audit Logging

### User Activity Logs

```typescript
// ✅ CORRECT - Audit log service
import { Collection, Db } from 'mongodb'

export interface AuditLog {
  timestamp: Date
  userId: string
  username: string
  action: string
  resource: string
  resourceId?: string
  changes?: {
    before: any
    after: any
  }
  metadata: {
    ip: string
    userAgent: string
  }
}

export class AuditLogService {
  private logger = getLogger('AuditLog')
  private collection: Collection<AuditLog>

  constructor(db: Db) {
    this.collection = db.collection('audit_logs')
  }

  async logAction(log: AuditLog): Promise<void> {
    try {
      await this.collection.insertOne(log)

      this.logger.info('Audit log created', {
        userId: log.userId,
        action: log.action,
        resource: log.resource,
      })
    } catch (error) {
      this.logger.error('Failed to create audit log', {
        error: (error as Error).message,
        log,
      })
    }
  }

  async logUserLogin(userId: string, username: string, success: boolean, req: Request): Promise<void> {
    await this.logAction({
      timestamp: new Date(),
      userId,
      username,
      action: success ? 'login_success' : 'login_failed',
      resource: 'authentication',
      metadata: {
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
      },
    })
  }

  async logResourceChange(
    userId: string,
    username: string,
    action: 'create' | 'update' | 'delete',
    resource: string,
    resourceId: string,
    before?: any,
    after?: any,
    req?: Request,
  ): Promise<void> {
    await this.logAction({
      timestamp: new Date(),
      userId,
      username,
      action: `${resource}_${action}`,
      resource,
      resourceId,
      changes: before && after ? { before, after } : undefined,
      metadata: {
        ip: req?.ip || 'system',
        userAgent: req?.get('user-agent') || 'system',
      },
    })
  }
}
```

### Usage in Controllers

```typescript
// ✅ CORRECT - Audit logging in controllers
export const updateDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Get current device state
    const deviceService = DeviceService.getInstance()
    const beforeDevice = await deviceService.getDeviceById(id)

    // Update device
    const afterDevice = await deviceService.updateDevice(id, updateData)

    // Log the change
    const auditLog = new AuditLogService(getDatabase())
    await auditLog.logResourceChange(req.user!.id, req.user!.username, 'update', 'device', id, beforeDevice, afterDevice, req)

    res.json(successResponse(afterDevice, 'Device updated'))
  } catch (error) {
    next(error)
  }
}
```

## Performance Logging

### Response Time Tracking

```typescript
// ✅ CORRECT - Performance monitoring middleware
export const performanceLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now()

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const logger = getLogger('performance')

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      })
    }

    // Log all requests in verbose mode
    logger.verbose('Request completed', {
      method: req.method,
      url: req.url,
      duration: `${duration}ms`,
      statusCode: res.statusCode,
    })
  })

  next()
}
```

### Database Query Performance

```typescript
// ✅ CORRECT - Database query performance logging
export class DeviceRepository {
  private logger = getLogger('DeviceRepository')

  async findMany(filter: any, options: any): Promise<Device[]> {
    const startTime = Date.now()

    try {
      const devices = await this.collection.find(filter, options).toArray()

      const duration = Date.now() - startTime

      // Log slow queries
      if (duration > 500) {
        this.logger.warn('Slow database query', {
          operation: 'findMany',
          duration: `${duration}ms`,
          filter,
          resultCount: devices.length,
        })
      }

      return devices
    } catch (error) {
      this.logger.error('Database query failed', {
        operation: 'findMany',
        filter,
        error: (error as Error).message,
      })
      throw error
    }
  }
}
```

## Security Logging

### Authentication Events

```typescript
// ✅ CORRECT - Security event logging
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const logger = getLogger('authentication')
  const { username } = req.body

  try {
    const userService = UserService.getInstance()
    const user = await userService.authenticateUser(username, req.body.password)

    // Log successful login
    logger.info('User login successful', {
      userId: user._id,
      username: user.username,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    // Audit log
    const auditLog = new AuditLogService(getDatabase())
    await auditLog.logUserLogin(user._id, user.username, true, req)

    const token = generateToken(user)
    res.json(successResponse({ token, user }))
  } catch (error) {
    // Log failed login attempt
    logger.warn('Login attempt failed', {
      username,
      ip: req.ip,
      error: (error as Error).message,
    })

    // Audit log for failed attempt
    const auditLog = new AuditLogService(getDatabase())
    await auditLog.logUserLogin('unknown', username, false, req)

    next(error)
  }
}
```

### Suspicious Activity Detection

```typescript
// ✅ CORRECT - Log suspicious activities
export const rateLimitExceeded = (req: Request, res: Response): void => {
  const logger = getLogger('security')

  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    url: req.url,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  })

  // Consider blocking if too many violations
  // Could trigger alert to security team
}
```

## Log Sanitization

### Remove Sensitive Data

```typescript
// ✅ CORRECT - Sanitize logs to remove sensitive data
export const sanitizeForLogging = (data: any): any => {
  const sanitized = { ...data }

  // Remove password fields
  if (sanitized.password) {
    sanitized.password = '***REDACTED***'
  }

  // Remove token fields
  if (sanitized.token) {
    sanitized.token = '***REDACTED***'
  }

  // Mask email addresses
  if (sanitized.email) {
    const [username, domain] = sanitized.email.split('@')
    sanitized.email = `${username.substring(0, 2)}***@${domain}`
  }

  // Mask API keys
  if (sanitized.apiKey) {
    sanitized.apiKey = `***${sanitized.apiKey.slice(-4)}`
  }

  return sanitized
}

// Usage
logger.info('User created', sanitizeForLogging(userData))
```

## Log Rotation

### File Rotation Configuration

```typescript
// ✅ CORRECT - Log rotation with winston-daily-rotate-file
import DailyRotateFile from 'winston-daily-rotate-file'

const errorRotateTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
})

const combinedRotateTransport = new DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
})

const logger = winston.createLogger({
  transports: [errorRotateTransport, combinedRotateTransport],
})
```

## Centralized Logging

### Cloud Logging Integration

```typescript
// ✅ CORRECT - Google Cloud Logging integration
import { LoggingWinston } from '@google-cloud/logging-winston'

const loggingWinston = new LoggingWinston({
  projectId: config.GCP_PROJECT_ID,
  keyFilename: config.GCP_KEY_FILE,
  logName: '3d-inventory-api',
})

const logger = winston.createLogger({
  transports: [loggingWinston, new winston.transports.File({ filename: 'logs/combined.log' })],
})
```

## Testing Logging

```typescript
// ✅ CORRECT - Test logging behavior
describe('Logging', () => {
  let logger: winston.Logger
  let logSpy: jest.SpyInstance

  beforeEach(() => {
    logger = getLogger('test')
    logSpy = jest.spyOn(logger, 'info')
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  it('should log user creation', async () => {
    const userData = { username: 'test', email: 'test@example.com' }

    await userService.createUser(userData)

    expect(logSpy).toHaveBeenCalledWith(
      'User created successfully',
      expect.objectContaining({
        username: 'test',
      }),
    )
  })

  it('should not log sensitive data', async () => {
    const userData = {
      username: 'test',
      password: 'secret123',
    }

    await userService.createUser(userData)

    expect(logSpy).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        password: 'secret123',
      }),
    )
  })
})
```

## Related Documentation

- [error_handling.instructions.md](./error_handling.instructions.md)
- [authentication.instructions.md](./authentication.instructions.md)
- [code_quality_standards.instructions.md](./code_quality_standards.instructions.md)

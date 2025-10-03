# GitHub Copilot Instructions - 3D Inventory API

This document provides comprehensive instructions for GitHub Copilot when working on the **3D Inventory API** project - a Node.js/Express backend with TypeScript, MongoDB, and comprehensive security features.

## Project Overview

### Architecture
- **Backend**: Node.js with Express.js framework
- **Language**: TypeScript (strict mode, CommonJS for Node.js)
- **Database**: MongoDB Atlas with connection pooling
- **Authentication**: JWT tokens with role-based access control (RBAC)
- **API Documentation**: OpenAPI 3.0 specification with Swagger UI
- **Testing**: Jest with comprehensive test coverage
- **Security**: Rate limiting, CORS, security headers, input validation

### Key Dependencies
```json
{
  "express": "Express.js web framework",
  "mongodb": "MongoDB driver with connection pooling",
  "jsonwebtoken": "JWT authentication",
  "bcrypt": "Password hashing",
  "helmet": "Security headers",
  "cors": "Cross-origin resource sharing",
  "express-rate-limit": "Rate limiting middleware",
  "express-openapi-validator": "OpenAPI request/response validation",
  "winston": "Logging framework",
  "jest": "Testing framework"
}
```

## Project Structure

```
src/
├── controllers/        # Request handlers and route logic
│   ├── auth.ts        # Authentication endpoints
│   ├── devices.ts     # Device CRUD operations
│   ├── models.ts      # 3D model management
│   ├── connections.ts # Device connections
│   ├── users.ts       # User management
│   └── ...
├── services/          # Business logic layer
│   ├── UserService.ts # User operations with password hashing
│   ├── RoleService.ts # Role-based access control
│   └── logs.ts        # Logging service
├── middlewares/       # Express middleware
│   ├── auth.ts        # JWT authentication & authorization
│   ├── security.ts    # Security headers and validation
│   ├── validation.ts  # Request validation
│   └── logging.ts     # Request/response logging
├── models/           # TypeScript interfaces and data models
│   ├── User.ts       # User interface with validation
│   ├── Device.ts     # Device interface
│   └── ...
├── utils/            # Utility functions
│   ├── db.ts         # MongoDB connection with pooling
│   ├── config.ts     # Environment configuration
│   ├── logger.ts     # Winston logger configuration
│   └── errors.ts     # Error handling utilities
├── tests/            # Jest test suites
└── main.ts           # Application entry point
```

## Code Patterns and Conventions

### 1. Controller Pattern

Controllers should follow this structure:

```typescript
import { NextFunction, Request, Response } from 'express'
import { ObjectId, Collection, Db } from 'mongodb'
import { getDatabase } from '../utils/db'
import { DatabaseError, NotFoundError, successResponse } from '../utils/errors'
import { CreateLog } from '../services/logs'
import getLogger from '../utils/logger'

const logger = getLogger('controller-name')
const collectionName = 'collection_name'

// Interface definitions
export interface EntityInterface {
  _id: string
  name: string
  // ... other properties
}

// Controller functions
export const getEntities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const db = getDatabase()
    const collection: Collection = db.collection(collectionName)
    
    const entities = await collection.find({}).toArray()
    
    await CreateLog({
      level: 'info',
      message: `Retrieved ${entities.length} entities`,
      meta: { userId: req.user?.id, count: entities.length }
    })
    
    res.json(successResponse(entities))
  } catch (error) {
    logger.error('Error retrieving entities:', error)
    next(new DatabaseError('Failed to retrieve entities'))
  }
}
```

### 2. Service Layer Pattern

Services should implement business logic with singleton pattern:

```typescript
/**
 * @file /services/EntityService.ts
 * @description Entity service for MongoDB operations with enhanced security
 * @module services
 */

import { Collection, Db, ObjectId, MongoClient } from 'mongodb'
import { connectToCluster, connectToDb, closeConnection } from '../utils/db'
import getLogger from '../utils/logger'

const logger = getLogger('EntityService')
const COLLECTION_NAME = 'entities'

export class EntityService {
  private static instance: EntityService

  private constructor() {}

  public static getInstance(): EntityService {
    if (!EntityService.instance) {
      EntityService.instance = new EntityService()
    }
    return EntityService.instance
  }

  async createEntity(entityData: CreateEntityRequest): Promise<EntityResponse> {
    let client: MongoClient | null = null

    try {
      // Validate input
      this.validateEntityData(entityData)

      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection = db.collection(COLLECTION_NAME)

      // Business logic here
      const result = await collection.insertOne(entityData)
      
      return this.toEntityResponse(result)
    } catch (error) {
      logger.error('Error creating entity:', error)
      throw error
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  private validateEntityData(data: any): void {
    // Validation logic
  }

  private toEntityResponse(data: any): EntityResponse {
    // Transform database result to response format
  }
}
```

### 3. Authentication & Authorization Middleware

Always implement proper JWT authentication with role-based access control:

```typescript
import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import config from '../utils/config'
import getLogger from '../utils/logger'

const logger = getLogger('auth-middleware')

export interface JwtPayload {
  id: string
  username: string
  role?: string
  permissions?: string[]
  iat?: number
  exp?: number
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

export enum Permission {
  READ_DEVICES = 'read:devices',
  WRITE_DEVICES = 'write:devices',
  DELETE_DEVICES = 'delete:devices',
  // ... other permissions
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [/* all permissions */],
  [UserRole.USER]: [/* user permissions */],
  [UserRole.VIEWER]: [/* read-only permissions */]
}

export const authenticateToken: RequestHandler = (req, res, next) => {
  // JWT validation logic
}

export const authorizePermission = (requiredPermission: Permission): RequestHandler => {
  return (req, res, next) => {
    // Permission validation logic
  }
}
```

### 4. Database Connection Pattern

Use connection pooling with proper error handling:

```typescript
import { MongoClient, Db, MongoClientOptions } from 'mongodb'
import config from './config'
import getLogger from './logger'

const logger = getLogger('db')

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToCluster(): Promise<MongoClient> {
  if (cachedClient && cachedClient.topology?.isConnected()) {
    return cachedClient
  }

  const options: MongoClientOptions = {
    maxPoolSize: config.DB_MAX_POOL_SIZE || 10,
    minPoolSize: config.DB_MIN_POOL_SIZE || 2,
    maxIdleTimeMS: config.DB_MAX_IDLE_TIME_MS || 30000,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000
  }

  try {
    const client = new MongoClient(config.MONGODB_URI, options)
    await client.connect()
    
    cachedClient = client
    logger.info('✅ Connected to MongoDB Atlas')
    
    return client
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error)
    throw error
  }
}

export function connectToDb(client: MongoClient): Db {
  if (cachedDb) {
    return cachedDb
  }

  cachedDb = client.db(config.DB_NAME)
  return cachedDb
}

export function getDatabase(): Db {
  if (!cachedDb) {
    throw new Error('Database not initialized. Call connectToCluster first.')
  }
  return cachedDb
}
```

### 5. Error Handling Pattern

Implement consistent error handling with proper HTTP status codes:

```typescript
export class APIError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class DatabaseError extends APIError {
  constructor(message = 'Database operation failed') {
    super(message, 500)
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Resource not found') {
    super(message, 404)
  }
}

export class ValidationError extends APIError {
  constructor(message = 'Validation failed') {
    super(message, 400)
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
  }
}

export const successResponse = (data: any, message = 'Success') => ({
  success: true,
  message,
  data
})

export const errorResponse = (message: string, error?: any) => ({
  success: false,
  message,
  error: process.env.NODE_ENV === 'development' ? error : undefined
})
```

### 6. Logging Pattern

Use structured logging with Winston:

```typescript
import winston from 'winston'
import config from './config'

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: '3d-inventory-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

export default function getLogger(module: string) {
  return logger.child({ module })
}
```

## Testing Patterns

### 1. Jest Test Structure

Follow this pattern for comprehensive testing:

```typescript
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'
import app from '../main'
import { UserService } from '../services/UserService'

describe('Authentication Controller', () => {
  let mongoServer: MongoMemoryServer
  let mongoClient: MongoClient
  let userService: UserService

  beforeAll(async () => {
    // Setup in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    mongoClient = new MongoClient(uri)
    await mongoClient.connect()
    
    userService = UserService.getInstance()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    // Clean up test data
    const db = mongoClient.db()
    await db.collection('users').deleteMany({})
  })

  describe('POST /login', () => {
    it('should authenticate valid user credentials', async () => {
      // Create test user
      await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123!',
        role: 'user'
      })

      const response = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'password123!'
        })
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        token: expect.any(String),
        user: {
          username: 'testuser',
          role: 'user'
        }
      })
    })

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword'
        })
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('Invalid credentials')
      })
    })
  })
})
```

### 2. Service Testing Pattern

```typescript
import { UserService } from '../services/UserService'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'

describe('UserService', () => {
  let mongoServer: MongoMemoryServer
  let mongoClient: MongoClient
  let userService: UserService

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    mongoClient = new MongoClient(uri)
    await mongoClient.connect()
    
    userService = UserService.getInstance()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoServer.stop()
  })

  describe('createUser', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123!',
        role: 'user' as const
      }

      const result = await userService.createUser(userData)

      expect(result).toMatchObject({
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        isActive: true
      })
      expect(result.password).toBeUndefined() // Password should not be returned
    })

    it('should validate required fields', async () => {
      const invalidData = {
        username: '',
        email: 'invalid-email',
        password: '123', // Too short
        role: 'user' as const
      }

      await expect(userService.createUser(invalidData))
        .rejects.toThrow('Validation failed')
    })
  })
})
```

## API Design Patterns

### 1. RESTful Endpoints

Follow REST conventions with proper HTTP methods and status codes:

```typescript
// GET /api/devices - List all devices
export const getDevices = async (req: Request, res: Response, next: NextFunction) => {
  // Implementation with query parameters for filtering, pagination
}

// GET /api/devices/:id - Get specific device
export const getDeviceById = async (req: Request, res: Response, next: NextFunction) => {
  // Implementation with proper 404 handling
}

// POST /api/devices - Create new device
export const createDevice = async (req: Request, res: Response, next: NextFunction) => {
  // Implementation with validation and 201 status
}

// PUT /api/devices/:id - Update entire device
export const updateDevice = async (req: Request, res: Response, next: NextFunction) => {
  // Implementation with full resource replacement
}

// PATCH /api/devices/:id - Partial update
export const patchDevice = async (req: Request, res: Response, next: NextFunction) => {
  // Implementation with partial update logic
}

// DELETE /api/devices/:id - Delete device
export const deleteDevice = async (req: Request, res: Response, next: NextFunction) => {
  // Implementation with proper cascade deletion if needed
}
```

### 2. Request Validation

Use OpenAPI validation with proper error handling:

```typescript
import { Request, Response, NextFunction } from 'express'
import { ValidationError } from '../utils/errors'

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // OpenAPI validation logic
    // Should be handled by express-openapi-validator middleware
    next()
  }
}

// Custom validation for business logic
export const validateDeviceData = (req: Request, res: Response, next: NextFunction) => {
  const { name, modelId, position } = req.body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new ValidationError('Device name is required'))
  }

  if (!modelId || typeof modelId !== 'string') {
    return next(new ValidationError('Model ID is required'))
  }

  if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
    return next(new ValidationError('Valid position coordinates are required'))
  }

  next()
}
```

### 3. Response Formatting

Maintain consistent response structure:

```typescript
// Success responses
const successResponse = (data: any, message = 'Success', meta?: any) => ({
  success: true,
  message,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    ...meta
  }
})

// Error responses
const errorResponse = (message: string, errors?: any[], meta?: any) => ({
  success: false,
  message,
  errors,
  meta: {
    timestamp: new Date().toISOString(),
    ...meta
  }
})

// Paginated responses
const paginatedResponse = (data: any[], page: number, limit: number, total: number) => ({
  success: true,
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  }
})
```

## Security Best Practices

### 1. Password Security

Always hash passwords with bcrypt:

```typescript
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}
```

### 2. JWT Token Management

Implement secure JWT handling:

```typescript
import jwt from 'jsonwebtoken'
import config from '../utils/config'

export interface JwtPayload {
  id: string
  username: string
  role: string
  permissions: string[]
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN || '24h',
    issuer: '3d-inventory-api',
    audience: '3d-inventory-ui'
  })
}

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.JWT_SECRET, {
    issuer: '3d-inventory-api',
    audience: '3d-inventory-ui'
  }) as JwtPayload
}

export const refreshToken = (payload: JwtPayload): string => {
  // Remove exp and iat from payload
  const { exp, iat, ...tokenPayload } = payload as any
  return generateToken(tokenPayload)
}
```

### 3. Rate Limiting

Implement proper rate limiting:

```typescript
import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, try again later'
  }
})
```

## Configuration Management

Use environment-based configuration:

```typescript
import dotenv from 'dotenv'

dotenv.config()

interface Config {
  NODE_ENV: string
  PORT: number
  MONGODB_URI: string
  DB_NAME: string
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  BCRYPT_ROUNDS: number
  LOG_LEVEL: string
  CORS_ORIGIN: string[]
  USE_EMOJI: boolean
  DB_MAX_POOL_SIZE: number
  DB_MIN_POOL_SIZE: number
}

const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8080', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  DB_NAME: process.env.DB_NAME || '3d-inventory',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200'],
  USE_EMOJI: process.env.USE_EMOJI === 'true',
  DB_MAX_POOL_SIZE: parseInt(process.env.DB_MAX_POOL_SIZE || '10', 10),
  DB_MIN_POOL_SIZE: parseInt(process.env.DB_MIN_POOL_SIZE || '2', 10)
}

export default config
```

## MongoDB Patterns

### 1. Collection Operations

Use proper MongoDB operations with error handling:

```typescript
import { Collection, Db, ObjectId, Filter, UpdateFilter } from 'mongodb'

export class BaseRepository<T> {
  protected collection: Collection<T>

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection(collectionName)
  }

  async findById(id: string): Promise<T | null> {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError('Invalid ID format')
    }

    return await this.collection.findOne({ _id: new ObjectId(id) } as Filter<T>)
  }

  async findMany(filter: Filter<T> = {}, options: any = {}): Promise<T[]> {
    return await this.collection
      .find(filter, options)
      .toArray()
  }

  async create(data: Omit<T, '_id'>): Promise<T> {
    const result = await this.collection.insertOne(data as any)
    return { ...data, _id: result.insertedId } as T
  }

  async updateById(id: string, update: UpdateFilter<T>): Promise<T | null> {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError('Invalid ID format')
    }

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as Filter<T>,
      update,
      { returnDocument: 'after' }
    )

    return result.value
  }

  async deleteById(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError('Invalid ID format')
    }

    const result = await this.collection.deleteOne({ _id: new ObjectId(id) } as Filter<T>)
    return result.deletedCount > 0
  }
}
```

### 2. Aggregation Pipelines

Use MongoDB aggregation for complex queries:

```typescript
export const getDevicesWithModels = async (db: Db): Promise<any[]> => {
  const devicesCollection = db.collection('devices')
  
  return await devicesCollection.aggregate([
    {
      $lookup: {
        from: 'models',
        localField: 'modelId',
        foreignField: '_id',
        as: 'model'
      }
    },
    {
      $unwind: '$model'
    },
    {
      $project: {
        _id: 1,
        name: 1,
        position: 1,
        attributes: 1,
        model: {
          name: '$model.name',
          brand: '$model.brand',
          category: '$model.category'
        }
      }
    },
    {
      $sort: { name: 1 }
    }
  ]).toArray()
}
```

## OpenAPI Documentation

Include proper OpenAPI documentation:

```yaml
# api.yaml
openapi: 3.0.0
info:
  title: 3D Inventory API
  version: 1.0.0
  description: RESTful API for 3D inventory management system

paths:
  /api/devices:
    get:
      summary: Get all devices
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: List of devices
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Device'

components:
  schemas:
    Device:
      type: object
      required:
        - name
        - modelId
        - position
      properties:
        _id:
          type: string
        name:
          type: string
        modelId:
          type: string
        position:
          type: object
          properties:
            x:
              type: number
            y:
              type: number
            h:
              type: number
        attributes:
          type: array
          items:
            $ref: '#/components/schemas/Attribute'

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## Development Workflow

### 1. Adding New Features

When adding new endpoints or features:

1. **Define the interface** in `models/` directory
2. **Create the controller** in `controllers/` directory
3. **Implement business logic** in `services/` directory
4. **Add middleware** for authentication/validation if needed
5. **Write comprehensive tests** in `tests/` directory
6. **Update OpenAPI documentation** in `api.yaml`
7. **Add logging** for debugging and monitoring

### 2. Code Quality Standards

- **TypeScript**: Use strict mode with proper typing
- **ESLint**: Follow the configured linting rules
- **Testing**: Maintain >80% test coverage
- **Documentation**: Include JSDoc comments for all public methods
- **Error Handling**: Implement proper error boundaries
- **Security**: Follow OWASP guidelines

### 3. Environment Setup

Ensure proper environment configuration:

```bash
# Development
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017
DB_NAME=3d-inventory-dev
JWT_SECRET=development-secret-key
LOG_LEVEL=debug

# Production
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
DB_NAME=3d-inventory-prod
JWT_SECRET=secure-production-secret
LOG_LEVEL=info
```

## Deployment Considerations

### 1. Google Cloud Platform

The project is configured for GCP deployment:

```yaml
# app.yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  MONGODB_URI: ${MONGODB_URI}
  JWT_SECRET: ${JWT_SECRET}

automatic_scaling:
  min_instances: 1
  max_instances: 10
```

### 2. Docker Configuration

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 8080
CMD ["npm", "start"]
```

---

## Quick Reference

### Common Commands
```bash
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript to JavaScript
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm start            # Start production server
```

### Key Files to Reference
- `src/main.ts` - Application entry point
- `src/utils/db.ts` - Database connection
- `src/middlewares/auth.ts` - Authentication logic
- `src/services/UserService.ts` - User management
- `api.yaml` - OpenAPI specification
- `jest.config.ts` - Testing configuration

### Testing Credentials
```javascript
const testCredentials = [
  { username: 'admin', password: 'admin123!', role: 'admin' },
  { username: 'user', password: 'user123!', role: 'user' },
  { username: 'carlo', password: 'carlo123!', role: 'user' },
  { username: 'viewer', password: 'viewer123!', role: 'viewer' }
]
```

---

_This document should be used as a comprehensive guide for GitHub Copilot when working on the 3D Inventory API project. Always prioritize security, type safety, and maintainable code patterns._
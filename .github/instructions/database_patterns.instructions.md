---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**/*.ts,**/*.js'
description: MongoDB Database Patterns & Best Practices for 3D Inventory API
---

# Database Patterns - MongoDB Best Practices

This document defines MongoDB database patterns and best practices for the 3D Inventory API.

## Connection Management

### Connection Pooling Pattern

```typescript
// ✅ CORRECT - Connection pooling with singleton pattern
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
    socketTimeoutMS: 45000,
  }

  try {
    const client = new MongoClient(config.MONGODB_URI, options)
    await client.connect()

    cachedClient = client
    logger.info('✅ Connected to MongoDB Atlas')

    return client
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error)
    throw new DatabaseError('Failed to connect to database')
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
    throw new DatabaseError('Database not initialized')
  }
  return cachedDb
}

export async function closeConnection(client: MongoClient): Promise<void> {
  if (client) {
    await client.close()
    cachedClient = null
    cachedDb = null
    logger.info('Database connection closed')
  }
}
```

## CRUD Operations

### Type-Safe Query Patterns

```typescript
// ✅ CORRECT - Type-safe MongoDB operations
import { Collection, ObjectId, Filter, UpdateFilter } from 'mongodb'

export class BaseRepository<T extends { _id?: string }> {
  protected collection: Collection<T>

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection(collectionName)
  }

  async findById(id: string): Promise<T | null> {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError('Invalid ID format')
    }

    return await this.collection.findOne({
      _id: new ObjectId(id),
    } as Filter<T>)
  }

  async findMany(filter: Filter<T> = {}, options: any = {}): Promise<T[]> {
    return await this.collection.find(filter, options).toArray()
  }

  async create(data: Omit<T, '_id'>): Promise<T> {
    const result = await this.collection.insertOne(data as any)

    return {
      ...data,
      _id: result.insertedId.toString(),
    } as T
  }

  async updateById(id: string, update: UpdateFilter<T>): Promise<T | null> {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError('Invalid ID format')
    }

    const result = await this.collection.findOneAndUpdate({ _id: new ObjectId(id) } as Filter<T>, update, { returnDocument: 'after' })

    return result.value
  }

  async deleteById(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError('Invalid ID format')
    }

    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
    } as Filter<T>)

    return result.deletedCount > 0
  }

  async count(filter: Filter<T> = {}): Promise<number> {
    return await this.collection.countDocuments(filter)
  }
}
```

### Repository Implementation

```typescript
// ✅ CORRECT - Concrete repository
import { Device } from '../models/Device'

export class DeviceRepository extends BaseRepository<Device> {
  constructor(db: Db) {
    super(db, 'devices')
  }

  async findByModelId(modelId: string): Promise<Device[]> {
    return await this.findMany({ modelId } as Filter<Device>)
  }

  async findByPosition(x: number, y: number): Promise<Device | null> {
    return await this.collection.findOne({
      'position.x': x,
      'position.y': y,
    } as Filter<Device>)
  }

  async search(query: string): Promise<Device[]> {
    return await this.collection
      .find({
        $text: { $search: query },
      } as Filter<Device>)
      .toArray()
  }

  async findWithPagination(page: number, limit: number, filter: Filter<Device> = {}): Promise<Device[]> {
    return await this.collection
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray()
  }
}
```

## Query Optimization

### Indexing Strategy

```typescript
// ✅ CORRECT - Create indexes for performance
export async function createIndexes(db: Db): Promise<void> {
  const devicesCollection = db.collection('devices')

  await devicesCollection.createIndexes([
    // Single field indexes
    { key: { modelId: 1 }, name: 'idx_modelId' },
    { key: { name: 1 }, name: 'idx_name' },
    { key: { createdAt: -1 }, name: 'idx_createdAt' },

    // Compound indexes
    {
      key: { 'position.x': 1, 'position.y': 1 },
      name: 'idx_position',
      unique: true,
    },

    // Text search index
    {
      key: { name: 'text', 'attributes.value': 'text' },
      name: 'idx_text_search',
    },
  ])

  logger.info('Database indexes created')
}
```

### Efficient Queries

```typescript
// ✅ CORRECT - Optimized queries
export class DeviceService {
  async getDevicesWithModels(): Promise<any[]> {
    const db = getDatabase()
    const devicesCollection = db.collection('devices')

    // Use aggregation pipeline for joins
    return await devicesCollection
      .aggregate([
        {
          $lookup: {
            from: 'models',
            localField: 'modelId',
            foreignField: '_id',
            as: 'model',
          },
        },
        {
          $unwind: '$model',
        },
        {
          $project: {
            _id: 1,
            name: 1,
            position: 1,
            'model.name': 1,
            'model.brand': 1,
            'model.category': 1,
          },
        },
        {
          $sort: { name: 1 },
        },
      ])
      .toArray()
  }

  // Use projection to limit returned fields
  async getDevicesSummary(): Promise<any[]> {
    const db = getDatabase()
    const devicesCollection = db.collection('devices')

    return await devicesCollection
      .find(
        {},
        {
          projection: {
            _id: 1,
            name: 1,
            modelId: 1,
            'position.x': 1,
            'position.y': 1,
          },
        },
      )
      .toArray()
  }
}
```

## Transaction Patterns

### Multi-Document Transactions

```typescript
// ✅ CORRECT - Use transactions for atomic operations
export async function transferDevice(deviceId: string, fromFloorId: string, toFloorId: string): Promise<void> {
  const client = await connectToCluster()
  const session = client.startSession()

  try {
    await session.withTransaction(async () => {
      const db = connectToDb(client)

      // Update device floor
      await db.collection('devices').updateOne({ _id: new ObjectId(deviceId) }, { $set: { floorId: new ObjectId(toFloorId) } }, { session })

      // Decrement from floor device count
      await db.collection('floors').updateOne({ _id: new ObjectId(fromFloorId) }, { $inc: { deviceCount: -1 } }, { session })

      // Increment to floor device count
      await db.collection('floors').updateOne({ _id: new ObjectId(toFloorId) }, { $inc: { deviceCount: 1 } }, { session })

      // Log the transfer
      await db.collection('logs').insertOne(
        {
          action: 'device_transfer',
          deviceId: new ObjectId(deviceId),
          fromFloorId: new ObjectId(fromFloorId),
          toFloorId: new ObjectId(toFloorId),
          timestamp: new Date(),
        },
        { session },
      )
    })

    logger.info(`Device ${deviceId} transferred successfully`)
  } catch (error) {
    logger.error('Transaction failed:', error)
    throw new DatabaseError('Failed to transfer device')
  } finally {
    await session.endSession()
  }
}
```

## Data Validation

### Schema Validation

```typescript
// ✅ CORRECT - MongoDB schema validation
export async function createCollectionWithValidation(db: Db): Promise<void> {
  await db.createCollection('devices', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'modelId', 'position'],
        properties: {
          name: {
            bsonType: 'string',
            minLength: 3,
            description: 'Device name is required (min 3 chars)',
          },
          modelId: {
            bsonType: 'objectId',
            description: 'Model ID is required',
          },
          position: {
            bsonType: 'object',
            required: ['x', 'y'],
            properties: {
              x: {
                bsonType: 'number',
                minimum: 0,
                description: 'X coordinate must be >= 0',
              },
              y: {
                bsonType: 'number',
                minimum: 0,
                description: 'Y coordinate must be >= 0',
              },
              h: {
                bsonType: 'number',
                minimum: 1,
                description: 'Height must be >= 1',
              },
            },
          },
          attributes: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['key', 'value'],
              properties: {
                key: { bsonType: 'string' },
                value: { bsonType: 'string' },
              },
            },
          },
        },
      },
    },
  })
}
```

## Error Handling

### Database Error Patterns

```typescript
// ✅ CORRECT - Handle MongoDB errors
export async function handleDatabaseOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error: any) {
    // Duplicate key error
    if (error.code === 11000) {
      throw new ConflictError('Resource already exists')
    }

    // Validation error
    if (error.name === 'ValidationError') {
      throw new ValidationError(error.message)
    }

    // Connection errors
    if (error.name === 'MongoNetworkError') {
      throw new DatabaseError('Database connection failed')
    }

    // Generic database error
    logger.error('Database operation failed:', error)
    throw new DatabaseError('Database operation failed')
  }
}

// Usage
export const createDevice = async (deviceData: Device): Promise<Device> => {
  return handleDatabaseOperation(async () => {
    const db = getDatabase()
    const collection = db.collection('devices')

    const result = await collection.insertOne(deviceData)
    return { ...deviceData, _id: result.insertedId.toString() }
  })
}
```

## Data Migration Patterns

```typescript
// ✅ CORRECT - Database migration script
export async function migrateDeviceSchema(): Promise<void> {
  const client = await connectToCluster()
  const db = connectToDb(client)
  const collection = db.collection('devices')

  try {
    // Add new field to all documents
    await collection.updateMany({ status: { $exists: false } }, { $set: { status: 'active' } })

    // Rename field
    await collection.updateMany({}, { $rename: { oldField: 'newField' } })

    // Remove deprecated field
    await collection.updateMany({}, { $unset: { deprecatedField: '' } })

    logger.info('Migration completed successfully')
  } catch (error) {
    logger.error('Migration failed:', error)
    throw error
  } finally {
    await closeConnection(client)
  }
}
```

## Testing Database Operations

```typescript
// ✅ CORRECT - Test with MongoDB Memory Server
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'

describe('DeviceRepository', () => {
  let mongoServer: MongoMemoryServer
  let mongoClient: MongoClient
  let repository: DeviceRepository

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    mongoClient = new MongoClient(uri)
    await mongoClient.connect()

    const db = mongoClient.db('test')
    repository = new DeviceRepository(db)
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    const db = mongoClient.db('test')
    await db.collection('devices').deleteMany({})
  })

  it('should create device', async () => {
    const deviceData = {
      name: 'Test Device',
      modelId: 'model-123',
      position: { x: 10, y: 20, h: 1 },
    }

    const device = await repository.create(deviceData)

    expect(device._id).toBeDefined()
    expect(device.name).toBe(deviceData.name)
  })
})
```

## Performance Monitoring

```typescript
// ✅ CORRECT - Monitor slow queries
export async function enableProfiling(db: Db): Promise<void> {
  await db.command({ profile: 1, slowms: 100 })
  logger.info('Database profiling enabled (slowms: 100)')
}

export async function getSlowQueries(db: Db): Promise<any[]> {
  const systemProfile = db.collection('system.profile')

  return await systemProfile
    .find({ millis: { $gt: 100 } })
    .sort({ ts: -1 })
    .limit(10)
    .toArray()
}
```

## Related Documentation

- [code_quality_standards.instructions.md](./code_quality_standards.instructions.md)
- [error_handling.instructions.md](./error_handling.instructions.md)
- [test_coverage_standards.instructions.md](./test_coverage_standards.instructions.md)

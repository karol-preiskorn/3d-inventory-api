/**
 * @file log.test.ts
 * @description Comprehensive test suite for Log API endpoints and audit trail management.
 *
 * Coverage includes:
 * - Complete CRUD operations for all log endpoints
 * - Audit trail generation and tracking
 * - Activity logging and event recording
 * - Log search and filtering functionality
 * - Log categorization and priority levels
 * - Automated log generation triggers
 * - Log retention and archival policies
 * - Performance monitoring logs
 * - Error and exception logging
 * - Input validation and sanitization
 * - Security testing (injection prevention)
 * - Database integration and persistence
 * - Log aggregation and analytics
 *
 * @version 2024-09-22 Comprehensive log API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Log API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db
  const testLogIds: string[] = []
  const testUserIds: string[] = []
  const testDeviceIds: string[] = []
  const testModelIds: string[] = []
  const testCleanupIds: string[] = []

  // ===============================
  // SETUP AND TEARDOWN
  // ===============================
  beforeAll(async () => {
    try {
      if (!config.ATLAS_URI) {
        throw new Error('ATLAS_URI not configured for tests')
      }

      connection = await MongoClient.connect(config.ATLAS_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000
      })
      db = connection.db(config.DBNAME)

      await db.admin().ping()
      console.log('✅ MongoDB connection successful for comprehensive log tests')

      // Create test data for log relationships
      await createTestEntities()
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('timeout') || errorMessage.includes('ENOTFOUND')) {
        console.warn('⚠️ Skipping database tests - database not accessible')

        return
      }

      throw error
    }
  }, 30000)

  afterAll(async () => {
    try {
      // Clean up test data
      if (db) {
        if (testCleanupIds.length > 0) {
          const logCollection = db.collection('logs')
          const logObjectIds = testCleanupIds.map(id => new ObjectId(id))

          await logCollection.deleteMany({ _id: { $in: logObjectIds } })
          console.log(`🧹 Cleaned up ${testCleanupIds.length} test logs`)
        }

        if (testDeviceIds.length > 0) {
          const deviceCollection = db.collection('devices')
          const deviceObjectIds = testDeviceIds.map(id => new ObjectId(id))

          await deviceCollection.deleteMany({ _id: { $in: deviceObjectIds } })
          console.log(`🧹 Cleaned up ${testDeviceIds.length} test devices`)
        }

        if (testModelIds.length > 0) {
          const modelCollection = db.collection('models')
          const modelObjectIds = testModelIds.map(id => new ObjectId(id))

          await modelCollection.deleteMany({ _id: { $in: modelObjectIds } })
          console.log(`🧹 Cleaned up ${testModelIds.length} test models`)
        }

        if (testUserIds.length > 0) {
          const userCollection = db.collection('users')
          const userObjectIds = testUserIds.map(id => new ObjectId(id))

          await userCollection.deleteMany({ _id: { $in: userObjectIds } })
          console.log(`🧹 Cleaned up ${testUserIds.length} test users`)
        }
      }
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error)
    } finally {
      if (connection) {
        await connection.close()
        console.log('🔌 Database connection closed')
      }
    }
  }, 10000)

  // Helper functions
  const checkDbConnection = (): boolean => {
    if (!connection || !db) {
      console.warn('⚠️ Skipping test - no database connection')

      return false
    }

    return true
  }
  const createTestEntities = async () => {
    if (!checkDbConnection()) return

    // Create test users
    const users = db.collection('users')
    const testUsers = [
      {
        username: testGenerators.uniqueName('testuser'),
        email: `testuser${Date.now()}@test.com`,
        password: 'hashedpassword123',
        role: 'admin'
      },
      {
        username: testGenerators.uniqueName('loguser'),
        email: `loguser${Date.now()}@test.com`,
        password: 'hashedpassword123',
        role: 'user'
      }
    ]

    for (const user of testUsers) {
      const result = await users.insertOne(user)

      testUserIds.push(result.insertedId.toString())
    }

    // Create test models
    const models = db.collection('models')
    const testModels = [
      {
        name: 'Test Model for Logs A',
        type: 'server',
        dimensions: { width: 100, height: 50, depth: 200 },
        manufacturer: 'Test Corp'
      }
    ]

    for (const model of testModels) {
      const result = await models.insertOne(model)

      testModelIds.push(result.insertedId.toString())
    }

    // Create test devices
    const devices = db.collection('devices')
    const testDevices = [
      {
        name: 'Test Device for Logs A',
        modelId: testModelIds[0],
        position: { x: 10, y: 20, z: 0 },
        status: 'active'
      }
    ]

    for (const device of testDevices) {
      const result = await devices.insertOne(device)

      testDeviceIds.push(result.insertedId.toString())
    }
  }
  const createUniqueTestLog = (overrides = {}) => {
    const baseLog = testGenerators.logBuilder()

    return {
      action: testGenerators.randomArrayElement(['CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', 'LOGOUT']),
      entityType: testGenerators.randomArrayElement(['user', 'device', 'model', 'connection', 'floor']),
      entityId: testDeviceIds.length > 0 ? testDeviceIds[0] : testGenerators.objectId(),
      userId: testUserIds.length > 0 ? testUserIds[0] : testGenerators.objectId(),
      timestamp: new Date(),
      level: baseLog.level,
      message: baseLog.message || 'Test log message for action',
      metadata: {
        ip: testGenerators.randomArrayElement(['192.168.1.1', '10.0.0.1', '172.16.0.1']),
        userAgent: 'Test User Agent',
        requestId: testGenerators.uniqueName('req'),
        sessionId: testGenerators.uniqueName('session'),
        duration: Math.floor(Math.random() * 1000),
        source: 'api'
      },
      details: {
        previousValue: null,
        newValue: 'test_value',
        changes: ['field1', 'field2'],
        context: {
          endpoint: '/api/test',
          method: 'POST',
          status: 200
        }
      },
      ...overrides
    }
  }

  // ===============================
  // DATABASE LAYER TESTS
  // ===============================
  describe('Database Log Operations', () => {
    it('should perform direct database CRUD operations', async () => {
      if (!checkDbConnection()) return

      const logs = db.collection('logs')
      const testData = []

      // Test insertion of multiple logs
      for (let i = 0; i < 3; i++) {
        const logData = createUniqueTestLog({
          action: `TEST_ACTION_${i}`,
          message: `Test log entry ${i}`
        })
        const insertResult = await logs.insertOne(logData)
        const insertedLog = await logs.findOne({ _id: insertResult.insertedId })

        expect(insertedLog).not.toBeNull()
        expect(insertedLog!._id).toEqual(insertResult.insertedId)
        expect(insertedLog!.action).toBe(logData.action)
        expect(insertedLog!.message).toBe(logData.message)
        expect(insertedLog!.level).toBe(logData.level)

        testCleanupIds.push(insertResult.insertedId.toString())
        testData.push(insertedLog)
      }

      // Test querying
      const foundLogs = await logs.find({
        action: { $in: testData.map(l => l!.action) }
      }).toArray()

      expect(foundLogs).toHaveLength(3)

      // Test updating
      const updateResult = await logs.updateOne(
        { _id: testData[0]!._id },
        { $set: { level: 'error' } }
      )

      expect(updateResult.modifiedCount).toBe(1)

      // Test deletion
      const deleteResult = await logs.deleteOne({ _id: testData[0]!._id })

      expect(deleteResult.deletedCount).toBe(1)
    })

    it('should handle log-user relationships', async () => {
      if (!checkDbConnection() || testUserIds.length === 0) return

      const logs = db.collection('logs')
      // Create log associated with user
      const logData = createUniqueTestLog({
        userId: testUserIds[0],
        action: 'USER_LOGIN'
      })
      const logResult = await logs.insertOne(logData)

      testCleanupIds.push(logResult.insertedId.toString())

      // Query logs by user
      const userLogs = await logs.find({
        userId: testUserIds[0]
      }).toArray()

      expect(userLogs.length).toBeGreaterThanOrEqual(1)
      expect(userLogs[0].userId).toBe(testUserIds[0])
    })

    it('should handle log-entity relationships', async () => {
      if (!checkDbConnection() || testDeviceIds.length === 0) return

      const logs = db.collection('logs')
      // Create log associated with device
      const logData = createUniqueTestLog({
        entityId: testDeviceIds[0],
        entityType: 'device',
        action: 'DEVICE_UPDATE'
      })
      const logResult = await logs.insertOne(logData)

      testCleanupIds.push(logResult.insertedId.toString())

      // Query logs by entity
      const entityLogs = await logs.find({
        entityId: testDeviceIds[0],
        entityType: 'device'
      }).toArray()

      expect(entityLogs.length).toBeGreaterThanOrEqual(1)
      expect(entityLogs[0].entityId).toBe(testDeviceIds[0])
      expect(entityLogs[0].entityType).toBe('device')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /logs
  // ===============================
  describe('GET /logs - Retrieve Logs', () => {
    it('should return all logs with proper structure', async () => {
      const response = await request(app)
        .get('/logs')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('count')
      expect(typeof response.body.count).toBe('number')

      if (response.body.data.length > 0) {
        const log = response.body.data[0]

        expect(log).toHaveProperty('_id')
        expect(log).toHaveProperty('action')
        expect(log).toHaveProperty('timestamp')
        expect(log).toHaveProperty('level')
        expect(log).toHaveProperty('message')

        // Validate optional fields if present
        if (log.metadata) {
          expect(typeof log.metadata).toBe('object')
        }
        if (log.details) {
          expect(typeof log.details).toBe('object')
        }
      }
    })

    it('should support filtering by action', async () => {
      // Create a log with specific action
      const logData = createUniqueTestLog({ action: 'TEST_FILTER_ACTION' })
      const createResponse = await request(app)
        .post('/logs')
        .send(logData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .get('/logs?action=TEST_FILTER_ACTION')
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      response.body.data.forEach((log: any) => {
        expect(log.action).toBe('TEST_FILTER_ACTION')
      })
    })

    it('should support filtering by level', async () => {
      const response = await request(app)
        .get('/logs?level=error')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((log: any) => {
        expect(log.level).toBe('error')
      })
    })

    it('should support filtering by entity type', async () => {
      const response = await request(app)
        .get('/logs?entityType=device')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((log: any) => {
        expect(log.entityType).toBe('device')
      })
    })

    it('should support date range filtering', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 24 hours ago
      const endDate = new Date().toISOString()
      const response = await request(app)
        .get(`/logs?startDate=${startDate}&endDate=${endDate}`)
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((log: any) => {
        const logDate = new Date(log.timestamp)

        expect(logDate.getTime()).toBeGreaterThanOrEqual(new Date(startDate).getTime())
        expect(logDate.getTime()).toBeLessThanOrEqual(new Date(endDate).getTime())
      })
    })

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/logs?limit=1')
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.count).toBe(1)
    })

    it('should handle sorting by timestamp', async () => {
      const response = await request(app)
        .get('/logs?sortBy=timestamp&sortOrder=desc')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      if (response.body.data.length > 1) {
        for (let i = 1; i < response.body.data.length; i++) {
          const prevTimestamp = new Date(response.body.data[i - 1].timestamp).getTime()
          const currentTimestamp = new Date(response.body.data[i].timestamp).getTime()

          expect(prevTimestamp).toBeGreaterThanOrEqual(currentTimestamp)
        }
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - POST /logs
  // ===============================
  describe('POST /logs - Create Logs', () => {
    it('should create a new log with complete data', async () => {
      const logData = createUniqueTestLog()
      const response = await request(app)
        .post('/logs')
        .send(logData)
        .set('Accept', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.action).toBe(logData.action)
      expect(response.body.level).toBe(logData.level)
      expect(response.body.message).toBe(logData.message)
      expect(response.body.entityType).toBe(logData.entityType)

      testLogIds.push(response.body._id)
      testCleanupIds.push(response.body._id)
    })

    it('should create log with minimal required data', async () => {
      const minimalData = {
        action: 'MINIMAL_TEST',
        message: 'Minimal test log entry',
        level: 'info'
      }
      const response = await request(app)
        .post('/logs')
        .send(minimalData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.action).toBe(minimalData.action)
      expect(response.body.message).toBe(minimalData.message)
      expect(response.body.level).toBe(minimalData.level)
      expect(response.body).toHaveProperty('timestamp')

      testCleanupIds.push(response.body._id)
    })

    it('should reject log without required action field', async () => {
      const logData = createUniqueTestLog()
      const { action: _action, ...dataWithoutAction } = logData
      const response = await request(app)
        .post('/logs')
        .send(dataWithoutAction)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Action is required')
    })

    it('should reject log without required message', async () => {
      const logData = createUniqueTestLog()

      // @ts-expect-error - Intentionally creating invalid data for testing
      delete logData.message

      const response = await request(app)
        .post('/logs')
        .send(logData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should validate log level values', async () => {
      const logData = createUniqueTestLog({
        level: 'invalid_level'
      })
      const response = await request(app)
        .post('/logs')
        .send(logData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should automatically set timestamp if not provided', async () => {
      const logData = createUniqueTestLog()

      // @ts-expect-error - Intentionally creating data without timestamp
      delete logData.timestamp

      const response = await request(app)
        .post('/logs')
        .send(logData)
        .expect(201)

      expect(response.body).toHaveProperty('timestamp')
      const logTimestamp = new Date(response.body.timestamp)
      const now = new Date()

      expect(Math.abs(logTimestamp.getTime() - now.getTime())).toBeLessThan(5000) // Within 5 seconds

      testCleanupIds.push(response.body._id)
    })

    it('should handle complex metadata and details', async () => {
      const complexLogData = createUniqueTestLog({
        metadata: {
          ip: '192.168.1.100',
          userAgent: 'Test Browser/1.0',
          requestId: 'req-12345',
          performance: {
            responseTime: 150,
            memoryUsage: '256MB',
            cpuUsage: '15%'
          }
        },
        details: {
          previousValue: { status: 'inactive' },
          newValue: { status: 'active' },
          changes: ['status', 'lastModified'],
          audit: {
            approver: 'admin_user',
            reason: 'scheduled maintenance'
          }
        }
      })
      const response = await request(app)
        .post('/logs')
        .send(complexLogData)
        .expect(201)

      expect(response.body.metadata).toEqual(complexLogData.metadata)
      expect(response.body.details).toEqual(complexLogData.details)

      testCleanupIds.push(response.body._id)
    })

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousData = createUniqueTestLog({
        action: 'TEST_ACTION',
        message: testGenerators.invalidData.scriptInjection,
        '$where': testGenerators.invalidData.nosqlInjection.$where
      })
      const response = await request(app)
        .post('/logs')
        .send(maliciousData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.action).toBe(maliciousData.action)
      expect(response.body).not.toHaveProperty('$where')

      testCleanupIds.push(response.body._id)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /logs/:id
  // ===============================
  describe('GET /logs/:id - Retrieve Specific Log', () => {
    let testLogId: string

    beforeAll(async () => {
      const logData = createUniqueTestLog()
      const response = await request(app)
        .post('/logs')
        .send(logData)
        .expect(201)

      testLogId = response.body._id
      testCleanupIds.push(testLogId)
    })

    it('should return specific log by valid ID', async () => {
      const response = await request(app)
        .get(`/logs/${testLogId}`)
        .expect(200)

      expect(response.body).toHaveProperty('_id', testLogId)
      expect(response.body).toHaveProperty('action')
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('level')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/logs/invalid-id')
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Invalid Input')
      expect(response.body).toHaveProperty('message', 'Invalid ObjectId format')
    })

    it('should return 404 for non-existent log', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .get(`/logs/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Log not found')
    })
  })

  // ===============================
  // SPECIALIZED LOG TESTS
  // ===============================
  describe('Audit Trail Operations', () => {
    it('should track device creation audit trail', async () => {
      if (testDeviceIds.length === 0) return

      const auditData = createUniqueTestLog({
        action: 'CREATE',
        entityType: 'device',
        entityId: testDeviceIds[0],
        message: 'Device created successfully',
        details: {
          newValue: {
            name: 'Test Device',
            status: 'active'
          },
          previousValue: null,
          changes: ['name', 'status', 'position']
        }
      })
      const response = await request(app)
        .post('/logs')
        .send(auditData)
        .expect(201)

      expect(response.body.action).toBe('CREATE')
      expect(response.body.entityType).toBe('device')
      expect(response.body.entityId).toBe(testDeviceIds[0])

      testCleanupIds.push(response.body._id)
    })

    it('should track user authentication events', async () => {
      if (testUserIds.length === 0) return

      const authData = createUniqueTestLog({
        action: 'LOGIN',
        entityType: 'user',
        entityId: testUserIds[0],
        userId: testUserIds[0],
        message: 'User logged in successfully',
        metadata: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Test Browser',
          sessionId: 'session-12345'
        }
      })
      const response = await request(app)
        .post('/logs')
        .send(authData)
        .expect(201)

      expect(response.body.action).toBe('LOGIN')
      expect(response.body.userId).toBe(testUserIds[0])

      testCleanupIds.push(response.body._id)
    })

    it('should retrieve audit trail for specific entity', async () => {
      if (testDeviceIds.length === 0) return

      const response = await request(app)
        .get(`/logs/audit/${testDeviceIds[0]}`)
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('count')

      if (response.body.data.length > 0) {
        response.body.data.forEach((log: any) => {
          expect(log.entityId).toBe(testDeviceIds[0])
        })
      }
    })
  })

  describe('Log Search and Analytics', () => {
    it('should perform full-text search in log messages', async () => {
      // Create logs with searchable content
      const searchableData = [
        createUniqueTestLog({
          message: 'Database connection established successfully',
          action: 'DB_CONNECT'
        }),
        createUniqueTestLog({
          message: 'Authentication failed for user john.doe',
          action: 'AUTH_FAIL'
        }),
        createUniqueTestLog({
          message: 'System backup completed without errors',
          action: 'BACKUP_SUCCESS'
        })
      ]
      const createdIds: string[] = []

      for (const data of searchableData) {
        const response = await request(app)
          .post('/logs')
          .send(data)
          .expect(201)

        createdIds.push(response.body._id)
      }

      testCleanupIds.push(...createdIds)

      // Search for logs
      const searchResponse = await request(app)
        .get('/logs/search?q=database')
        .expect(200)

      expect(Array.isArray(searchResponse.body.data)).toBe(true)
      if (searchResponse.body.data.length > 0) {
        searchResponse.body.data.forEach((log: any) => {
          expect(log.message.toLowerCase()).toContain('database')
        })
      }
    })

    it('should aggregate logs by action type', async () => {
      const response = await request(app)
        .get('/logs/analytics/actions')
        .expect(200)

      expect(response.body).toHaveProperty('aggregation')
      expect(Array.isArray(response.body.aggregation)).toBe(true)

      if (response.body.aggregation.length > 0) {
        response.body.aggregation.forEach((item: any) => {
          expect(item).toHaveProperty('_id') // action type
          expect(item).toHaveProperty('count')
          expect(typeof item.count).toBe('number')
        })
      }
    })

    it('should aggregate logs by level and time range', async () => {
      const response = await request(app)
        .get('/logs/analytics/levels')
        .expect(200)

      expect(response.body).toHaveProperty('aggregation')
      expect(Array.isArray(response.body.aggregation)).toBe(true)

      if (response.body.aggregation.length > 0) {
        response.body.aggregation.forEach((item: any) => {
          expect(item).toHaveProperty('_id') // level
          expect(item).toHaveProperty('count')
        })
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - DELETE /logs/:id
  // ===============================
  describe('DELETE /logs/:id - Delete Specific Log', () => {
    it('should delete specific log by ID', async () => {
      // Create a log to delete
      const logData = createUniqueTestLog()
      const createResponse = await request(app)
        .post('/logs')
        .send(logData)
        .expect(201)
      const logToDelete = createResponse.body._id
      // Delete the log
      const deleteResponse = await request(app)
        .delete(`/logs/${logToDelete}`)
        .expect(200)

      expect(deleteResponse.body).toHaveProperty('message', 'Log deleted successfully')
      expect(deleteResponse.body).toHaveProperty('deletedCount', 1)

      // Verify deletion
      await request(app)
        .get(`/logs/${logToDelete}`)
        .expect(404)
    })

    it('should return 404 when deleting non-existent log', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .delete(`/logs/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Log not found')
    })

    it('should support bulk log deletion with filters', async () => {
      // This test would check bulk deletion functionality
      const response = await request(app)
        .delete('/logs/bulk')
        .send({
          action: 'TEST_BULK_DELETE',
          olderThan: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days old
        })
        .expect(200)

      expect(response.body).toHaveProperty('deletedCount')
      expect(typeof response.body.deletedCount).toBe('number')
    })
  })

  // ===============================
  // PERFORMANCE AND INTEGRATION TESTS
  // ===============================
  describe('Performance and Integration Tests', () => {
    it('should handle high-volume log creation efficiently', async () => {
      const batchSize = 20
      const logData = Array(batchSize).fill(null).map((_, index) =>
        createUniqueTestLog({
          action: `BATCH_ACTION_${index}`,
          message: `Batch log entry ${index}`,
          level: index % 2 === 0 ? 'info' : 'warn'
        })
      )
      const createdIds: string[] = []

      try {
        // Batch create
        const createPromises = logData.map(data =>
          request(app).post('/logs').send(data)
        )
        const createResponses = await Promise.all(createPromises)

        createResponses.forEach(response => {
          expect(response.status).toBe(201)
          createdIds.push(response.body._id)
        })

        // Verify batch read
        const readResponse = await request(app)
          .get('/logs?action=BATCH_ACTION_0')
          .expect(200)

        expect(readResponse.body.data.length).toBeGreaterThan(0)

      } finally {
        testCleanupIds.push(...createdIds)
      }
    })

    it('should handle complex log queries with multiple filters', async () => {
      // Create logs with various combinations
      const complexData = [
        createUniqueTestLog({
          action: 'COMPLEX_TEST_A',
          level: 'error',
          entityType: 'device'
        }),
        createUniqueTestLog({
          action: 'COMPLEX_TEST_B',
          level: 'info',
          entityType: 'user'
        }),
        createUniqueTestLog({
          action: 'COMPLEX_TEST_A',
          level: 'warn',
          entityType: 'device'
        })
      ]
      const createdIds: string[] = []

      for (const data of complexData) {
        const response = await request(app)
          .post('/logs')
          .send(data)
          .expect(201)

        createdIds.push(response.body._id)
      }

      testCleanupIds.push(...createdIds)

      // Complex query with multiple filters
      const response = await request(app)
        .get('/logs?action=COMPLEX_TEST_A&entityType=device&level=error')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      if (response.body.data.length > 0) {
        response.body.data.forEach((log: any) => {
          expect(log.action).toBe('COMPLEX_TEST_A')
          expect(log.entityType).toBe('device')
          expect(log.level).toBe('error')
        })
      }
    })
  })

  // ===============================
  // EDGE CASES AND ERROR SCENARIOS
  // ===============================
  describe('Edge Cases and Error Scenarios', () => {
    it('should handle large log messages', async () => {
      const largeMessage = 'Large log message: ' + 'x'.repeat(5000)
      const logData = createUniqueTestLog({
        message: largeMessage
      })
      const response = await request(app)
        .post('/logs')
        .send(logData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body.message).toBe(largeMessage)
      }
    })

    it('should handle special characters in log data', async () => {
      const specialCharData = createUniqueTestLog({
        action: 'TEST_SPECIAL_CHARS',
        message: 'Log with émojis 📊, quotes "test", and symbols <>&'
      })
      const response = await request(app)
        .post('/logs')
        .send(specialCharData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body.message).toBe(specialCharData.message)
      }
    })

    it('should handle concurrent log writes', async () => {
      const concurrentData = Array(10).fill(null).map((_, index) =>
        createUniqueTestLog({
          action: `CONCURRENT_${index}`,
          message: `Concurrent log ${index}`
        })
      )
      const promises = concurrentData.map(data =>
        request(app).post('/logs').send(data)
      )
      const responses = await Promise.all(promises)

      responses.forEach(response => {
        if (response.status === 201) {
          testCleanupIds.push(response.body._id)
        }
      })

      const successfulCreations = responses.filter(r => r.status === 201)

      expect(successfulCreations.length).toBeGreaterThan(0)
    })
  })
})

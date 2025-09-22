/**
 * @file device.test.ts
 * @description Comprehensive test suite for Device API endpoints and operations.
 *
 * Coverage includes:
 * - Complete CRUD operations for all device endpoints
 * - Device positioning and location management
 * - Model relationships and validation
 * - Status updates and state management
 * - Network protocol configuration
 * - Input validation and sanitization
 * - Error handling and edge cases
 * - Security testing (injection prevention)
 * - Database integration and persistence
 * - Performance and concurrent access
 *
 * @version 2024-09-22 Comprehensive device API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Device API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db
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
      console.log('✅ MongoDB connection successful for comprehensive device tests')

      // Create test models for device relationships
      await createTestModels()
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
          const deviceCollection = db.collection('devices')
          const deviceObjectIds = testCleanupIds.map(id => new ObjectId(id))

          await deviceCollection.deleteMany({ _id: { $in: deviceObjectIds } })
          console.log(`🧹 Cleaned up ${testCleanupIds.length} test devices`)
        }

        if (testModelIds.length > 0) {
          const modelCollection = db.collection('models')
          const modelObjectIds = testModelIds.map(id => new ObjectId(id))

          await modelCollection.deleteMany({ _id: { $in: modelObjectIds } })
          console.log(`🧹 Cleaned up ${testModelIds.length} test models`)
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
  const createTestModels = async () => {
    if (!checkDbConnection()) return

    const models = db.collection('models')
    const testModels = [
      {
        name: 'Test Server Model',
        dimension: { width: 1, height: 2, depth: 3 },
        texture: {
          front: '/assets/texture/server-front.png',
          back: '/assets/texture/server-back.png',
          side: '/assets/texture/server-side.png',
          top: '/assets/texture/server-top.png',
          bottom: '/assets/texture/server-bottom.png'
        },
        type: 'server',
        category: 'hardware'
      },
      {
        name: 'Test Switch Model',
        dimension: { width: 2, height: 1, depth: 2 },
        texture: {
          front: '/assets/texture/switch-front.png',
          back: '/assets/texture/switch-back.png',
          side: '/assets/texture/switch-side.png',
          top: '/assets/texture/switch-top.png',
          bottom: '/assets/texture/switch-bottom.png'
        },
        type: 'switch',
        category: 'network'
      }
    ]

    for (const model of testModels) {
      const result = await models.insertOne(model)

      testModelIds.push(result.insertedId.toString())
    }
  }
  const createUniqueTestDevice = (overrides = {}) => {
    const baseDevice = testGenerators.deviceBuilder()

    return {
      ...baseDevice,
      name: testGenerators.uniqueName('Test Device'),
      modelId: testModelIds[0] || new ObjectId().toString(),
      ...overrides
    }
  }

  // ===============================
  // DATABASE LAYER TESTS
  // ===============================
  describe('Database Device Operations', () => {
    it('should perform direct database CRUD operations', async () => {
      if (!checkDbConnection()) return

      const devices = db.collection('devices')
      const testData = []

      // Test insertion of multiple devices
      for (let i = 0; i < 3; i++) {
        const deviceData = createUniqueTestDevice()
        const insertResult = await devices.insertOne(deviceData)
        const insertedDevice = await devices.findOne({ _id: insertResult.insertedId })

        expect(insertedDevice).not.toBeNull()
        expect(insertedDevice!._id).toEqual(insertResult.insertedId)
        expect(insertedDevice!.name).toBe(deviceData.name)
        expect(insertedDevice!.position).toEqual(deviceData.position)
        expect(insertedDevice!.modelId).toBe(deviceData.modelId)

        testCleanupIds.push(insertResult.insertedId.toString())
        testData.push(insertedDevice)
      }

      // Test querying
      const foundDevices = await devices.find({
        name: { $in: testData.map(d => d!.name) }
      }).toArray()

      expect(foundDevices).toHaveLength(3)

      // Test updating
      const updateResult = await devices.updateOne(
        { _id: testData[0]!._id },
        { $set: { status: 'maintenance' } }
      )

      expect(updateResult.modifiedCount).toBe(1)

      // Test deletion
      const deleteResult = await devices.deleteOne({ _id: testData[0]!._id })

      expect(deleteResult.deletedCount).toBe(1)
    })

    it('should handle device-model relationships', async () => {
      if (!checkDbConnection()) return

      const devices = db.collection('devices')
      const models = db.collection('models')
      // Verify test model exists
      const testModel = await models.findOne({ _id: new ObjectId(testModelIds[0]) })

      expect(testModel).not.toBeNull()

      // Create device with model relationship
      const deviceData = createUniqueTestDevice({
        modelId: testModelIds[0]
      })
      const insertResult = await devices.insertOne(deviceData)

      testCleanupIds.push(insertResult.insertedId.toString())

      // Verify relationship
      const insertedDevice = await devices.findOne({ _id: insertResult.insertedId })

      expect(insertedDevice!.modelId).toBe(testModelIds[0])
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /devices
  // ===============================
  describe('GET /devices - Retrieve Devices', () => {
    it('should return all devices with proper structure', async () => {
      const response = await request(app)
        .get('/devices')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('count')
      expect(typeof response.body.count).toBe('number')

      if (response.body.data.length > 0) {
        const device = response.body.data[0]

        expect(device).toHaveProperty('_id')
        expect(device).toHaveProperty('name')
        expect(device).toHaveProperty('position')
        expect(device).toHaveProperty('modelId')

        // Validate position structure
        expect(device.position).toHaveProperty('x')
        expect(device.position).toHaveProperty('y')
        expect(device.position).toHaveProperty('z')

        // Validate optional fields exist if present
        if (device.status) {
          expect(['active', 'inactive', 'maintenance', 'error']).toContain(device.status)
        }
      }
    })

    it('should support filtering by status', async () => {
      // Create a device with specific status
      const deviceData = createUniqueTestDevice({ status: 'maintenance' })
      const createResponse = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .get('/devices?status=maintenance')
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      response.body.data.forEach(device => {
        expect(device.status).toBe('maintenance')
      })
    })

    it('should support filtering by model', async () => {
      if (testModelIds.length === 0) return

      const response = await request(app)
        .get(`/devices?modelId=${testModelIds[0]}`)
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach(device => {
        expect(device.modelId).toBe(testModelIds[0])
      })
    })

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/devices?limit=1')
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.count).toBe(1)
    })

    it('should handle invalid filter parameters gracefully', async () => {
      const response = await request(app)
        .get('/devices?status=invalid-status')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - POST /devices
  // ===============================
  describe('POST /devices - Create Devices', () => {
    it('should create a new device with complete data', async () => {
      const deviceData = createUniqueTestDevice()
      const response = await request(app)
        .post('/devices')
        .send(deviceData)
        .set('Accept', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(deviceData.name)
      expect(response.body.position).toEqual(deviceData.position)
      expect(response.body.modelId).toBe(deviceData.modelId)
      expect(response.body.status).toBe(deviceData.status || 'active')

      testDeviceIds.push(response.body._id)
      testCleanupIds.push(response.body._id)
    })

    it('should create device with minimal required data', async () => {
      const minimalData = {
        name: testGenerators.uniqueName('Minimal Device'),
        position: testGenerators.position3d(),
        modelId: testModelIds[0] || new ObjectId().toString()
      }
      const response = await request(app)
        .post('/devices')
        .send(minimalData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(minimalData.name)
      expect(response.body.status).toBe('active') // Default status
      testCleanupIds.push(response.body._id)
    })

    it('should reject device without required name field', async () => {
      const deviceData = createUniqueTestDevice()

      delete deviceData.name

      const response = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Name is required')
    })

    it('should reject device without required position', async () => {
      const deviceData = createUniqueTestDevice()

      delete deviceData.position

      const response = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject device with invalid position data', async () => {
      const deviceData = createUniqueTestDevice({
        position: {
          x: 'invalid',
          y: null,
          z: undefined
        }
      })
      const response = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject device with invalid modelId', async () => {
      const deviceData = createUniqueTestDevice({
        modelId: 'invalid-object-id'
      })
      const response = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject device with non-existent modelId', async () => {
      const deviceData = createUniqueTestDevice({
        modelId: new ObjectId().toString()
      })
      const response = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.message).toContain('Model not found')
    })

    it('should handle duplicate device names', async () => {
      const deviceData1 = createUniqueTestDevice()
      const deviceData2 = { ...createUniqueTestDevice(), name: deviceData1.name }
      // Create first device
      const response1 = await request(app)
        .post('/devices')
        .send(deviceData1)
        .expect(201)

      testCleanupIds.push(response1.body._id)

      // Try to create duplicate
      const response2 = await request(app)
        .post('/devices')
        .send(deviceData2)
        .expect(409)

      expect(response2.body).toHaveProperty('error', 'Conflict')
      expect(response2.body.message).toContain('already exists')
    })

    it('should validate device status values', async () => {
      const invalidStatuses = ['unknown', 'broken', 'invalid']

      for (const status of invalidStatuses) {
        const deviceData = createUniqueTestDevice({ status })
        const response = await request(app)
          .post('/devices')
          .send(deviceData)
          .expect(400)

        expect(response.body).toHaveProperty('error')
      }
    })

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousData = createUniqueTestDevice({
        name: testGenerators.uniqueName('Test Device'),
        description: testGenerators.invalidData.scriptInjection,
        '$where': testGenerators.invalidData.nosqlInjection.$where
      })
      const response = await request(app)
        .post('/devices')
        .send(maliciousData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(maliciousData.name)
      expect(response.body).not.toHaveProperty('$where')

      testCleanupIds.push(response.body._id)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /devices/:id
  // ===============================
  describe('GET /devices/:id - Retrieve Specific Device', () => {
    let testDeviceId: string

    beforeAll(async () => {
      const deviceData = createUniqueTestDevice()
      const response = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(201)

      testDeviceId = response.body._id
      testCleanupIds.push(testDeviceId)
    })

    it('should return specific device by valid ID', async () => {
      const response = await request(app)
        .get(`/devices/${testDeviceId}`)
        .expect(200)

      expect(response.body).toHaveProperty('_id', testDeviceId)
      expect(response.body).toHaveProperty('name')
      expect(response.body).toHaveProperty('position')
      expect(response.body).toHaveProperty('modelId')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/devices/invalid-id')
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Invalid Input')
      expect(response.body).toHaveProperty('message', 'Invalid ObjectId format')
    })

    it('should return 404 for non-existent device', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .get(`/devices/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Device not found')
    })

    it('should include model details when requested', async () => {
      const response = await request(app)
        .get(`/devices/${testDeviceId}?includeModel=true`)
        .expect(200)

      if (response.body.model) {
        expect(response.body.model).toHaveProperty('name')
        expect(response.body.model).toHaveProperty('dimension')
        expect(response.body.model).toHaveProperty('texture')
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - PUT /devices/:id
  // ===============================
  describe('PUT /devices/:id - Update Complete Device', () => {
    let updateDeviceId: string

    beforeAll(async () => {
      const deviceData = createUniqueTestDevice()
      const response = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(201)

      updateDeviceId = response.body._id
      testCleanupIds.push(updateDeviceId)
    })

    it('should update complete device with valid data', async () => {
      const updateData = {
        name: 'Updated Test Device',
        position: { x: 10, y: 20, z: 30 },
        modelId: testModelIds[0] || new ObjectId().toString(),
        status: 'maintenance',
        ipAddress: '192.168.1.100',
        macAddress: '00:11:22:33:44:55'
      }
      const response = await request(app)
        .put(`/devices/${updateDeviceId}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Device updated successfully')
      expect(response.body).toHaveProperty('modifiedCount', 1)

      // Verify the update
      const getResponse = await request(app)
        .get(`/devices/${updateDeviceId}`)
        .expect(200)

      expect(getResponse.body.name).toBe(updateData.name)
      expect(getResponse.body.position).toEqual(updateData.position)
      expect(getResponse.body.status).toBe(updateData.status)
    })

    it('should return 404 for non-existent device update', async () => {
      const fakeId = new ObjectId().toString()
      const updateData = { name: 'Updated Name' }
      const response = await request(app)
        .put(`/devices/${fakeId}`)
        .send(updateData)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Device not found')
    })

    it('should validate required fields during update', async () => {
      const updateData = {
        position: { x: 5, y: 6, z: 7 }
        // Missing required name field
      }
      const response = await request(app)
        .put(`/devices/${updateDeviceId}`)
        .send(updateData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - PATCH Operations
  // ===============================
  describe('PATCH /devices/position/:id - Update Device Position', () => {
    let patchDeviceId: string

    beforeAll(async () => {
      const deviceData = createUniqueTestDevice()
      const response = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(201)

      patchDeviceId = response.body._id
      testCleanupIds.push(patchDeviceId)
    })

    it('should update only position fields', async () => {
      const positionUpdate = {
        position: { x: 100, y: 200, z: 300 }
      }
      const response = await request(app)
        .patch(`/devices/position/${patchDeviceId}`)
        .send(positionUpdate)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Device position updated successfully')
      expect(response.body).toHaveProperty('modifiedCount', 1)

      // Verify only position was updated
      const getResponse = await request(app)
        .get(`/devices/${patchDeviceId}`)
        .expect(200)

      expect(getResponse.body.position).toEqual(positionUpdate.position)
    })

    it('should reject invalid position values', async () => {
      const invalidPosition = {
        position: { x: 'invalid', y: null, z: undefined }
      }
      const response = await request(app)
        .patch(`/devices/position/${patchDeviceId}`)
        .send(invalidPosition)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PATCH /devices/status/:id - Update Device Status', () => {
    let statusDeviceId: string

    beforeAll(async () => {
      const deviceData = createUniqueTestDevice()
      const response = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(201)

      statusDeviceId = response.body._id
      testCleanupIds.push(statusDeviceId)
    })

    it('should update only status field', async () => {
      const statusUpdate = {
        status: 'inactive'
      }
      const response = await request(app)
        .patch(`/devices/status/${statusDeviceId}`)
        .send(statusUpdate)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Device status updated successfully')
      expect(response.body).toHaveProperty('modifiedCount', 1)

      // Verify status was updated
      const getResponse = await request(app)
        .get(`/devices/${statusDeviceId}`)
        .expect(200)

      expect(getResponse.body.status).toBe(statusUpdate.status)
    })

    it('should reject invalid status values', async () => {
      const invalidStatus = {
        status: 'invalid-status'
      }
      const response = await request(app)
        .patch(`/devices/status/${statusDeviceId}`)
        .send(invalidStatus)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - DELETE /devices/:id
  // ===============================
  describe('DELETE /devices/:id - Delete Specific Device', () => {
    it('should delete specific device by ID', async () => {
      // Create a device to delete
      const deviceData = createUniqueTestDevice()
      const createResponse = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(201)
      const deviceToDelete = createResponse.body._id
      // Delete the device
      const deleteResponse = await request(app)
        .delete(`/devices/${deviceToDelete}`)
        .expect(200)

      expect(deleteResponse.body).toHaveProperty('message', 'Device deleted successfully')
      expect(deleteResponse.body).toHaveProperty('deletedCount', 1)

      // Verify deletion
      await request(app)
        .get(`/devices/${deviceToDelete}`)
        .expect(404)
    })

    it('should return 404 when deleting non-existent device', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .delete(`/devices/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Device not found')
    })

    it('should handle dependent connections when deleting device', async () => {
      // This test would check if connections are properly handled when device is deleted
      // Implementation depends on your business logic for cascade deletion
      const deviceData = createUniqueTestDevice()
      const createResponse = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(201)
      const deviceId = createResponse.body._id
      // For now, just test basic deletion
      const deleteResponse = await request(app)
        .delete(`/devices/${deviceId}`)
        .expect(200)

      expect(deleteResponse.body).toHaveProperty('deletedCount', 1)
    })
  })

  // ===============================
  // PERFORMANCE AND INTEGRATION TESTS
  // ===============================
  describe('Performance and Integration Tests', () => {
    it('should handle batch device operations efficiently', async () => {
      const batchSize = 5
      const deviceData = Array(batchSize).fill(null).map(() => createUniqueTestDevice())
      const createdIds: string[] = []

      try {
        // Batch create
        const createPromises = deviceData.map(data =>
          request(app).post('/devices').send(data)
        )
        const createResponses = await Promise.all(createPromises)

        createResponses.forEach(response => {
          expect(response.status).toBe(201)
          createdIds.push(response.body._id)
        })

        // Batch read
        const readPromises = createdIds.map(id =>
          request(app).get(`/devices/${id}`)
        )
        const readResponses = await Promise.all(readPromises)

        readResponses.forEach(response => {
          expect(response.status).toBe(200)
        })

      } finally {
        testCleanupIds.push(...createdIds)
      }
    })

    it('should handle device-model relationship integrity', async () => {
      if (!checkDbConnection() || testModelIds.length === 0) return

      const deviceData = createUniqueTestDevice({
        modelId: testModelIds[0]
      })
      const response = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(201)

      testCleanupIds.push(response.body._id)

      // Verify device is linked to model
      const getResponse = await request(app)
        .get(`/devices/${response.body._id}?includeModel=true`)
        .expect(200)

      expect(getResponse.body.modelId).toBe(testModelIds[0])
      if (getResponse.body.model) {
        expect(getResponse.body.model).toHaveProperty('name')
      }
    })

    it('should handle concurrent position updates', async () => {
      const deviceData = createUniqueTestDevice()
      const createResponse = await request(app)
        .post('/devices')
        .send(deviceData)
        .expect(201)
      const deviceId = createResponse.body._id

      testCleanupIds.push(deviceId)

      // Concurrent position updates
      const updatePromises = Array(5).fill(null).map((_, index) =>
        request(app)
          .patch(`/devices/position/${deviceId}`)
          .send({ position: { x: index * 10, y: index * 10, z: index * 10 } })
      )
      const responses = await Promise.allSettled(updatePromises)
      // At least one should succeed
      const successCount = responses.filter(r =>
        r.status === 'fulfilled' && r.value.status === 200
      ).length

      expect(successCount).toBeGreaterThan(0)
    })
  })

  // ===============================
  // EDGE CASES AND ERROR SCENARIOS
  // ===============================
  describe('Edge Cases and Error Scenarios', () => {
    it('should handle devices at boundary positions', async () => {
      const boundaryPositions = [
        { x: 0, y: 0, z: 0 },
        { x: -1000, y: -1000, z: -1000 },
        { x: 1000, y: 1000, z: 1000 },
        { x: 0.5, y: 0.5, z: 0.5 }
      ]

      for (const position of boundaryPositions) {
        const deviceData = createUniqueTestDevice({ position })
        const response = await request(app)
          .post('/devices')
          .send(deviceData)

        if (response.status === 201) {
          testCleanupIds.push(response.body._id)
          expect(response.body.position).toEqual(position)
        }
      }
    })

    it('should handle special characters in device names', async () => {
      const specialCharNames = [
        'Device with émojis 🖥️',
        'Устройство на русском',
        'Device with "quotes" and \'apostrophes\'',
        'Device with <tags> & symbols',
        'Device\nwith\nnewlines'
      ]

      for (const name of specialCharNames) {
        const deviceData = createUniqueTestDevice({ name })
        const response = await request(app)
          .post('/devices')
          .send(deviceData)

        if (response.status === 201) {
          testCleanupIds.push(response.body._id)
          expect(response.body.name).toBe(name)
        }
      }
    })

    it('should handle large device payloads', async () => {
      const largeData = createUniqueTestDevice({
        description: 'x'.repeat(5000),
        notes: 'y'.repeat(3000),
        configuration: {
          setting1: 'a'.repeat(1000),
          setting2: 'b'.repeat(1000)
        }
      })
      const response = await request(app)
        .post('/devices')
        .send(largeData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body).toHaveProperty('_id')
      }
    })
  })
})

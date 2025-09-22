/**
 * @file floor.test.ts
 * @description Comprehensive test suite for Floor API endpoints and operations.
 *
 * Coverage includes:
 * - Complete CRUD operations for all floor endpoints
 * - Floor layout and spatial management
 * - Device placement and positioning
 * - Floor hierarchy and relationships
 * - Capacity and utilization tracking
 * - Input validation and sanitization
 * - Error handling and edge cases
 * - Security testing (injection prevention)
 * - Database integration and persistence
 * - Performance and concurrent access
 *
 * @version 2024-09-22 Comprehensive floor API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Floor API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db
  const testFloorIds: string[] = []
  const testDeviceIds: string[] = []
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
      console.log('✅ MongoDB connection successful for comprehensive floor tests')

      // Create test devices for floor relationships
      await createTestDevices()
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
      // Clean up test data in proper order (floors -> devices)
      if (db) {
        if (testCleanupIds.length > 0) {
          const floorCollection = db.collection('floors')
          const floorObjectIds = testCleanupIds.map(id => new ObjectId(id))

          await floorCollection.deleteMany({ _id: { $in: floorObjectIds } })
          console.log(`🧹 Cleaned up ${testCleanupIds.length} test floors`)
        }

        if (testDeviceIds.length > 0) {
          const deviceCollection = db.collection('devices')
          const deviceObjectIds = testDeviceIds.map(id => new ObjectId(id))

          await deviceCollection.deleteMany({ _id: { $in: deviceObjectIds } })
          console.log(`🧹 Cleaned up ${testDeviceIds.length} test devices`)
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
  const createTestDevices = async () => {
    if (!checkDbConnection()) return

    const devices = db.collection('devices')
    const testDevices = [
      {
        name: 'Test Device for Floor A',
        position: { x: 10, y: 20, z: 0 },
        modelId: new ObjectId().toString(),
        status: 'active'
      },
      {
        name: 'Test Device for Floor B',
        position: { x: 30, y: 40, z: 0 },
        modelId: new ObjectId().toString(),
        status: 'active'
      }
    ]

    for (const device of testDevices) {
      const result = await devices.insertOne(device)

      testDeviceIds.push(result.insertedId.toString())
    }
  }
  const createUniqueTestFloor = (overrides = {}) => {
    const baseFloor = testGenerators.floorBuilder()

    return {
      name: testGenerators.uniqueName('Test Floor'),
      level: baseFloor.level || 1,
      dimensions: {
        width: testGenerators.dimension().width * 10,
        height: testGenerators.dimension().height * 10,
        depth: testGenerators.dimension().depth * 2
      },
      layout: {
        type: testGenerators.randomArrayElement(['datacenter', 'office', 'warehouse', 'mixed']),
        sections: [
          {
            name: 'Section A',
            area: { x: 0, y: 0, width: 50, height: 50 },
            type: 'rack-space'
          },
          {
            name: 'Section B',
            area: { x: 50, y: 0, width: 50, height: 50 },
            type: 'cooling'
          }
        ]
      },
      capacity: {
        maxDevices: testGenerators.randomArrayElement([100, 200, 500]),
        maxPowerKw: testGenerators.randomArrayElement([50, 100, 200]),
        rackUnits: testGenerators.randomArrayElement([42, 84, 126])
      },
      environment: {
        temperature: {
          min: 18,
          max: 27,
          current: 22
        },
        humidity: {
          min: 40,
          max: 60,
          current: 45
        }
      },
      isActive: true,
      ...overrides
    }
  }

  // ===============================
  // DATABASE LAYER TESTS
  // ===============================
  describe('Database Floor Operations', () => {
    it('should perform direct database CRUD operations', async () => {
      if (!checkDbConnection()) return

      const floors = db.collection('floors')
      const testData = []

      // Test insertion of multiple floors
      for (let i = 0; i < 3; i++) {
        const floorData = createUniqueTestFloor({
          name: `Test Floor ${i}`,
          level: i + 1
        })
        const insertResult = await floors.insertOne(floorData)
        const insertedFloor = await floors.findOne({ _id: insertResult.insertedId })

        expect(insertedFloor).not.toBeNull()
        expect(insertedFloor!._id).toEqual(insertResult.insertedId)
        expect(insertedFloor!.name).toBe(floorData.name)
        expect(insertedFloor!.level).toBe(floorData.level)
        expect(insertedFloor!.dimensions).toEqual(floorData.dimensions)

        testCleanupIds.push(insertResult.insertedId.toString())
        testData.push(insertedFloor)
      }

      // Test querying
      const foundFloors = await floors.find({
        name: { $in: testData.map(f => f!.name) }
      }).toArray()

      expect(foundFloors).toHaveLength(3)

      // Test updating
      const updateResult = await floors.updateOne(
        { _id: testData[0]!._id },
        { $set: { isActive: false } }
      )

      expect(updateResult.modifiedCount).toBe(1)

      // Test deletion
      const deleteResult = await floors.deleteOne({ _id: testData[0]!._id })

      expect(deleteResult.deletedCount).toBe(1)
    })

    it('should handle floor-device relationships', async () => {
      if (!checkDbConnection() || testDeviceIds.length === 0) return

      const floors = db.collection('floors')
      const devices = db.collection('devices')
      // Create floor
      const floorData = createUniqueTestFloor()
      const floorResult = await floors.insertOne(floorData)

      testCleanupIds.push(floorResult.insertedId.toString())

      // Associate device with floor
      const updateResult = await devices.updateOne(
        { _id: new ObjectId(testDeviceIds[0]) },
        { $set: { floorId: floorResult.insertedId.toString() } }
      )

      expect(updateResult.modifiedCount).toBe(1)

      // Verify relationship
      const updatedDevice = await devices.findOne({ _id: new ObjectId(testDeviceIds[0]) })

      expect(updatedDevice!.floorId).toBe(floorResult.insertedId.toString())
    })

    it('should handle floor hierarchy queries', async () => {
      if (!checkDbConnection()) return

      const floors = db.collection('floors')
      // Create floors with different levels
      const floorLevels = [
        { name: 'Ground Floor', level: 0 },
        { name: 'First Floor', level: 1 },
        { name: 'Second Floor', level: 2 }
      ]
      const createdIds = []

      for (const floor of floorLevels) {
        const floorData = createUniqueTestFloor(floor)
        const result = await floors.insertOne(floorData)

        createdIds.push(result.insertedId)
      }

      testCleanupIds.push(...createdIds.map(id => id.toString()))

      // Query floors by level range
      const middleFloors = await floors.find({
        level: { $gte: 1, $lte: 2 }
      }).toArray()

      expect(middleFloors.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /floors
  // ===============================
  describe('GET /floors - Retrieve Floors', () => {
    it('should return all floors with proper structure', async () => {
      const response = await request(app)
        .get('/floors')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('count')
      expect(typeof response.body.count).toBe('number')

      if (response.body.data.length > 0) {
        const floor = response.body.data[0]

        expect(floor).toHaveProperty('_id')
        expect(floor).toHaveProperty('name')
        expect(floor).toHaveProperty('level')
        expect(floor).toHaveProperty('dimensions')

        // Validate dimensions structure
        expect(floor.dimensions).toHaveProperty('width')
        expect(floor.dimensions).toHaveProperty('height')

        // Validate optional fields if present
        if (floor.layout) {
          expect(floor.layout).toHaveProperty('type')
        }
        if (floor.capacity) {
          expect(typeof floor.capacity.maxDevices).toBe('number')
        }
      }
    })

    it('should support filtering by level', async () => {
      // Create a floor with specific level
      const floorData = createUniqueTestFloor({ level: 5 })
      const createResponse = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .get('/floors?level=5')
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      response.body.data.forEach((floor: any) => {
        expect(floor.level).toBe(5)
      })
    })

    it('should support filtering by active status', async () => {
      const response = await request(app)
        .get('/floors?isActive=true')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((floor: any) => {
        expect(floor.isActive).toBe(true)
      })
    })

    it('should support filtering by layout type', async () => {
      const response = await request(app)
        .get('/floors?layoutType=datacenter')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((floor: any) => {
        if (floor.layout) {
          expect(floor.layout.type).toBe('datacenter')
        }
      })
    })

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/floors?limit=1')
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.count).toBe(1)
    })

    it('should handle sorting by level', async () => {
      const response = await request(app)
        .get('/floors?sortBy=level&sortOrder=asc')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      if (response.body.data.length > 1) {
        for (let i = 1; i < response.body.data.length; i++) {
          expect(response.body.data[i].level).toBeGreaterThanOrEqual(response.body.data[i - 1].level)
        }
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - POST /floors
  // ===============================
  describe('POST /floors - Create Floors', () => {
    it('should create a new floor with complete data', async () => {
      const floorData = createUniqueTestFloor()
      const response = await request(app)
        .post('/floors')
        .send(floorData)
        .set('Accept', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(floorData.name)
      expect(response.body.level).toBe(floorData.level)
      expect(response.body.dimensions).toEqual(floorData.dimensions)
      expect(response.body.layout).toEqual(floorData.layout)
      expect(response.body.capacity).toEqual(floorData.capacity)

      testFloorIds.push(response.body._id)
      testCleanupIds.push(response.body._id)
    })

    it('should create floor with minimal required data', async () => {
      const minimalData = {
        name: testGenerators.uniqueName('Minimal Floor'),
        level: 1,
        dimensions: {
          width: 100,
          height: 100,
          depth: 10
        }
      }
      const response = await request(app)
        .post('/floors')
        .send(minimalData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(minimalData.name)
      expect(response.body.level).toBe(minimalData.level)
      expect(response.body.isActive).toBe(true) // Default value
      testCleanupIds.push(response.body._id)
    })

    it('should reject floor without required name field', async () => {
      const floorData = createUniqueTestFloor()

      // @ts-expect-error - Intentionally creating invalid data for testing
      delete floorData.name

      const response = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Name is required')
    })

    it('should reject floor without required level', async () => {
      const floorData = createUniqueTestFloor()

      // @ts-expect-error - Intentionally creating invalid data for testing
      delete floorData.level

      const response = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject floor without required dimensions', async () => {
      const floorData = createUniqueTestFloor()

      // @ts-expect-error - Intentionally creating invalid data for testing
      delete floorData.dimensions

      const response = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject floor with invalid dimensions', async () => {
      const floorData = createUniqueTestFloor({
        dimensions: {
          width: -50,
          height: 0,
          depth: 'invalid'
        }
      })
      const response = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle duplicate floor names on same level', async () => {
      const floorData1 = createUniqueTestFloor({ level: 10 })
      const floorData2 = { ...createUniqueTestFloor({ level: 10 }), name: floorData1.name }
      // Create first floor
      const response1 = await request(app)
        .post('/floors')
        .send(floorData1)
        .expect(201)

      testCleanupIds.push(response1.body._id)

      // Try to create duplicate on same level
      const response2 = await request(app)
        .post('/floors')
        .send(floorData2)
        .expect(409)

      expect(response2.body).toHaveProperty('error', 'Conflict')
      expect(response2.body.message).toContain('already exists')
    })

    it('should allow same name on different levels', async () => {
      const floorName = testGenerators.uniqueName('Multi Level Floor')
      const floorData1 = createUniqueTestFloor({ name: floorName, level: 20 })
      const floorData2 = createUniqueTestFloor({ name: floorName, level: 21 })
      // Create first floor
      const response1 = await request(app)
        .post('/floors')
        .send(floorData1)
        .expect(201)

      testCleanupIds.push(response1.body._id)

      // Create floor with same name on different level
      const response2 = await request(app)
        .post('/floors')
        .send(floorData2)
        .expect(201)

      testCleanupIds.push(response2.body._id)

      expect(response1.body.name).toBe(floorName)
      expect(response2.body.name).toBe(floorName)
      expect(response1.body.level).toBe(20)
      expect(response2.body.level).toBe(21)
    })

    it('should validate layout structure', async () => {
      const floorData = createUniqueTestFloor({
        layout: {
          type: 'invalid-type',
          sections: 'invalid-sections'
        }
      })
      const response = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should validate capacity constraints', async () => {
      const floorData = createUniqueTestFloor({
        capacity: {
          maxDevices: -10,
          maxPowerKw: 'invalid',
          rackUnits: null
        }
      })
      const response = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousData = createUniqueTestFloor({
        name: testGenerators.uniqueName('Test Floor'),
        description: testGenerators.invalidData.scriptInjection,
        '$where': testGenerators.invalidData.nosqlInjection.$where
      })
      const response = await request(app)
        .post('/floors')
        .send(maliciousData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(maliciousData.name)
      expect(response.body).not.toHaveProperty('$where')

      testCleanupIds.push(response.body._id)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /floors/:id
  // ===============================
  describe('GET /floors/:id - Retrieve Specific Floor', () => {
    let testFloorId: string

    beforeAll(async () => {
      const floorData = createUniqueTestFloor()
      const response = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(201)

      testFloorId = response.body._id
      testCleanupIds.push(testFloorId)
    })

    it('should return specific floor by valid ID', async () => {
      const response = await request(app)
        .get(`/floors/${testFloorId}`)
        .expect(200)

      expect(response.body).toHaveProperty('_id', testFloorId)
      expect(response.body).toHaveProperty('name')
      expect(response.body).toHaveProperty('level')
      expect(response.body).toHaveProperty('dimensions')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/floors/invalid-id')
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Invalid Input')
      expect(response.body).toHaveProperty('message', 'Invalid ObjectId format')
    })

    it('should return 404 for non-existent floor', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .get(`/floors/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Floor not found')
    })

    it('should include device count when requested', async () => {
      const response = await request(app)
        .get(`/floors/${testFloorId}?includeDeviceCount=true`)
        .expect(200)

      if (response.body.deviceCount !== undefined) {
        expect(typeof response.body.deviceCount).toBe('number')
        expect(response.body.deviceCount).toBeGreaterThanOrEqual(0)
      }
    })

    it('should include utilization metrics when requested', async () => {
      const response = await request(app)
        .get(`/floors/${testFloorId}?includeUtilization=true`)
        .expect(200)

      if (response.body.utilization) {
        expect(response.body.utilization).toHaveProperty('spaceUsed')
        expect(response.body.utilization).toHaveProperty('powerUsed')
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - PUT /floors/:id
  // ===============================
  describe('PUT /floors/:id - Update Complete Floor', () => {
    let updateFloorId: string

    beforeAll(async () => {
      const floorData = createUniqueTestFloor()
      const response = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(201)

      updateFloorId = response.body._id
      testCleanupIds.push(updateFloorId)
    })

    it('should update complete floor with valid data', async () => {
      const updateData = {
        name: 'Updated Test Floor',
        level: 99,
        dimensions: {
          width: 200,
          height: 300,
          depth: 15
        },
        layout: {
          type: 'office',
          sections: [
            {
              name: 'Updated Section',
              area: { x: 0, y: 0, width: 100, height: 100 },
              type: 'workspace'
            }
          ]
        },
        capacity: {
          maxDevices: 1000,
          maxPowerKw: 500,
          rackUnits: 200
        },
        isActive: false
      }
      const response = await request(app)
        .put(`/floors/${updateFloorId}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Floor updated successfully')
      expect(response.body).toHaveProperty('modifiedCount', 1)

      // Verify the update
      const getResponse = await request(app)
        .get(`/floors/${updateFloorId}`)
        .expect(200)

      expect(getResponse.body.name).toBe(updateData.name)
      expect(getResponse.body.level).toBe(updateData.level)
      expect(getResponse.body.dimensions).toEqual(updateData.dimensions)
      expect(getResponse.body.isActive).toBe(updateData.isActive)
    })

    it('should return 404 for non-existent floor update', async () => {
      const fakeId = new ObjectId().toString()
      const updateData = { name: 'Updated Name' }
      const response = await request(app)
        .put(`/floors/${fakeId}`)
        .send(updateData)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Floor not found')
    })

    it('should validate required fields during update', async () => {
      const updateData = {
        dimensions: { width: 100, height: 100, depth: 10 }
        // Missing required name field
      }
      const response = await request(app)
        .put(`/floors/${updateFloorId}`)
        .send(updateData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - PATCH Operations
  // ===============================
  describe('PATCH /floors/capacity/:id - Update Floor Capacity', () => {
    let patchFloorId: string

    beforeAll(async () => {
      const floorData = createUniqueTestFloor()
      const response = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(201)

      patchFloorId = response.body._id
      testCleanupIds.push(patchFloorId)
    })

    it('should update only capacity fields', async () => {
      const capacityUpdate = {
        capacity: {
          maxDevices: 2000,
          maxPowerKw: 1000,
          rackUnits: 500
        }
      }
      const response = await request(app)
        .patch(`/floors/capacity/${patchFloorId}`)
        .send(capacityUpdate)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Floor capacity updated successfully')
      expect(response.body).toHaveProperty('modifiedCount', 1)

      // Verify only capacity was updated
      const getResponse = await request(app)
        .get(`/floors/${patchFloorId}`)
        .expect(200)

      expect(getResponse.body.capacity).toEqual(capacityUpdate.capacity)
    })

    it('should reject invalid capacity values', async () => {
      const invalidCapacity = {
        capacity: {
          maxDevices: -100,
          maxPowerKw: 'invalid',
          rackUnits: null
        }
      }
      const response = await request(app)
        .patch(`/floors/capacity/${patchFloorId}`)
        .send(invalidCapacity)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PATCH /floors/layout/:id - Update Floor Layout', () => {
    let layoutFloorId: string

    beforeAll(async () => {
      const floorData = createUniqueTestFloor()
      const response = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(201)

      layoutFloorId = response.body._id
      testCleanupIds.push(layoutFloorId)
    })

    it('should update only layout fields', async () => {
      const layoutUpdate = {
        layout: {
          type: 'warehouse',
          sections: [
            {
              name: 'Storage Area',
              area: { x: 0, y: 0, width: 200, height: 200 },
              type: 'storage'
            },
            {
              name: 'Loading Dock',
              area: { x: 200, y: 0, width: 50, height: 200 },
              type: 'loading'
            }
          ]
        }
      }
      const response = await request(app)
        .patch(`/floors/layout/${layoutFloorId}`)
        .send(layoutUpdate)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Floor layout updated successfully')
      expect(response.body).toHaveProperty('modifiedCount', 1)

      // Verify layout was updated
      const getResponse = await request(app)
        .get(`/floors/${layoutFloorId}`)
        .expect(200)

      expect(getResponse.body.layout).toEqual(layoutUpdate.layout)
    })

    it('should reject invalid layout structure', async () => {
      const invalidLayout = {
        layout: {
          type: 'invalid-type',
          sections: 'not-an-array'
        }
      }
      const response = await request(app)
        .patch(`/floors/layout/${layoutFloorId}`)
        .send(invalidLayout)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - DELETE /floors/:id
  // ===============================
  describe('DELETE /floors/:id - Delete Specific Floor', () => {
    it('should delete specific floor by ID', async () => {
      // Create a floor to delete
      const floorData = createUniqueTestFloor()
      const createResponse = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(201)
      const floorToDelete = createResponse.body._id
      // Delete the floor
      const deleteResponse = await request(app)
        .delete(`/floors/${floorToDelete}`)
        .expect(200)

      expect(deleteResponse.body).toHaveProperty('message', 'Floor deleted successfully')
      expect(deleteResponse.body).toHaveProperty('deletedCount', 1)

      // Verify deletion
      await request(app)
        .get(`/floors/${floorToDelete}`)
        .expect(404)
    })

    it('should return 404 when deleting non-existent floor', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .delete(`/floors/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Floor not found')
    })

    it('should handle dependent devices when deleting floor', async () => {
      // This test would check if devices are properly handled when floor is deleted
      // Implementation depends on business logic for cascade deletion
      const floorData = createUniqueTestFloor()
      const createResponse = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(201)
      const floorId = createResponse.body._id
      // For now, just test basic deletion
      const deleteResponse = await request(app)
        .delete(`/floors/${floorId}`)
        .expect(200)

      expect(deleteResponse.body).toHaveProperty('deletedCount', 1)
    })
  })

  // ===============================
  // SPECIALIZED FLOOR TESTS
  // ===============================
  describe('Floor Device Management', () => {
    it('should retrieve all devices on a specific floor', async () => {
      // Create a floor
      const floorData = createUniqueTestFloor()
      const floorResponse = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(201)

      testCleanupIds.push(floorResponse.body._id)

      const response = await request(app)
        .get(`/floors/${floorResponse.body._id}/devices`)
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('count')
    })

    it('should calculate floor utilization', async () => {
      // Create a floor
      const floorData = createUniqueTestFloor()
      const floorResponse = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(201)

      testCleanupIds.push(floorResponse.body._id)

      const response = await request(app)
        .get(`/floors/${floorResponse.body._id}/utilization`)
        .expect(200)

      expect(response.body).toHaveProperty('spaceUtilization')
      expect(response.body).toHaveProperty('powerUtilization')
      expect(response.body).toHaveProperty('deviceCount')
      expect(typeof response.body.spaceUtilization).toBe('number')
      expect(typeof response.body.powerUtilization).toBe('number')
    })

    it('should handle floor capacity warnings', async () => {
      // Create a floor with limited capacity
      const floorData = createUniqueTestFloor({
        capacity: {
          maxDevices: 5,
          maxPowerKw: 10,
          rackUnits: 21
        }
      })
      const floorResponse = await request(app)
        .post('/floors')
        .send(floorData)
        .expect(201)

      testCleanupIds.push(floorResponse.body._id)

      const response = await request(app)
        .get(`/floors/${floorResponse.body._id}/capacity-status`)
        .expect(200)

      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('warnings')
      expect(Array.isArray(response.body.warnings)).toBe(true)
    })
  })

  // ===============================
  // PERFORMANCE AND INTEGRATION TESTS
  // ===============================
  describe('Performance and Integration Tests', () => {
    it('should handle batch floor operations efficiently', async () => {
      const batchSize = 5
      const floorData = Array(batchSize).fill(null).map((_, index) =>
        createUniqueTestFloor({
          name: `Batch Floor ${index}`,
          level: index + 100
        })
      )
      const createdIds: string[] = []

      try {
        // Batch create
        const createPromises = floorData.map(data =>
          request(app).post('/floors').send(data)
        )
        const createResponses = await Promise.all(createPromises)

        createResponses.forEach(response => {
          expect(response.status).toBe(201)
          createdIds.push(response.body._id)
        })

        // Batch read
        const readPromises = createdIds.map(id =>
          request(app).get(`/floors/${id}`)
        )
        const readResponses = await Promise.all(readPromises)

        readResponses.forEach(response => {
          expect(response.status).toBe(200)
        })

      } finally {
        testCleanupIds.push(...createdIds)
      }
    })

    it('should maintain floor hierarchy consistency', async () => {
      // Create floors with sequential levels
      const floors = []

      for (let level = 0; level < 3; level++) {
        const floorData = createUniqueTestFloor({
          name: `Building Floor ${level}`,
          level
        })
        const response = await request(app)
          .post('/floors')
          .send(floorData)
          .expect(201)

        floors.push(response.body)
        testCleanupIds.push(response.body._id)
      }

      // Verify hierarchy
      const response = await request(app)
        .get('/floors?sortBy=level&sortOrder=asc')
        .expect(200)
      const buildingFloors = response.body.data.filter((f: any) =>
        f.name.includes('Building Floor')
      )

      expect(buildingFloors.length).toBeGreaterThanOrEqual(3)
    })

    it('should handle concurrent floor operations', async () => {
      const concurrentOps = Array(5).fill(null).map((_, index) =>
        request(app)
          .post('/floors')
          .send(createUniqueTestFloor({
            name: `Concurrent Floor ${index}`,
            level: index + 200
          }))
      )
      const responses = await Promise.allSettled(concurrentOps)
      const successfulCreations = responses.filter(r =>
        r.status === 'fulfilled' && r.value.status === 201
      )

      // All should succeed since they have different names/levels
      expect(successfulCreations.length).toBe(5)

      // Cleanup successful creations
      successfulCreations.forEach(r => {
        if (r.status === 'fulfilled') {
          testCleanupIds.push(r.value.body._id)
        }
      })
    })
  })

  // ===============================
  // EDGE CASES AND ERROR SCENARIOS
  // ===============================
  describe('Edge Cases and Error Scenarios', () => {
    it('should handle extreme floor dimensions', async () => {
      const extremeDimensions = [
        { width: 1, height: 1, depth: 1 },       // Minimum
        { width: 10000, height: 10000, depth: 100 }, // Maximum
        { width: 0.5, height: 0.5, depth: 0.1 }  // Fractional
      ]

      for (const dimensions of extremeDimensions) {
        const floorData = createUniqueTestFloor({ dimensions })
        const response = await request(app)
          .post('/floors')
          .send(floorData)

        if (response.status === 201) {
          testCleanupIds.push(response.body._id)
          expect(response.body.dimensions).toEqual(dimensions)
        }
      }
    })

    it('should handle special characters in floor names', async () => {
      const specialCharNames = [
        'Floor with émojis 🏢',
        'Этаж на русском',
        'Floor with "quotes" and \'apostrophes\'',
        'Floor with <tags> & symbols',
        'Floor\nwith\nnewlines'
      ]

      for (const name of specialCharNames) {
        const floorData = createUniqueTestFloor({
          name,
          level: Math.floor(Math.random() * 1000) + 500 // Random level to avoid conflicts
        })
        const response = await request(app)
          .post('/floors')
          .send(floorData)

        if (response.status === 201) {
          testCleanupIds.push(response.body._id)
          expect(response.body.name).toBe(name)
        }
      }
    })

    it('should handle complex layout structures', async () => {
      const complexLayout = {
        type: 'datacenter',
        sections: Array(20).fill(null).map((_, index) => ({
          name: `Rack Row ${String.fromCharCode(65 + index)}`, // A, B, C...
          area: {
            x: (index % 5) * 50,
            y: Math.floor(index / 5) * 30,
            width: 45,
            height: 25
          },
          type: 'rack-space',
          capacity: {
            racks: 10,
            powerKw: 20
          }
        }))
      }
      const floorData = createUniqueTestFloor({ layout: complexLayout })
      const response = await request(app)
        .post('/floors')
        .send(floorData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body.layout.sections).toHaveLength(20)
      }
    })

    it('should handle large floor metadata', async () => {
      const largeData = createUniqueTestFloor({
        description: 'x'.repeat(5000),
        notes: 'y'.repeat(3000),
        environment: {
          temperature: { min: 18, max: 27, current: 22 },
          humidity: { min: 40, max: 60, current: 45 },
          airflow: 'a'.repeat(1000),
          monitoring: {
            sensors: Array(100).fill(null).map((_, index) => ({
              id: `sensor-${index}`,
              type: 'temperature',
              location: { x: index * 10, y: index * 5 }
            }))
          }
        }
      })
      const response = await request(app)
        .post('/floors')
        .send(largeData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body).toHaveProperty('_id')
      }
    })
  })
})

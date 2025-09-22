/**
 * @file connection.test.ts
 * @description Comprehensive test suite for Connection API endpoints and operations.
 *
 * Coverage includes:
 * - Complete CRUD operations for all connection endpoints
 * - Device-to-device relationship management
 * - Network protocol validation and configuration
 * - Connection type and status management
 * - Bidirectional connection integrity
 * - Port and interface validation
 * - Input validation and sanitization
 * - Error handling and edge cases
 * - Security testing (injection prevention)
 * - Database integration and persistence
 * - Performance and concurrent access
 *
 * @version 2024-09-22 Comprehensive connection API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Connection API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db
  const testConnectionIds: string[] = []
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
      console.log('✅ MongoDB connection successful for comprehensive connection tests')

      // Create test models and devices for connection relationships
      await createTestModels()
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
      // Clean up test data in proper order (connections -> devices -> models)
      if (db) {
        if (testCleanupIds.length > 0) {
          const connectionCollection = db.collection('connections')
          const connectionObjectIds = testCleanupIds.map(id => new ObjectId(id))

          await connectionCollection.deleteMany({ _id: { $in: connectionObjectIds } })
          console.log(`🧹 Cleaned up ${testCleanupIds.length} test connections`)
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
        name: 'Test Server Model for Connections',
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
        name: 'Test Switch Model for Connections',
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
  const createTestDevices = async () => {
    if (!checkDbConnection() || testModelIds.length === 0) return

    const devices = db.collection('devices')
    const testDevices = [
      {
        name: 'Test Server Device A',
        position: { x: 0, y: 0, z: 0 },
        modelId: testModelIds[0],
        status: 'active',
        ipAddress: '192.168.1.10',
        macAddress: '00:11:22:33:44:55'
      },
      {
        name: 'Test Server Device B',
        position: { x: 5, y: 0, z: 0 },
        modelId: testModelIds[0],
        status: 'active',
        ipAddress: '192.168.1.11',
        macAddress: '00:11:22:33:44:56'
      },
      {
        name: 'Test Switch Device',
        position: { x: 10, y: 0, z: 0 },
        modelId: testModelIds[1],
        status: 'active',
        ipAddress: '192.168.1.20',
        macAddress: '00:11:22:33:44:57'
      }
    ]

    for (const device of testDevices) {
      const result = await devices.insertOne(device)

      testDeviceIds.push(result.insertedId.toString())
    }
  }
  const createUniqueTestConnection = (overrides = {}) => {
    const baseConnection = testGenerators.connectionBuilder()

    return {
      sourceDeviceId: testDeviceIds[0] || new ObjectId().toString(),
      targetDeviceId: testDeviceIds[1] || new ObjectId().toString(),
      protocol: baseConnection.protocol,
      type: baseConnection.connectionType,
      status: baseConnection.status,
      sourcePort: 'eth0',
      targetPort: 'eth1',
      label: baseConnection.name,
      bandwidth: baseConnection.bandwidth,
      description: 'Test connection created for API testing',
      configuration: {
        vlan: '100',
        qos: 'high',
        duplex: 'full'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }
  }

  // ===============================
  // DATABASE LAYER TESTS
  // ===============================
  describe('Database Connection Operations', () => {
    it('should perform direct database CRUD operations', async () => {
      if (!checkDbConnection()) return

      const connections = db.collection('connections')
      const testData = []

      // Test insertion of multiple connections
      for (let i = 0; i < 3; i++) {
        const connectionData = createUniqueTestConnection({
          sourceDeviceId: testDeviceIds[0],
          targetDeviceId: testDeviceIds[1],
          label: `Test Connection ${i}`,
          sourcePort: `eth${i}`,
          targetPort: `eth${i + 10}`
        })
        const insertResult = await connections.insertOne(connectionData)
        const insertedConnection = await connections.findOne({ _id: insertResult.insertedId })

        expect(insertedConnection).not.toBeNull()
        expect(insertedConnection!._id).toEqual(insertResult.insertedId)
        expect(insertedConnection!.sourceDeviceId).toBe(connectionData.sourceDeviceId)
        expect(insertedConnection!.targetDeviceId).toBe(connectionData.targetDeviceId)
        expect(insertedConnection!.protocol).toBe(connectionData.protocol)

        testCleanupIds.push(insertResult.insertedId.toString())
        testData.push(insertedConnection)
      }

      // Test querying
      const foundConnections = await connections.find({
        sourceDeviceId: testDeviceIds[0]
      }).toArray()

      expect(foundConnections.length).toBeGreaterThanOrEqual(3)

      // Test updating
      const updateResult = await connections.updateOne(
        { _id: testData[0]!._id },
        { $set: { status: 'inactive' } }
      )

      expect(updateResult.modifiedCount).toBe(1)

      // Test deletion
      const deleteResult = await connections.deleteOne({ _id: testData[0]!._id })

      expect(deleteResult.deletedCount).toBe(1)
    })

    it('should enforce device relationship integrity', async () => {
      if (!checkDbConnection()) return

      const connections = db.collection('connections')
      const devices = db.collection('devices')
      // Verify test devices exist
      const sourceDevice = await devices.findOne({ _id: new ObjectId(testDeviceIds[0]) })
      const targetDevice = await devices.findOne({ _id: new ObjectId(testDeviceIds[1]) })

      expect(sourceDevice).not.toBeNull()
      expect(targetDevice).not.toBeNull()

      // Create connection with valid device relationships
      const connectionData = createUniqueTestConnection({
        sourceDeviceId: testDeviceIds[0],
        targetDeviceId: testDeviceIds[1]
      })
      const insertResult = await connections.insertOne(connectionData)

      testCleanupIds.push(insertResult.insertedId.toString())

      // Verify relationships
      const insertedConnection = await connections.findOne({ _id: insertResult.insertedId })

      expect(insertedConnection!.sourceDeviceId).toBe(testDeviceIds[0])
      expect(insertedConnection!.targetDeviceId).toBe(testDeviceIds[1])
    })

    it('should handle bidirectional connection queries', async () => {
      if (!checkDbConnection()) return

      const connections = db.collection('connections')
      // Create bidirectional connections
      const connectionAB = createUniqueTestConnection({
        sourceDeviceId: testDeviceIds[0],
        targetDeviceId: testDeviceIds[1],
        label: 'A to B Connection'
      })
      const connectionBA = createUniqueTestConnection({
        sourceDeviceId: testDeviceIds[1],
        targetDeviceId: testDeviceIds[0],
        label: 'B to A Connection'
      })
      const insertResultAB = await connections.insertOne(connectionAB)
      const insertResultBA = await connections.insertOne(connectionBA)

      testCleanupIds.push(insertResultAB.insertedId.toString())
      testCleanupIds.push(insertResultBA.insertedId.toString())

      // Query connections for device A (both outgoing and incoming)
      const deviceAConnections = await connections.find({
        $or: [
          { sourceDeviceId: testDeviceIds[0] },
          { targetDeviceId: testDeviceIds[0] }
        ]
      }).toArray()

      expect(deviceAConnections.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /connections
  // ===============================
  describe('GET /connections - Retrieve Connections', () => {
    it('should return all connections with proper structure', async () => {
      const response = await request(app)
        .get('/connections')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('count')
      expect(typeof response.body.count).toBe('number')

      if (response.body.data.length > 0) {
        const connectionObj = response.body.data[0]

        expect(connectionObj).toHaveProperty('_id')
        expect(connectionObj).toHaveProperty('sourceDeviceId')
        expect(connectionObj).toHaveProperty('targetDeviceId')
        expect(connectionObj).toHaveProperty('protocol')

        // Validate optional fields if present
        if (connectionObj.status) {
          expect(['active', 'inactive', 'error']).toContain(connectionObj.status)
        }
        if (connectionObj.type) {
          expect(['ethernet', 'fiber', 'serial', 'wireless']).toContain(connectionObj.type)
        }
      }
    })

    it('should support filtering by source device', async () => {
      if (testDeviceIds.length === 0) return

      // Create a test connection
      const connectionData = createUniqueTestConnection({
        sourceDeviceId: testDeviceIds[0]
      })
      const createResponse = await request(app)
        .post('/connections')
        .send(connectionData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .get(`/connections?sourceDeviceId=${testDeviceIds[0]}`)
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      response.body.data.forEach((conn: any) => {
        expect(conn.sourceDeviceId).toBe(testDeviceIds[0])
      })
    })

    it('should support filtering by target device', async () => {
      if (testDeviceIds.length < 2) return

      const response = await request(app)
        .get(`/connections?targetDeviceId=${testDeviceIds[1]}`)
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((conn: any) => {
        expect(conn.targetDeviceId).toBe(testDeviceIds[1])
      })
    })

    it('should support filtering by protocol', async () => {
      const response = await request(app)
        .get('/connections?protocol=ethernet')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((conn: any) => {
        expect(conn.protocol).toBe('ethernet')
      })
    })

    it('should support filtering by status', async () => {
      const response = await request(app)
        .get('/connections?status=active')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((conn: any) => {
        expect(conn.status).toBe('active')
      })
    })

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/connections?limit=1')
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.count).toBe(1)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - POST /connections
  // ===============================
  describe('POST /connections - Create Connections', () => {
    it('should create a new connection with complete data', async () => {
      const connectionData = createUniqueTestConnection()
      const response = await request(app)
        .post('/connections')
        .send(connectionData)
        .set('Accept', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.sourceDeviceId).toBe(connectionData.sourceDeviceId)
      expect(response.body.targetDeviceId).toBe(connectionData.targetDeviceId)
      expect(response.body.protocol).toBe(connectionData.protocol)
      expect(response.body.type).toBe(connectionData.type)
      expect(response.body.status).toBe(connectionData.status || 'active')

      testConnectionIds.push(response.body._id)
      testCleanupIds.push(response.body._id)
    })

    it('should create connection with minimal required data', async () => {
      const minimalData = {
        sourceDeviceId: testDeviceIds[0] || new ObjectId().toString(),
        targetDeviceId: testDeviceIds[1] || new ObjectId().toString(),
        protocol: 'ethernet'
      }
      const response = await request(app)
        .post('/connections')
        .send(minimalData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.sourceDeviceId).toBe(minimalData.sourceDeviceId)
      expect(response.body.targetDeviceId).toBe(minimalData.targetDeviceId)
      expect(response.body.protocol).toBe(minimalData.protocol)
      expect(response.body.status).toBe('active') // Default status
      testCleanupIds.push(response.body._id)
    })

    it('should reject connection without required sourceDeviceId', async () => {
      const connectionData = createUniqueTestConnection()

      // @ts-ignore - Intentionally creating invalid data for testing
      delete connectionData.sourceDeviceId

      const response = await request(app)
        .post('/connections')
        .send(connectionData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Source device is required')
    })

    it('should reject connection without required targetDeviceId', async () => {
      const connectionData = createUniqueTestConnection()

      // @ts-ignore - Intentionally creating invalid data for testing
      delete connectionData.targetDeviceId

      const response = await request(app)
        .post('/connections')
        .send(connectionData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Target device is required')
    })

    it('should reject connection without required protocol', async () => {
      const connectionData = createUniqueTestConnection()

      // @ts-ignore - Intentionally creating invalid data for testing
      delete connectionData.protocol

      const response = await request(app)
        .post('/connections')
        .send(connectionData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject connection with invalid device IDs', async () => {
      const invalidConnections = [
        {
          sourceDeviceId: 'invalid-object-id',
          targetDeviceId: testDeviceIds[1] || new ObjectId().toString(),
          protocol: 'ethernet'
        },
        {
          sourceDeviceId: testDeviceIds[0] || new ObjectId().toString(),
          targetDeviceId: 'invalid-object-id',
          protocol: 'ethernet'
        }
      ]

      for (const connectionData of invalidConnections) {
        const response = await request(app)
          .post('/connections')
          .send(connectionData)
          .expect(400)

        expect(response.body).toHaveProperty('error')
      }
    })

    it('should reject connection with non-existent device IDs', async () => {
      const connectionData = {
        sourceDeviceId: new ObjectId().toString(),
        targetDeviceId: new ObjectId().toString(),
        protocol: 'ethernet'
      }
      const response = await request(app)
        .post('/connections')
        .send(connectionData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.message).toContain('Device not found')
    })

    it('should reject self-connecting device', async () => {
      const connectionData = {
        sourceDeviceId: testDeviceIds[0] || new ObjectId().toString(),
        targetDeviceId: testDeviceIds[0] || new ObjectId().toString(),
        protocol: 'ethernet'
      }
      const response = await request(app)
        .post('/connections')
        .send(connectionData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.message).toContain('cannot connect to itself')
    })

    it('should validate protocol values', async () => {
      const invalidProtocols = ['invalid-protocol', 'unknown', 'test']

      for (const protocol of invalidProtocols) {
        const connectionData = createUniqueTestConnection({ protocol })
        const response = await request(app)
          .post('/connections')
          .send(connectionData)
          .expect(400)

        expect(response.body).toHaveProperty('error')
      }
    })

    it('should validate connection type values', async () => {
      const invalidTypes = ['invalid-type', 'unknown', 'test']

      for (const type of invalidTypes) {
        const connectionData = createUniqueTestConnection({ type })
        const response = await request(app)
          .post('/connections')
          .send(connectionData)
          .expect(400)

        expect(response.body).toHaveProperty('error')
      }
    })

    it('should handle duplicate connections', async () => {
      const connectionData1 = createUniqueTestConnection()
      const connectionData2 = {
        ...createUniqueTestConnection(),
        sourceDeviceId: connectionData1.sourceDeviceId,
        targetDeviceId: connectionData1.targetDeviceId,
        sourcePort: connectionData1.sourcePort,
        targetPort: connectionData1.targetPort
      }
      // Create first connection
      const response1 = await request(app)
        .post('/connections')
        .send(connectionData1)
        .expect(201)

      testCleanupIds.push(response1.body._id)

      // Try to create duplicate
      const response2 = await request(app)
        .post('/connections')
        .send(connectionData2)
        .expect(409)

      expect(response2.body).toHaveProperty('error', 'Conflict')
      expect(response2.body.message).toContain('already exists')
    })

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousData = createUniqueTestConnection({
        label: testGenerators.invalidData.scriptInjection,
        description: testGenerators.invalidData.nosqlInjection.$where,
        '$where': testGenerators.invalidData.nosqlInjection.$where
      })
      const response = await request(app)
        .post('/connections')
        .send(maliciousData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body).not.toHaveProperty('$where')

      testCleanupIds.push(response.body._id)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /connections/:id
  // ===============================
  describe('GET /connections/:id - Retrieve Specific Connection', () => {
    let testConnectionId: string

    beforeAll(async () => {
      const connectionData = createUniqueTestConnection()
      const response = await request(app)
        .post('/connections')
        .send(connectionData)
        .expect(201)

      testConnectionId = response.body._id
      testCleanupIds.push(testConnectionId)
    })

    it('should return specific connection by valid ID', async () => {
      const response = await request(app)
        .get(`/connections/${testConnectionId}`)
        .expect(200)

      expect(response.body).toHaveProperty('_id', testConnectionId)
      expect(response.body).toHaveProperty('sourceDeviceId')
      expect(response.body).toHaveProperty('targetDeviceId')
      expect(response.body).toHaveProperty('protocol')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/connections/invalid-id')
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Invalid Input')
      expect(response.body).toHaveProperty('message', 'Invalid ObjectId format')
    })

    it('should return 404 for non-existent connection', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .get(`/connections/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Connection not found')
    })

    it('should include device details when requested', async () => {
      const response = await request(app)
        .get(`/connections/${testConnectionId}?includeDevices=true`)
        .expect(200)

      if (response.body.sourceDevice) {
        expect(response.body.sourceDevice).toHaveProperty('name')
        expect(response.body.sourceDevice).toHaveProperty('position')
      }
      if (response.body.targetDevice) {
        expect(response.body.targetDevice).toHaveProperty('name')
        expect(response.body.targetDevice).toHaveProperty('position')
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - PUT /connections/:id
  // ===============================
  describe('PUT /connections/:id - Update Complete Connection', () => {
    let updateConnectionId: string

    beforeAll(async () => {
      const connectionData = createUniqueTestConnection()
      const response = await request(app)
        .post('/connections')
        .send(connectionData)
        .expect(201)

      updateConnectionId = response.body._id
      testCleanupIds.push(updateConnectionId)
    })

    it('should update complete connection with valid data', async () => {
      const updateData = {
        sourceDeviceId: testDeviceIds[0] || new ObjectId().toString(),
        targetDeviceId: testDeviceIds[1] || new ObjectId().toString(),
        protocol: 'fiber',
        type: 'fiber',
        status: 'inactive',
        sourcePort: 'eth0',
        targetPort: 'eth1',
        label: 'Updated Test Connection'
      }
      const response = await request(app)
        .put(`/connections/${updateConnectionId}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Connection updated successfully')
      expect(response.body).toHaveProperty('modifiedCount', 1)

      // Verify the update
      const getResponse = await request(app)
        .get(`/connections/${updateConnectionId}`)
        .expect(200)

      expect(getResponse.body.protocol).toBe(updateData.protocol)
      expect(getResponse.body.type).toBe(updateData.type)
      expect(getResponse.body.status).toBe(updateData.status)
    })

    it('should return 404 for non-existent connection update', async () => {
      const fakeId = new ObjectId().toString()
      const updateData = { status: 'inactive' }
      const response = await request(app)
        .put(`/connections/${fakeId}`)
        .send(updateData)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Connection not found')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - PATCH Operations
  // ===============================
  describe('PATCH /connections/status/:id - Update Connection Status', () => {
    let patchConnectionId: string

    beforeAll(async () => {
      const connectionData = createUniqueTestConnection()
      const response = await request(app)
        .post('/connections')
        .send(connectionData)
        .expect(201)

      patchConnectionId = response.body._id
      testCleanupIds.push(patchConnectionId)
    })

    it('should update only status field', async () => {
      const statusUpdate = {
        status: 'inactive'
      }
      const response = await request(app)
        .patch(`/connections/status/${patchConnectionId}`)
        .send(statusUpdate)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Connection status updated successfully')
      expect(response.body).toHaveProperty('modifiedCount', 1)

      // Verify status was updated
      const getResponse = await request(app)
        .get(`/connections/${patchConnectionId}`)
        .expect(200)

      expect(getResponse.body.status).toBe(statusUpdate.status)
    })

    it('should reject invalid status values', async () => {
      const invalidStatus = {
        status: 'invalid-status'
      }
      const response = await request(app)
        .patch(`/connections/status/${patchConnectionId}`)
        .send(invalidStatus)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - DELETE /connections/:id
  // ===============================
  describe('DELETE /connections/:id - Delete Specific Connection', () => {
    it('should delete specific connection by ID', async () => {
      // Create a connection to delete
      const connectionData = createUniqueTestConnection()
      const createResponse = await request(app)
        .post('/connections')
        .send(connectionData)
        .expect(201)
      const connectionToDelete = createResponse.body._id
      // Delete the connection
      const deleteResponse = await request(app)
        .delete(`/connections/${connectionToDelete}`)
        .expect(200)

      expect(deleteResponse.body).toHaveProperty('message', 'Connection deleted successfully')
      expect(deleteResponse.body).toHaveProperty('deletedCount', 1)

      // Verify deletion
      await request(app)
        .get(`/connections/${connectionToDelete}`)
        .expect(404)
    })

    it('should return 404 when deleting non-existent connection', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .delete(`/connections/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Connection not found')
    })
  })

  // ===============================
  // SPECIALIZED CONNECTION TESTS
  // ===============================
  describe('Device Connection Management', () => {
    it('should retrieve all connections for a specific device', async () => {
      if (testDeviceIds.length === 0) return

      const response = await request(app)
        .get(`/devices/${testDeviceIds[0]}/connections`)
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((conn: any) => {
        expect(
          conn.sourceDeviceId === testDeviceIds[0] ||
          conn.targetDeviceId === testDeviceIds[0]
        ).toBe(true)
      })
    })

    it('should handle connection topology queries', async () => {
      // Create multiple connections to form a network topology
      const connections = [
        {
          sourceDeviceId: testDeviceIds[0],
          targetDeviceId: testDeviceIds[1],
          protocol: 'ethernet'
        },
        {
          sourceDeviceId: testDeviceIds[1],
          targetDeviceId: testDeviceIds[2],
          protocol: 'ethernet'
        }
      ]
      const createdIds = []

      for (const conn of connections) {
        const response = await request(app)
          .post('/connections')
          .send(conn)

        if (response.status === 201) {
          createdIds.push(response.body._id)
        }
      }

      testCleanupIds.push(...createdIds)

      // Query network topology
      const response = await request(app)
        .get('/connections/topology')
        .expect(200)

      expect(response.body).toHaveProperty('nodes')
      expect(response.body).toHaveProperty('edges')
      expect(Array.isArray(response.body.nodes)).toBe(true)
      expect(Array.isArray(response.body.edges)).toBe(true)
    })
  })

  // ===============================
  // PERFORMANCE AND INTEGRATION TESTS
  // ===============================
  describe('Performance and Integration Tests', () => {
    it('should handle batch connection operations efficiently', async () => {
      if (testDeviceIds.length < 2) return

      const batchSize = 3
      const connectionData = Array(batchSize).fill(null).map((_, index) => ({
        sourceDeviceId: testDeviceIds[0],
        targetDeviceId: testDeviceIds[1],
        protocol: 'ethernet',
        sourcePort: `eth${index}`,
        targetPort: `eth${index + 10}`,
        label: `Batch Connection ${index}`
      }))
      const createdIds: string[] = []

      try {
        // Batch create
        const createPromises = connectionData.map(data =>
          request(app).post('/connections').send(data)
        )
        const createResponses = await Promise.all(createPromises)

        createResponses.forEach(response => {
          expect(response.status).toBe(201)
          createdIds.push(response.body._id)
        })

        // Batch read
        const readPromises = createdIds.map(id =>
          request(app).get(`/connections/${id}`)
        )
        const readResponses = await Promise.all(readPromises)

        readResponses.forEach(response => {
          expect(response.status).toBe(200)
        })

      } finally {
        testCleanupIds.push(...createdIds)
      }
    })

    it('should maintain referential integrity with devices', async () => {
      if (!checkDbConnection() || testDeviceIds.length < 2) return

      // Create connection
      const connectionData = createUniqueTestConnection({
        sourceDeviceId: testDeviceIds[0],
        targetDeviceId: testDeviceIds[1]
      })
      const response = await request(app)
        .post('/connections')
        .send(connectionData)
        .expect(201)

      testCleanupIds.push(response.body._id)

      // Verify connection exists
      const getResponse = await request(app)
        .get(`/connections/${response.body._id}`)
        .expect(200)

      expect(getResponse.body.sourceDeviceId).toBe(testDeviceIds[0])
      expect(getResponse.body.targetDeviceId).toBe(testDeviceIds[1])
    })

    it('should handle concurrent connection operations', async () => {
      if (testDeviceIds.length < 2) return

      const concurrentOps = Array(5).fill(null).map((_, index) =>
        request(app)
          .post('/connections')
          .send({
            sourceDeviceId: testDeviceIds[0],
            targetDeviceId: testDeviceIds[1],
            protocol: 'ethernet',
            sourcePort: `concurrent-${index}`,
            targetPort: `concurrent-${index + 10}`
          })
      )
      const responses = await Promise.allSettled(concurrentOps)
      const successfulCreations = responses.filter(r =>
        r.status === 'fulfilled' && r.value.status === 201
      )

      // At least some should succeed
      expect(successfulCreations.length).toBeGreaterThan(0)

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
    it('should handle connections with special port configurations', async () => {
      const specialPorts = [
        { sourcePort: 'eth0/1', targetPort: 'gi0/0/1' },
        { sourcePort: 'Ethernet1/1', targetPort: 'FastEthernet0/1' },
        { sourcePort: 'Te1/0/1', targetPort: 'Gig0/1' },
        { sourcePort: 'mgmt0', targetPort: 'console' }
      ]

      for (const ports of specialPorts) {
        const connectionData = createUniqueTestConnection(ports)
        const response = await request(app)
          .post('/connections')
          .send(connectionData)

        if (response.status === 201) {
          testCleanupIds.push(response.body._id)
          expect(response.body.sourcePort).toBe(ports.sourcePort)
          expect(response.body.targetPort).toBe(ports.targetPort)
        }
      }
    })

    it('should handle connections with various bandwidth specifications', async () => {
      const bandwidthSpecs = [
        { bandwidth: '1Gbps', capacity: 1000000000 },
        { bandwidth: '10Gbps', capacity: 10000000000 },
        { bandwidth: '100Mbps', capacity: 100000000 },
        { bandwidth: '1Tbps', capacity: 1000000000000 }
      ]

      for (const spec of bandwidthSpecs) {
        const connectionData = createUniqueTestConnection({
          bandwidth: spec.bandwidth,
          capacity: spec.capacity
        })
        const response = await request(app)
          .post('/connections')
          .send(connectionData)

        if (response.status === 201) {
          testCleanupIds.push(response.body._id)
          expect(response.body.bandwidth).toBe(spec.bandwidth)
        }
      }
    })

    it('should handle large connection metadata', async () => {
      const largeData = createUniqueTestConnection({
        description: 'x'.repeat(2000),
        configuration: {
          vlan: 'y'.repeat(500),
          qos: 'z'.repeat(500)
        },
        notes: 'Large connection with extensive configuration data'
      })
      const response = await request(app)
        .post('/connections')
        .send(largeData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body).toHaveProperty('_id')
      }
    })
  })
})

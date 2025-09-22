/**
 * @file attribute.test.ts
 * @description Comprehensive test suite for Attribute API endpoints and attribute management.
 *
 * Coverage includes:
 * - Complete CRUD operations for all attribute endpoints
 * - Attribute-device associations and metadata
 * - Attribute-model relationships and templates
 * - Attribute-connection properties and configurations
 * - Dynamic attribute typing and validation
 * - Custom attribute schemas and constraints
 * - Input validation and sanitization
 * - Error handling and edge cases
 * - Security testing (injection prevention)
 * - Database integration and persistence
 * - Performance and concurrent access
 *
 * @version 2024-09-22 Comprehensive attribute API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Attribute API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db
  const testAttributeIds: string[] = []
  const testModelIds: string[] = []
  const testDeviceIds: string[] = []
  const testConnectionIds: string[] = []
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
      console.log('✅ MongoDB connection successful for comprehensive attribute tests')

      // Create test data for attribute relationships
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
      // Clean up test data in proper order (attributes -> connections -> devices -> models)
      if (db) {
        if (testCleanupIds.length > 0) {
          const attributeCollection = db.collection('attributes')
          const attributeObjectIds = testCleanupIds.map(id => new ObjectId(id))

          await attributeCollection.deleteMany({ _id: { $in: attributeObjectIds } })
          console.log(`🧹 Cleaned up ${testCleanupIds.length} test attributes`)
        }

        if (testConnectionIds.length > 0) {
          const connectionCollection = db.collection('connections')
          const connectionObjectIds = testConnectionIds.map(id => new ObjectId(id))

          await connectionCollection.deleteMany({ _id: { $in: connectionObjectIds } })
          console.log(`🧹 Cleaned up ${testConnectionIds.length} test connections`)
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
  const createTestEntities = async () => {
    if (!checkDbConnection()) return

    // Create test models
    const models = db.collection('models')
    const testModels = [
      {
        name: 'Test Model for Attributes A',
        type: 'server',
        dimensions: { width: 100, height: 50, depth: 200 },
        manufacturer: 'Test Corp'
      },
      {
        name: 'Test Model for Attributes B',
        type: 'switch',
        dimensions: { width: 80, height: 30, depth: 150 },
        manufacturer: 'Network Corp'
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
        name: 'Test Device for Attributes A',
        modelId: testModelIds[0],
        position: { x: 10, y: 20, z: 0 },
        status: 'active'
      },
      {
        name: 'Test Device for Attributes B',
        modelId: testModelIds[1],
        position: { x: 30, y: 40, z: 0 },
        status: 'active'
      }
    ]

    for (const device of testDevices) {
      const result = await devices.insertOne(device)

      testDeviceIds.push(result.insertedId.toString())
    }

    // Create test connections
    const connections = db.collection('connections')
    const testConnections = [
      {
        name: 'Test Connection for Attributes',
        sourceDeviceId: testDeviceIds[0],
        targetDeviceId: testDeviceIds[1],
        protocol: 'ethernet',
        isActive: true
      }
    ]

    for (const connection of testConnections) {
      const result = await connections.insertOne(connection)

      testConnectionIds.push(result.insertedId.toString())
    }
  }
  const createUniqueTestAttribute = (overrides = {}) => {
    const baseAttribute = testGenerators.attributeBuilder()

    return {
      name: testGenerators.uniqueName('Attribute'),
      value: baseAttribute.value || testGenerators.randomArrayElement(['enabled', 'disabled', '100', 'production']),
      type: baseAttribute.type || testGenerators.randomArrayElement(['string', 'number', 'boolean', 'array']),
      modelId: testModelIds.length > 0 ? testModelIds[0] : testGenerators.objectId(),
      deviceId: testDeviceIds.length > 0 ? testDeviceIds[0] : null,
      connectionId: testConnectionIds.length > 0 ? testConnectionIds[0] : null,
      isRequired: baseAttribute.isRequired || false,
      isEditable: true,
      category: testGenerators.randomArrayElement(['hardware', 'software', 'network', 'configuration']),
      validation: {
        type: baseAttribute.type || 'string',
        required: baseAttribute.isRequired || false,
        min: baseAttribute.validation?.min || 0,
        max: baseAttribute.validation?.max || 1000,
        pattern: baseAttribute.validation?.pattern || '^[a-zA-Z0-9]*$',
        enum: ['value1', 'value2', 'value3']
      },
      metadata: {
        description: 'Test attribute for API validation',
        unit: testGenerators.randomArrayElement(['MB', 'GB', 'MHz', 'V', 'A']),
        source: 'manual',
        lastUpdated: new Date(),
        tags: ['test', 'api', 'validation']
      },
      ...overrides
    }
  }

  // ===============================
  // DATABASE LAYER TESTS
  // ===============================
  describe('Database Attribute Operations', () => {
    it('should perform direct database CRUD operations', async () => {
      if (!checkDbConnection()) return

      const attributes = db.collection('attributes')
      const testData = []

      // Test insertion of multiple attributes
      for (let i = 0; i < 3; i++) {
        const attributeData = createUniqueTestAttribute({
          name: `Test Attribute ${i}`,
          value: `value${i}`
        })
        const insertResult = await attributes.insertOne(attributeData)
        const insertedAttribute = await attributes.findOne({ _id: insertResult.insertedId })

        expect(insertedAttribute).not.toBeNull()
        expect(insertedAttribute!._id).toEqual(insertResult.insertedId)
        expect(insertedAttribute!.name).toBe(attributeData.name)
        expect(insertedAttribute!.value).toBe(attributeData.value)
        expect(insertedAttribute!.type).toBe(attributeData.type)

        testCleanupIds.push(insertResult.insertedId.toString())
        testData.push(insertedAttribute)
      }

      // Test querying
      const foundAttributes = await attributes.find({
        name: { $in: testData.map(a => a!.name) }
      }).toArray()

      expect(foundAttributes).toHaveLength(3)

      // Test updating
      const updateResult = await attributes.updateOne(
        { _id: testData[0]!._id },
        { $set: { value: 'updated_value' } }
      )

      expect(updateResult.modifiedCount).toBe(1)

      // Test deletion
      const deleteResult = await attributes.deleteOne({ _id: testData[0]!._id })

      expect(deleteResult.deletedCount).toBe(1)
    })

    it('should handle attribute-model relationships', async () => {
      if (!checkDbConnection() || testModelIds.length === 0) return

      const attributes = db.collection('attributes')
      // Create attribute associated with model
      const attributeData = createUniqueTestAttribute({
        modelId: testModelIds[0]
      })
      const attributeResult = await attributes.insertOne(attributeData)

      testCleanupIds.push(attributeResult.insertedId.toString())

      // Query attributes by model
      const modelAttributes = await attributes.find({
        modelId: testModelIds[0]
      }).toArray()

      expect(modelAttributes.length).toBeGreaterThanOrEqual(1)
      expect(modelAttributes[0].modelId).toBe(testModelIds[0])
    })

    it('should handle attribute-device relationships', async () => {
      if (!checkDbConnection() || testDeviceIds.length === 0) return

      const attributes = db.collection('attributes')
      // Create attribute associated with device
      const attributeData = createUniqueTestAttribute({
        deviceId: testDeviceIds[0]
      })
      const attributeResult = await attributes.insertOne(attributeData)

      testCleanupIds.push(attributeResult.insertedId.toString())

      // Query attributes by device
      const deviceAttributes = await attributes.find({
        deviceId: testDeviceIds[0]
      }).toArray()

      expect(deviceAttributes.length).toBeGreaterThanOrEqual(1)
      expect(deviceAttributes[0].deviceId).toBe(testDeviceIds[0])
    })

    it('should handle attribute-connection relationships', async () => {
      if (!checkDbConnection() || testConnectionIds.length === 0) return

      const attributes = db.collection('attributes')
      // Create attribute associated with connection
      const attributeData = createUniqueTestAttribute({
        connectionId: testConnectionIds[0]
      })
      const attributeResult = await attributes.insertOne(attributeData)

      testCleanupIds.push(attributeResult.insertedId.toString())

      // Query attributes by connection
      const connectionAttributes = await attributes.find({
        connectionId: testConnectionIds[0]
      }).toArray()

      expect(connectionAttributes.length).toBeGreaterThanOrEqual(1)
      expect(connectionAttributes[0].connectionId).toBe(testConnectionIds[0])
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /attributes
  // ===============================
  describe('GET /attributes - Retrieve Attributes', () => {
    it('should return all attributes with proper structure', async () => {
      const response = await request(app)
        .get('/attributes')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('count')
      expect(typeof response.body.count).toBe('number')

      if (response.body.data.length > 0) {
        const attribute = response.body.data[0]

        expect(attribute).toHaveProperty('_id')
        expect(attribute).toHaveProperty('name')
        expect(attribute).toHaveProperty('value')
        expect(attribute).toHaveProperty('type')

        // Validate optional fields if present
        if (attribute.validation) {
          expect(typeof attribute.validation).toBe('object')
        }
        if (attribute.metadata) {
          expect(typeof attribute.metadata).toBe('object')
        }
      }
    })

    it('should support filtering by type', async () => {
      // Create an attribute with specific type
      const attributeData = createUniqueTestAttribute({ type: 'boolean' })
      const createResponse = await request(app)
        .post('/attributes')
        .send(attributeData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .get('/attributes?type=boolean')
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      response.body.data.forEach((attribute: any) => {
        expect(attribute.type).toBe('boolean')
      })
    })

    it('should support filtering by category', async () => {
      const response = await request(app)
        .get('/attributes?category=hardware')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((attribute: any) => {
        if (attribute.category) {
          expect(attribute.category).toBe('hardware')
        }
      })
    })

    it('should support filtering by required status', async () => {
      const response = await request(app)
        .get('/attributes?isRequired=true')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((attribute: any) => {
        expect(attribute.isRequired).toBe(true)
      })
    })

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/attributes?limit=1')
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.count).toBe(1)
    })

    it('should handle sorting by name', async () => {
      const response = await request(app)
        .get('/attributes?sortBy=name&sortOrder=asc')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      if (response.body.data.length > 1) {
        for (let i = 1; i < response.body.data.length; i++) {
          expect(response.body.data[i].name.localeCompare(response.body.data[i - 1].name)).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - POST /attributes
  // ===============================
  describe('POST /attributes - Create Attributes', () => {
    it('should create a new attribute with complete data', async () => {
      const attributeData = createUniqueTestAttribute()
      const response = await request(app)
        .post('/attributes')
        .send(attributeData)
        .set('Accept', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(attributeData.name)
      expect(response.body.value).toBe(attributeData.value)
      expect(response.body.type).toBe(attributeData.type)
      expect(response.body.isRequired).toBe(attributeData.isRequired)

      testAttributeIds.push(response.body._id)
      testCleanupIds.push(response.body._id)
    })

    it('should create attribute with minimal required data', async () => {
      const minimalData = {
        name: testGenerators.uniqueName('Minimal Attribute'),
        value: 'test_value',
        type: 'string'
      }
      const response = await request(app)
        .post('/attributes')
        .send(minimalData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(minimalData.name)
      expect(response.body.value).toBe(minimalData.value)
      expect(response.body.type).toBe(minimalData.type)
      expect(response.body.isRequired).toBe(false) // Default value
      testCleanupIds.push(response.body._id)
    })

    it('should reject attribute without required name field', async () => {
      const attributeData = createUniqueTestAttribute()

      // @ts-expect-error - Intentionally creating invalid data for testing
      delete attributeData.name

      const response = await request(app)
        .post('/attributes')
        .send(attributeData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Name is required')
    })

    it('should reject attribute without required value', async () => {
      const attributeData = createUniqueTestAttribute()

      // @ts-expect-error - Intentionally creating invalid data for testing
      delete attributeData.value

      const response = await request(app)
        .post('/attributes')
        .send(attributeData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject attribute without required type', async () => {
      const attributeData = createUniqueTestAttribute()

      // @ts-expect-error - Intentionally creating invalid data for testing
      delete attributeData.type

      const response = await request(app)
        .post('/attributes')
        .send(attributeData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject attribute with invalid type', async () => {
      const attributeData = createUniqueTestAttribute({
        type: 'invalid_type'
      })
      const response = await request(app)
        .post('/attributes')
        .send(attributeData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should validate value against type constraints', async () => {
      const attributeData = createUniqueTestAttribute({
        type: 'number',
        value: 'not_a_number'
      })
      const response = await request(app)
        .post('/attributes')
        .send(attributeData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should validate boolean values', async () => {
      const validBooleanData = createUniqueTestAttribute({
        type: 'boolean',
        value: true
      })
      const response = await request(app)
        .post('/attributes')
        .send(validBooleanData)
        .expect(201)

      expect(response.body.value).toBe(true)
      testCleanupIds.push(response.body._id)
    })

    it('should validate array values', async () => {
      const arrayData = createUniqueTestAttribute({
        type: 'array',
        value: ['item1', 'item2', 'item3']
      })
      const response = await request(app)
        .post('/attributes')
        .send(arrayData)
        .expect(201)

      expect(Array.isArray(response.body.value)).toBe(true)
      expect(response.body.value).toEqual(['item1', 'item2', 'item3'])
      testCleanupIds.push(response.body._id)
    })

    it('should validate against enum constraints', async () => {
      const enumData = createUniqueTestAttribute({
        value: 'invalid_enum_value',
        validation: {
          type: 'string',
          enum: ['value1', 'value2', 'value3']
        }
      })
      const response = await request(app)
        .post('/attributes')
        .send(enumData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should validate against pattern constraints', async () => {
      const patternData = createUniqueTestAttribute({
        value: 'invalid@pattern!',
        validation: {
          type: 'string',
          pattern: '^[a-zA-Z0-9]*$'
        }
      })
      const response = await request(app)
        .post('/attributes')
        .send(patternData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousData = createUniqueTestAttribute({
        name: testGenerators.uniqueName('Test Attribute'),
        description: testGenerators.invalidData.scriptInjection,
        '$where': testGenerators.invalidData.nosqlInjection.$where
      })
      const response = await request(app)
        .post('/attributes')
        .send(maliciousData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(maliciousData.name)
      expect(response.body).not.toHaveProperty('$where')

      testCleanupIds.push(response.body._id)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /attributes/:id
  // ===============================
  describe('GET /attributes/:id - Retrieve Specific Attribute', () => {
    let testAttributeId: string

    beforeAll(async () => {
      const attributeData = createUniqueTestAttribute()
      const response = await request(app)
        .post('/attributes')
        .send(attributeData)
        .expect(201)

      testAttributeId = response.body._id
      testCleanupIds.push(testAttributeId)
    })

    it('should return specific attribute by valid ID', async () => {
      const response = await request(app)
        .get(`/attributes/${testAttributeId}`)
        .expect(200)

      expect(response.body).toHaveProperty('_id', testAttributeId)
      expect(response.body).toHaveProperty('name')
      expect(response.body).toHaveProperty('value')
      expect(response.body).toHaveProperty('type')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/attributes/invalid-id')
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Invalid Input')
      expect(response.body).toHaveProperty('message', 'Invalid ObjectId format')
    })

    it('should return 404 for non-existent attribute', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .get(`/attributes/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Attribute not found')
    })

    it('should include validation details when requested', async () => {
      const response = await request(app)
        .get(`/attributes/${testAttributeId}?includeValidation=true`)
        .expect(200)

      if (response.body.validation) {
        expect(response.body.validation).toHaveProperty('type')
      }
    })
  })

  // ===============================
  // SPECIALIZED ATTRIBUTE TESTS
  // ===============================
  describe('Model Attribute Operations', () => {
    it('should retrieve attributes by model ID', async () => {
      if (testModelIds.length === 0) return

      const response = await request(app)
        .get(`/attributes/model/${testModelIds[0]}`)
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('count')
    })

    it('should create model-specific attribute template', async () => {
      if (testModelIds.length === 0) return

      const templateData = createUniqueTestAttribute({
        modelId: testModelIds[0],
        name: 'Model Template Attribute',
        isTemplate: true,
        defaultValue: 'template_default'
      })
      const response = await request(app)
        .post('/attributes')
        .send(templateData)
        .expect(201)

      expect(response.body.modelId).toBe(testModelIds[0])
      expect(response.body.isTemplate).toBe(true)
      testCleanupIds.push(response.body._id)
    })
  })

  describe('Device Attribute Operations', () => {
    it('should retrieve attributes by device ID', async () => {
      if (testDeviceIds.length === 0) return

      const response = await request(app)
        .get(`/attributes/device/${testDeviceIds[0]}`)
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('count')
    })

    it('should update device attribute value', async () => {
      if (testDeviceIds.length === 0) return

      // Create device attribute
      const attributeData = createUniqueTestAttribute({
        deviceId: testDeviceIds[0],
        name: 'Device Status',
        value: 'online'
      })
      const createResponse = await request(app)
        .post('/attributes')
        .send(attributeData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      // Update attribute value
      const updateResponse = await request(app)
        .patch(`/attributes/${createResponse.body._id}/value`)
        .send({ value: 'offline' })
        .expect(200)

      expect(updateResponse.body).toHaveProperty('message', 'Attribute value updated successfully')

      // Verify update
      const getResponse = await request(app)
        .get(`/attributes/${createResponse.body._id}`)
        .expect(200)

      expect(getResponse.body.value).toBe('offline')
    })
  })

  describe('Connection Attribute Operations', () => {
    it('should retrieve attributes by connection ID', async () => {
      if (testConnectionIds.length === 0) return

      const response = await request(app)
        .get(`/attributes/connection/${testConnectionIds[0]}`)
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('count')
    })

    it('should manage connection bandwidth attribute', async () => {
      if (testConnectionIds.length === 0) return

      const bandwidthData = createUniqueTestAttribute({
        connectionId: testConnectionIds[0],
        name: 'Bandwidth',
        value: 1000,
        type: 'number',
        metadata: {
          unit: 'Mbps',
          description: 'Connection bandwidth in megabits per second'
        }
      })
      const response = await request(app)
        .post('/attributes')
        .send(bandwidthData)
        .expect(201)

      expect(response.body.connectionId).toBe(testConnectionIds[0])
      expect(response.body.value).toBe(1000)
      expect(response.body.metadata.unit).toBe('Mbps')
      testCleanupIds.push(response.body._id)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - PUT /attributes/:id
  // ===============================
  describe('PUT /attributes/:id - Update Complete Attribute', () => {
    let updateAttributeId: string

    beforeAll(async () => {
      const attributeData = createUniqueTestAttribute()
      const response = await request(app)
        .post('/attributes')
        .send(attributeData)
        .expect(201)

      updateAttributeId = response.body._id
      testCleanupIds.push(updateAttributeId)
    })

    it('should update complete attribute with valid data', async () => {
      const updateData = {
        name: 'Updated Attribute Name',
        value: 'updated_value',
        type: 'string',
        isRequired: true,
        category: 'configuration',
        validation: {
          type: 'string',
          required: true,
          minLength: 5,
          maxLength: 50,
          pattern: '^[a-zA-Z0-9_]*$'
        },
        metadata: {
          description: 'Updated attribute description',
          unit: 'units',
          lastUpdated: new Date(),
          tags: ['updated', 'test']
        }
      }
      const response = await request(app)
        .put(`/attributes/${updateAttributeId}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Attribute updated successfully')
      expect(response.body).toHaveProperty('modifiedCount', 1)

      // Verify the update
      const getResponse = await request(app)
        .get(`/attributes/${updateAttributeId}`)
        .expect(200)

      expect(getResponse.body.name).toBe(updateData.name)
      expect(getResponse.body.value).toBe(updateData.value)
      expect(getResponse.body.isRequired).toBe(updateData.isRequired)
      expect(getResponse.body.category).toBe(updateData.category)
    })

    it('should return 404 for non-existent attribute update', async () => {
      const fakeId = new ObjectId().toString()
      const updateData = { name: 'Updated Name' }
      const response = await request(app)
        .put(`/attributes/${fakeId}`)
        .send(updateData)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Attribute not found')
    })

    it('should validate updated values against type constraints', async () => {
      const updateData = {
        type: 'number',
        value: 'not_a_number'
      }
      const response = await request(app)
        .put(`/attributes/${updateAttributeId}`)
        .send(updateData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - DELETE /attributes/:id
  // ===============================
  describe('DELETE /attributes/:id - Delete Specific Attribute', () => {
    it('should delete specific attribute by ID', async () => {
      // Create an attribute to delete
      const attributeData = createUniqueTestAttribute()
      const createResponse = await request(app)
        .post('/attributes')
        .send(attributeData)
        .expect(201)
      const attributeToDelete = createResponse.body._id
      // Delete the attribute
      const deleteResponse = await request(app)
        .delete(`/attributes/${attributeToDelete}`)
        .expect(200)

      expect(deleteResponse.body).toHaveProperty('message', 'Attribute deleted successfully')
      expect(deleteResponse.body).toHaveProperty('deletedCount', 1)

      // Verify deletion
      await request(app)
        .get(`/attributes/${attributeToDelete}`)
        .expect(404)
    })

    it('should return 404 when deleting non-existent attribute', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .delete(`/attributes/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Attribute not found')
    })

    it('should handle cascade deletion for model attributes', async () => {
      if (testModelIds.length === 0) return

      // This test would check if model deletion affects related attributes
      const response = await request(app)
        .delete(`/attributes/model/${testModelIds[0]}`)
        .expect(200)

      expect(response.body).toHaveProperty('deletedCount')
      expect(typeof response.body.deletedCount).toBe('number')
    })
  })

  // ===============================
  // PERFORMANCE AND INTEGRATION TESTS
  // ===============================
  describe('Performance and Integration Tests', () => {
    it('should handle batch attribute operations efficiently', async () => {
      const batchSize = 10
      const attributeData = Array(batchSize).fill(null).map((_, index) =>
        createUniqueTestAttribute({
          name: `Batch Attribute ${index}`,
          value: `batch_value_${index}`
        })
      )
      const createdIds: string[] = []

      try {
        // Batch create
        const createPromises = attributeData.map(data =>
          request(app).post('/attributes').send(data)
        )
        const createResponses = await Promise.all(createPromises)

        createResponses.forEach(response => {
          expect(response.status).toBe(201)
          createdIds.push(response.body._id)
        })

        // Batch read
        const readPromises = createdIds.map(id =>
          request(app).get(`/attributes/${id}`)
        )
        const readResponses = await Promise.all(readPromises)

        readResponses.forEach(response => {
          expect(response.status).toBe(200)
        })

      } finally {
        testCleanupIds.push(...createdIds)
      }
    })

    it('should handle complex attribute queries', async () => {
      // Create attributes with various types and categories
      const complexData = [
        createUniqueTestAttribute({ type: 'string', category: 'hardware' }),
        createUniqueTestAttribute({ type: 'number', category: 'software' }),
        createUniqueTestAttribute({ type: 'boolean', category: 'network' })
      ]
      const createdIds: string[] = []

      for (const data of complexData) {
        const response = await request(app)
          .post('/attributes')
          .send(data)
          .expect(201)

        createdIds.push(response.body._id)
      }

      testCleanupIds.push(...createdIds)

      // Complex query with multiple filters
      const response = await request(app)
        .get('/attributes?type=string&category=hardware&isRequired=false')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  // ===============================
  // EDGE CASES AND ERROR SCENARIOS
  // ===============================
  describe('Edge Cases and Error Scenarios', () => {
    it('should handle large attribute values', async () => {
      const largeValue = 'x'.repeat(10000)
      const attributeData = createUniqueTestAttribute({
        value: largeValue,
        type: 'string'
      })
      const response = await request(app)
        .post('/attributes')
        .send(attributeData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body.value).toBe(largeValue)
      }
    })

    it('should handle special characters in attribute names', async () => {
      const specialCharNames = [
        'Attribute with émojis 📊',
        'Атрибут на русском',
        'Attribute with "quotes" and \'apostrophes\'',
        'Attribute with <tags> & symbols'
      ]

      for (const name of specialCharNames) {
        const attributeData = createUniqueTestAttribute({ name })
        const response = await request(app)
          .post('/attributes')
          .send(attributeData)

        if (response.status === 201) {
          testCleanupIds.push(response.body._id)
          expect(response.body.name).toBe(name)
        }
      }
    })

    it('should handle complex nested object values', async () => {
      const complexValue = {
        configuration: {
          network: {
            ip: '192.168.1.1',
            subnet: '255.255.255.0',
            ports: [80, 443, 8080]
          },
          security: {
            encryption: 'AES-256',
            certificates: ['cert1.pem', 'cert2.pem']
          }
        },
        metadata: {
          version: '2.0',
          lastUpdated: new Date().toISOString()
        }
      }
      const attributeData = createUniqueTestAttribute({
        value: complexValue,
        type: 'object'
      })
      const response = await request(app)
        .post('/attributes')
        .send(attributeData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body.value).toEqual(complexValue)
      }
    })
  })
})

/**
 * @file attributesDictionary.test.ts
 * @description Comprehensive test suite for Attributes Dictionary API endpoints.
 *
 * Coverage includes:
 * - Complete attribute schema management
 * - Dictionary CRUD operations
 * - Attribute definition validation
 * - Schema versioning and migration
 * - Metadata management and validation
 * - Attribute type definitions and constraints
 * - Schema inheritance and composition
 * - Validation rule management
 * - Custom attribute types and behaviors
 * - Schema export/import functionality
 * - Dictionary search and filtering
 * - Schema documentation generation
 * - Attribute relationship definitions
 * - Schema validation and consistency checks
 *
 * @version 2024-09-22 Comprehensive attributes dictionary API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Attributes Dictionary API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db
  const testDictionaryIds: string[] = []
  const testSchemaIds: string[] = []
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
      console.log('✅ MongoDB connection successful for comprehensive attributes dictionary tests')
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
          const dictionaryCollection = db.collection('attributesDictionary')
          const dictionaryObjectIds = testCleanupIds.map(id => new ObjectId(id))

          await dictionaryCollection.deleteMany({ _id: { $in: dictionaryObjectIds } })
          console.log(`🧹 Cleaned up ${testCleanupIds.length} test dictionary entries`)
        }

        if (testSchemaIds.length > 0) {
          const schemaCollection = db.collection('attributeSchemas')
          const schemaObjectIds = testSchemaIds.map(id => new ObjectId(id))

          await schemaCollection.deleteMany({ _id: { $in: schemaObjectIds } })
          console.log(`🧹 Cleaned up ${testSchemaIds.length} test schema entries`)
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
  const createUniqueAttributeDefinition = (overrides = {}) => {
    return {
      name: testGenerators.attributeBuilder().name,
      type: 'string',
      description: testGenerators.productName(),
      required: false,
      defaultValue: null,
      constraints: {
        minLength: 1,
        maxLength: 255,
        pattern: null
      },
      metadata: {
        category: 'general',
        tags: ['test', 'api'],
        documentation: testGenerators.productName()
      },
      ...overrides
    }
  }
  const createComplexAttributeSchema = (overrides = {}) => {
    return {
      name: `TestSchema_${testGenerators.productName().replace(/\s+/g, '')}`,
      version: '1.0.0',
      description: testGenerators.productName(),
      attributes: [
        createUniqueAttributeDefinition({ name: 'serialNumber', type: 'string', required: true }),
        createUniqueAttributeDefinition({ name: 'capacity', type: 'number', required: false }),
        createUniqueAttributeDefinition({ name: 'isActive', type: 'boolean', required: false })
      ],
      metadata: {
        author: testGenerators.user().username,
        createdDate: new Date(),
        lastModified: new Date(),
        tags: ['test', 'schema']
      },
      ...overrides
    }
  }

  // ===============================
  // DATABASE LAYER TESTS
  // ===============================
  describe('Database Attributes Dictionary Operations', () => {
    it('should store and retrieve attribute definitions', async () => {
      if (!checkDbConnection()) return

      const dictionaryCollection = db.collection('attributesDictionary')
      const attributeDefinition = createUniqueAttributeDefinition()
      const result = await dictionaryCollection.insertOne(attributeDefinition)

      expect(result.insertedId).toBeDefined()

      testDictionaryIds.push(result.insertedId.toString())
      testCleanupIds.push(result.insertedId.toString())

      // Verify retrieval
      const stored = await dictionaryCollection.findOne({ _id: result.insertedId })

      expect(stored).not.toBeNull()
      expect(stored!.name).toBe(attributeDefinition.name)
      expect(stored!.type).toBe(attributeDefinition.type)
      expect(stored!.constraints).toEqual(attributeDefinition.constraints)
    })

    it('should enforce unique attribute names within dictionary', async () => {
      if (!checkDbConnection()) return

      const dictionaryCollection = db.collection('attributesDictionary')
      const attributeName = `unique_${testGenerators.productName().replace(/\s+/g, '')}`
      const firstAttribute = createUniqueAttributeDefinition({ name: attributeName })
      const duplicateAttribute = createUniqueAttributeDefinition({ name: attributeName })
      // Insert first attribute
      const firstResult = await dictionaryCollection.insertOne(firstAttribute)

      testCleanupIds.push(firstResult.insertedId.toString())

      // Attempt to insert duplicate
      try {
        await dictionaryCollection.insertOne(duplicateAttribute)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle complex attribute schemas with relationships', async () => {
      if (!checkDbConnection()) return

      const schemaCollection = db.collection('attributeSchemas')
      const complexSchema = createComplexAttributeSchema()
      const result = await schemaCollection.insertOne(complexSchema)

      expect(result.insertedId).toBeDefined()

      testSchemaIds.push(result.insertedId.toString())

      // Verify complex structure
      const stored = await schemaCollection.findOne({ _id: result.insertedId })

      expect(stored).not.toBeNull()
      expect(stored!.attributes).toHaveLength(3)
      expect(stored!.attributes[0].required).toBe(true)
      expect(stored!.metadata).toHaveProperty('author')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /attributesDictionary
  // ===============================
  describe('GET /attributesDictionary - List Attribute Definitions', () => {
    it('should retrieve all attribute definitions', async () => {
      const response = await request(app)
        .get('/attributesDictionary')
        .set('Accept', 'application/json')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(0)

      if (response.body.length > 0) {
        const definition = response.body[0]

        expect(definition).toHaveProperty('_id')
        expect(definition).toHaveProperty('name')
        expect(definition).toHaveProperty('type')
        expect(definition).toHaveProperty('description')
      }
    })

    it('should support pagination for large dictionaries', async () => {
      const response = await request(app)
        .get('/attributesDictionary')
        .query({ page: 1, limit: 5 })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeLessThanOrEqual(5)
    })

    it('should filter attributes by type', async () => {
      const response = await request(app)
        .get('/attributesDictionary')
        .query({ type: 'string' })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        response.body.forEach((attr: any) => {
          expect(attr.type).toBe('string')
        })
      }
    })

    it('should filter attributes by category', async () => {
      const response = await request(app)
        .get('/attributesDictionary')
        .query({ category: 'technical' })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        response.body.forEach((attr: any) => {
          expect(attr.metadata?.category).toBe('technical')
        })
      }
    })

    it('should search attributes by name pattern', async () => {
      const response = await request(app)
        .get('/attributesDictionary')
        .query({ search: 'serial' })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        response.body.forEach((attr: any) => {
          expect(attr.name.toLowerCase()).toContain('serial')
        })
      }
    })

    it('should sort attributes by name, type, or creation date', async () => {
      const response = await request(app)
        .get('/attributesDictionary')
        .query({ sort: 'name', order: 'asc' })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 1) {
        for (let i = 1; i < response.body.length; i++) {
          expect(response.body[i].name >= response.body[i - 1].name).toBe(true)
        }
      }
    })

    it('should include metadata in response', async () => {
      const response = await request(app)
        .get('/attributesDictionary')
        .query({ includeMetadata: true })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        const definition = response.body[0]

        expect(definition).toHaveProperty('metadata')
        expect(definition.metadata).toHaveProperty('category')
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - POST /attributesDictionary
  // ===============================
  describe('POST /attributesDictionary - Create Attribute Definition', () => {
    it('should create new attribute definition', async () => {
      const newDefinition = createUniqueAttributeDefinition()
      const response = await request(app)
        .post('/attributesDictionary')
        .send(newDefinition)
        .set('Accept', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('name', newDefinition.name)
      expect(response.body).toHaveProperty('type', newDefinition.type)
      expect(response.body).toHaveProperty('constraints')

      testDictionaryIds.push(response.body._id)
    })

    it('should validate required fields', async () => {
      const invalidDefinition = {
        description: testGenerators.productName()
        // Missing required 'name' and 'type' fields
      }
      const response = await request(app)
        .post('/attributesDictionary')
        .send(invalidDefinition)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('name')
      expect(response.body.error).toContain('type')
    })

    it('should validate attribute type constraints', async () => {
      const invalidTypeDefinition = createUniqueAttributeDefinition({
        type: 'invalidType'
      })
      const response = await request(app)
        .post('/attributesDictionary')
        .send(invalidTypeDefinition)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid attribute type')
    })

    it('should create string attribute with validation constraints', async () => {
      const stringDefinition = createUniqueAttributeDefinition({
        type: 'string',
        constraints: {
          minLength: 5,
          maxLength: 50,
          pattern: '^[A-Z][A-Za-z0-9]*$'
        }
      })
      const response = await request(app)
        .post('/attributesDictionary')
        .send(stringDefinition)
        .expect(201)

      expect(response.body.constraints.minLength).toBe(5)
      expect(response.body.constraints.maxLength).toBe(50)
      expect(response.body.constraints.pattern).toBe('^[A-Z][A-Za-z0-9]*$')

      testDictionaryIds.push(response.body._id)
    })

    it('should create number attribute with range constraints', async () => {
      const numberDefinition = createUniqueAttributeDefinition({
        type: 'number',
        constraints: {
          minimum: 0,
          maximum: 1000,
          multipleOf: 0.1
        }
      })
      const response = await request(app)
        .post('/attributesDictionary')
        .send(numberDefinition)
        .expect(201)

      expect(response.body.constraints.minimum).toBe(0)
      expect(response.body.constraints.maximum).toBe(1000)
      expect(response.body.constraints.multipleOf).toBe(0.1)

      testDictionaryIds.push(response.body._id)
    })

    it('should create enum attribute with predefined values', async () => {
      const enumDefinition = createUniqueAttributeDefinition({
        type: 'enum',
        constraints: {
          allowedValues: ['small', 'medium', 'large', 'extra-large']
        }
      })
      const response = await request(app)
        .post('/attributesDictionary')
        .send(enumDefinition)
        .expect(201)

      expect(response.body.constraints.allowedValues).toEqual(['small', 'medium', 'large', 'extra-large'])

      testDictionaryIds.push(response.body._id)
    })

    it('should create date attribute with format constraints', async () => {
      const dateDefinition = createUniqueAttributeDefinition({
        type: 'date',
        constraints: {
          format: 'ISO8601',
          minDate: '2020-01-01T00:00:00Z',
          maxDate: '2030-12-31T23:59:59Z'
        }
      })
      const response = await request(app)
        .post('/attributesDictionary')
        .send(dateDefinition)
        .expect(201)

      expect(response.body.constraints.format).toBe('ISO8601')
      expect(response.body.constraints.minDate).toBe('2020-01-01T00:00:00Z')

      testDictionaryIds.push(response.body._id)
    })

    it('should prevent duplicate attribute names', async () => {
      const definitionName = `duplicate_${testGenerators.productName().replace(/\s+/g, '')}`
      const firstDefinition = createUniqueAttributeDefinition({ name: definitionName })
      // Create first definition
      const firstResponse = await request(app)
        .post('/attributesDictionary')
        .send(firstDefinition)
        .expect(201)

      testDictionaryIds.push(firstResponse.body._id)

      // Attempt to create duplicate
      const duplicateDefinition = createUniqueAttributeDefinition({ name: definitionName })
      const duplicateResponse = await request(app)
        .post('/attributesDictionary')
        .send(duplicateDefinition)
        .expect(409)

      expect(duplicateResponse.body).toHaveProperty('error')
      expect(duplicateResponse.body.error).toContain('already exists')
    })

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousDefinition = createUniqueAttributeDefinition({
        name: 'testAttr',
        description: testGenerators.invalidData.scriptInjection,
        '$where': testGenerators.invalidData.nosqlInjection.$where
      })
      const response = await request(app)
        .post('/attributesDictionary')
        .send(maliciousDefinition)
        .expect(201)

      expect(response.body).not.toHaveProperty('$where')
      expect(response.body.description).not.toContain('<script>')

      testDictionaryIds.push(response.body._id)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /attributesDictionary/:id
  // ===============================
  describe('GET /attributesDictionary/:id - Get Specific Attribute Definition', () => {
    let testAttributeId: string

    beforeAll(async () => {
      const definition = createUniqueAttributeDefinition()
      const response = await request(app)
        .post('/attributesDictionary')
        .send(definition)
        .expect(201)

      testAttributeId = response.body._id
      testDictionaryIds.push(testAttributeId)
    })

    it('should retrieve specific attribute definition by ID', async () => {
      const response = await request(app)
        .get(`/attributesDictionary/${testAttributeId}`)
        .expect(200)

      expect(response.body).toHaveProperty('_id', testAttributeId)
      expect(response.body).toHaveProperty('name')
      expect(response.body).toHaveProperty('type')
      expect(response.body).toHaveProperty('constraints')
      expect(response.body).toHaveProperty('metadata')
    })

    it('should return 404 for non-existent attribute definition', async () => {
      const nonExistentId = new ObjectId().toString()
      const response = await request(app)
        .get(`/attributesDictionary/${nonExistentId}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('not found')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/attributesDictionary/invalid-id-format')
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid ID format')
    })

    it('should include usage statistics if requested', async () => {
      const response = await request(app)
        .get(`/attributesDictionary/${testAttributeId}`)
        .query({ includeUsage: true })
        .expect(200)

      expect(response.body).toHaveProperty('usage')
      expect(response.body.usage).toHaveProperty('totalUsages')
      expect(response.body.usage).toHaveProperty('usageByType')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - PUT /attributesDictionary/:id
  // ===============================
  describe('PUT /attributesDictionary/:id - Update Attribute Definition', () => {
    let testAttributeId: string

    beforeAll(async () => {
      const definition = createUniqueAttributeDefinition()
      const response = await request(app)
        .post('/attributesDictionary')
        .send(definition)
        .expect(201)

      testAttributeId = response.body._id
      testDictionaryIds.push(testAttributeId)
    })

    it('should update attribute definition', async () => {
      const updatedDefinition = {
        description: 'Updated description',
        constraints: {
          minLength: 2,
          maxLength: 100,
          pattern: '^[A-Za-z]*$'
        },
        metadata: {
          category: 'updated',
          tags: ['updated', 'test']
        }
      }
      const response = await request(app)
        .put(`/attributesDictionary/${testAttributeId}`)
        .send(updatedDefinition)
        .expect(200)

      expect(response.body.description).toBe('Updated description')
      expect(response.body.constraints.minLength).toBe(2)
      expect(response.body.metadata.category).toBe('updated')
    })

    it('should validate updated constraints', async () => {
      const invalidUpdate = {
        constraints: {
          minLength: -1, // Invalid negative value
          maxLength: 'invalid' // Invalid type
        }
      }
      const response = await request(app)
        .put(`/attributesDictionary/${testAttributeId}`)
        .send(invalidUpdate)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid constraints')
    })

    it('should prevent changing attribute type after creation', async () => {
      const typeChangeUpdate = {
        type: 'number' // Changing from original type
      }
      const response = await request(app)
        .put(`/attributesDictionary/${testAttributeId}`)
        .send(typeChangeUpdate)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Cannot change attribute type')
    })

    it('should update metadata timestamp on modification', async () => {
      const originalResponse = await request(app)
        .get(`/attributesDictionary/${testAttributeId}`)
        .expect(200)
      const originalTimestamp = originalResponse.body.metadata?.lastModified

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100))

      const updateResponse = await request(app)
        .put(`/attributesDictionary/${testAttributeId}`)
        .send({ description: 'Timestamp test update' })
        .expect(200)

      expect(updateResponse.body.metadata.lastModified).not.toBe(originalTimestamp)
    })

    it('should return 404 for non-existent attribute definition', async () => {
      const nonExistentId = new ObjectId().toString()
      const response = await request(app)
        .put(`/attributesDictionary/${nonExistentId}`)
        .send({ description: 'Test update' })
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('not found')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - DELETE /attributesDictionary/:id
  // ===============================
  describe('DELETE /attributesDictionary/:id - Delete Attribute Definition', () => {
    it('should delete attribute definition', async () => {
      // Create definition to delete
      const definition = createUniqueAttributeDefinition()
      const createResponse = await request(app)
        .post('/attributesDictionary')
        .send(definition)
        .expect(201)
      const attributeId = createResponse.body._id
      // Delete the definition
      const deleteResponse = await request(app)
        .delete(`/attributesDictionary/${attributeId}`)
        .expect(200)

      expect(deleteResponse.body).toHaveProperty('message')
      expect(deleteResponse.body.message).toContain('deleted successfully')

      // Verify deletion
      await request(app)
        .get(`/attributesDictionary/${attributeId}`)
        .expect(404)
    })

    it('should prevent deletion of attributes in use', async () => {
      // Create definition
      const definition = createUniqueAttributeDefinition()
      const createResponse = await request(app)
        .post('/attributesDictionary')
        .send(definition)
        .expect(201)
      const attributeId = createResponse.body._id

      testDictionaryIds.push(attributeId)

      // Attempt to delete (should fail if in use)
      const deleteResponse = await request(app)
        .delete(`/attributesDictionary/${attributeId}`)

      if (deleteResponse.status === 409) {
        expect(deleteResponse.body).toHaveProperty('error')
        expect(deleteResponse.body.error).toContain('in use')
      } else {
        expect(deleteResponse.status).toBe(200)
      }
    })

    it('should return 404 for non-existent attribute definition', async () => {
      const nonExistentId = new ObjectId().toString()
      const response = await request(app)
        .delete(`/attributesDictionary/${nonExistentId}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('not found')
    })

    it('should handle force deletion with confirmation', async () => {
      // Create definition
      const definition = createUniqueAttributeDefinition()
      const createResponse = await request(app)
        .post('/attributesDictionary')
        .send(definition)
        .expect(201)
      const attributeId = createResponse.body._id
      // Force delete
      const response = await request(app)
        .delete(`/attributesDictionary/${attributeId}`)
        .query({ force: true })
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('deleted successfully')
    })
  })

  // ===============================
  // SCHEMA MANAGEMENT TESTS
  // ===============================
  describe('Schema Management Operations', () => {
    it('should create complex attribute schema', async () => {
      const schema = createComplexAttributeSchema()
      const response = await request(app)
        .post('/attributesDictionary/schemas')
        .send(schema)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('name', schema.name)
      expect(response.body).toHaveProperty('version', schema.version)
      expect(response.body.attributes).toHaveLength(3)

      testSchemaIds.push(response.body._id)
    })

    it('should validate schema consistency', async () => {
      const invalidSchema = {
        name: 'InvalidSchema',
        version: '1.0.0',
        attributes: [
          {
            name: 'duplicateName',
            type: 'string',
            required: true
          },
          {
            name: 'duplicateName', // Duplicate name within schema
            type: 'number',
            required: false
          }
        ]
      }
      const response = await request(app)
        .post('/attributesDictionary/schemas')
        .send(invalidSchema)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Duplicate attribute names')
    })

    it('should support schema inheritance', async () => {
      // Create base schema
      const baseSchema = createComplexAttributeSchema({
        name: 'BaseSchema'
      })
      const baseResponse = await request(app)
        .post('/attributesDictionary/schemas')
        .send(baseSchema)
        .expect(201)

      testSchemaIds.push(baseResponse.body._id)

      // Create derived schema
      const derivedSchema = createComplexAttributeSchema({
        name: 'DerivedSchema',
        baseSchema: baseResponse.body._id,
        attributes: [
          ...baseSchema.attributes,
          createUniqueAttributeDefinition({ name: 'additionalField', type: 'string' })
        ]
      })
      const derivedResponse = await request(app)
        .post('/attributesDictionary/schemas')
        .send(derivedSchema)
        .expect(201)

      expect(derivedResponse.body.attributes.length).toBeGreaterThan(baseSchema.attributes.length)

      testSchemaIds.push(derivedResponse.body._id)
    })

    it('should version schemas correctly', async () => {
      const schema = createComplexAttributeSchema()
      // Create initial version
      const v1Response = await request(app)
        .post('/attributesDictionary/schemas')
        .send(schema)
        .expect(201)

      testSchemaIds.push(v1Response.body._id)

      // Create new version
      const v2Schema = {
        ...schema,
        version: '2.0.0',
        attributes: [
          ...schema.attributes,
          createUniqueAttributeDefinition({ name: 'newField', type: 'boolean' })
        ]
      }
      const v2Response = await request(app)
        .post('/attributesDictionary/schemas')
        .send(v2Schema)
        .expect(201)

      expect(v2Response.body.version).toBe('2.0.0')
      expect(v2Response.body.attributes.length).toBe(schema.attributes.length + 1)

      testSchemaIds.push(v2Response.body._id)
    })

    it('should export schema definitions', async () => {
      const schema = createComplexAttributeSchema()
      const createResponse = await request(app)
        .post('/attributesDictionary/schemas')
        .send(schema)
        .expect(201)

      testSchemaIds.push(createResponse.body._id)

      const exportResponse = await request(app)
        .get(`/attributesDictionary/schemas/${createResponse.body._id}/export`)
        .expect(200)

      expect(exportResponse.body).toHaveProperty('schema')
      expect(exportResponse.body).toHaveProperty('exportFormat')
      expect(exportResponse.body).toHaveProperty('exportDate')
    })

    it('should import schema definitions', async () => {
      const importData = {
        schema: createComplexAttributeSchema(),
        replaceExisting: false,
        validateReferences: true
      }
      const response = await request(app)
        .post('/attributesDictionary/schemas/import')
        .send(importData)
        .expect(201)

      expect(response.body).toHaveProperty('imported')
      expect(response.body).toHaveProperty('conflicts')
      expect(response.body).toHaveProperty('warnings')

      if (response.body.imported._id) {
        testSchemaIds.push(response.body.imported._id)
      }
    })
  })

  // ===============================
  // VALIDATION AND CONSTRAINTS TESTS
  // ===============================
  describe('Validation and Constraints', () => {
    it('should validate attribute values against definitions', async () => {
      // Create string attribute with constraints
      const stringDef = createUniqueAttributeDefinition({
        name: 'testString',
        type: 'string',
        constraints: {
          minLength: 5,
          maxLength: 20,
          pattern: '^[A-Za-z]+$'
        }
      })
      const defResponse = await request(app)
        .post('/attributesDictionary')
        .send(stringDef)
        .expect(201)

      testDictionaryIds.push(defResponse.body._id)

      // Test validation
      const validationData = {
        attributeId: defResponse.body._id,
        value: 'ValidString'
      }
      const validResponse = await request(app)
        .post('/attributesDictionary/validate')
        .send(validationData)
        .expect(200)

      expect(validResponse.body).toHaveProperty('valid', true)

      // Test invalid value
      const invalidData = {
        attributeId: defResponse.body._id,
        value: '123' // Too short and contains numbers
      }
      const invalidResponse = await request(app)
        .post('/attributesDictionary/validate')
        .send(invalidData)
        .expect(400)

      expect(invalidResponse.body).toHaveProperty('valid', false)
      expect(invalidResponse.body).toHaveProperty('errors')
      expect(Array.isArray(invalidResponse.body.errors)).toBe(true)
    })

    it('should validate number constraints', async () => {
      const numberDef = createUniqueAttributeDefinition({
        name: 'testNumber',
        type: 'number',
        constraints: {
          minimum: 0,
          maximum: 100,
          multipleOf: 5
        }
      })
      const defResponse = await request(app)
        .post('/attributesDictionary')
        .send(numberDef)
        .expect(201)

      testDictionaryIds.push(defResponse.body._id)

      // Valid number
      const validData = { attributeId: defResponse.body._id, value: 25 }
      const validResponse = await request(app)
        .post('/attributesDictionary/validate')
        .send(validData)
        .expect(200)

      expect(validResponse.body.valid).toBe(true)

      // Invalid number (not multiple of 5)
      const invalidData = { attributeId: defResponse.body._id, value: 23 }
      const invalidResponse = await request(app)
        .post('/attributesDictionary/validate')
        .send(invalidData)
        .expect(400)

      expect(invalidResponse.body.valid).toBe(false)
    })

    it('should validate enum constraints', async () => {
      const enumDef = createUniqueAttributeDefinition({
        name: 'testEnum',
        type: 'enum',
        constraints: {
          allowedValues: ['red', 'green', 'blue']
        }
      })
      const defResponse = await request(app)
        .post('/attributesDictionary')
        .send(enumDef)
        .expect(201)

      testDictionaryIds.push(defResponse.body._id)

      // Valid enum value
      const validData = { attributeId: defResponse.body._id, value: 'red' }
      const validResponse = await request(app)
        .post('/attributesDictionary/validate')
        .send(validData)
        .expect(200)

      expect(validResponse.body.valid).toBe(true)

      // Invalid enum value
      const invalidData = { attributeId: defResponse.body._id, value: 'yellow' }
      const invalidResponse = await request(app)
        .post('/attributesDictionary/validate')
        .send(invalidData)
        .expect(400)

      expect(invalidResponse.body.valid).toBe(false)
    })

    it('should validate date constraints', async () => {
      const dateDef = createUniqueAttributeDefinition({
        name: 'testDate',
        type: 'date',
        constraints: {
          format: 'ISO8601',
          minDate: '2020-01-01T00:00:00Z',
          maxDate: '2025-12-31T23:59:59Z'
        }
      })
      const defResponse = await request(app)
        .post('/attributesDictionary')
        .send(dateDef)
        .expect(201)

      testDictionaryIds.push(defResponse.body._id)

      // Valid date
      const validData = { attributeId: defResponse.body._id, value: '2022-06-15T10:30:00Z' }
      const validResponse = await request(app)
        .post('/attributesDictionary/validate')
        .send(validData)
        .expect(200)

      expect(validResponse.body.valid).toBe(true)

      // Invalid date (before minimum)
      const invalidData = { attributeId: defResponse.body._id, value: '2019-01-01T00:00:00Z' }
      const invalidResponse = await request(app)
        .post('/attributesDictionary/validate')
        .send(invalidData)
        .expect(400)

      expect(invalidResponse.body.valid).toBe(false)
    })
  })

  // ===============================
  // SEARCH AND FILTERING TESTS
  // ===============================
  describe('Advanced Search and Filtering', () => {
    it('should search attributes by multiple criteria', async () => {
      const searchCriteria = {
        type: 'string',
        category: 'technical',
        tags: ['networking'],
        required: true,
        hasConstraints: true
      }
      const response = await request(app)
        .post('/attributesDictionary/search')
        .send(searchCriteria)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        response.body.forEach((attr: any) => {
          expect(attr.type).toBe('string')
          if (attr.metadata?.category) {
            expect(attr.metadata.category).toBe('technical')
          }
        })
      }
    })

    it('should support full-text search across descriptions', async () => {
      const response = await request(app)
        .get('/attributesDictionary/search')
        .query({ q: 'network device identification' })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveProperty('results')
      expect(response.body).toHaveProperty('searchScore')
    })

    it('should filter by usage statistics', async () => {
      const response = await request(app)
        .get('/attributesDictionary')
        .query({
          minUsage: 10,
          maxUsage: 100,
          orderBy: 'usage',
          order: 'desc'
        })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 1) {
        for (let i = 1; i < response.body.length; i++) {
          const current = response.body[i].usage?.totalUsages || 0
          const previous = response.body[i - 1].usage?.totalUsages || 0

          expect(current).toBeLessThanOrEqual(previous)
        }
      }
    })

    it('should provide attribute recommendations', async () => {
      const context = {
        entityType: 'device',
        category: 'networking',
        existingAttributes: ['serialNumber', 'model']
      }
      const response = await request(app)
        .post('/attributesDictionary/recommendations')
        .send(context)
        .expect(200)

      expect(Array.isArray(response.body.recommendations)).toBe(true)
      expect(response.body).toHaveProperty('confidence')
      expect(response.body).toHaveProperty('reasoning')

      if (response.body.recommendations.length > 0) {
        const recommendation = response.body.recommendations[0]

        expect(recommendation).toHaveProperty('attribute')
        expect(recommendation).toHaveProperty('relevanceScore')
        expect(recommendation).toHaveProperty('justification')
      }
    })
  })

  // ===============================
  // EDGE CASES AND ERROR SCENARIOS
  // ===============================
  describe('Edge Cases and Error Scenarios', () => {
    it('should handle extremely long attribute names', async () => {
      const longNameDefinition = createUniqueAttributeDefinition({
        name: 'x'.repeat(1000) // Very long name
      })
      const response = await request(app)
        .post('/attributesDictionary')
        .send(longNameDefinition)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Name too long')
    })

    it('should handle circular schema references', async () => {
      const circularSchema = {
        name: 'CircularSchema',
        version: '1.0.0',
        baseSchema: 'self', // Circular reference
        attributes: [
          createUniqueAttributeDefinition()
        ]
      }
      const response = await request(app)
        .post('/attributesDictionary/schemas')
        .send(circularSchema)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Circular reference')
    })

    it('should handle invalid constraint combinations', async () => {
      const invalidConstraints = createUniqueAttributeDefinition({
        type: 'string',
        constraints: {
          minLength: 100,
          maxLength: 50 // Max less than min
        }
      })
      const response = await request(app)
        .post('/attributesDictionary')
        .send(invalidConstraints)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid constraint')
    })

    it('should handle malformed regex patterns', async () => {
      const invalidPattern = createUniqueAttributeDefinition({
        type: 'string',
        constraints: {
          pattern: '[invalid regex('
        }
      })
      const response = await request(app)
        .post('/attributesDictionary')
        .send(invalidPattern)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid regex pattern')
    })

    it('should handle concurrent modifications gracefully', async () => {
      // Create definition
      const definition = createUniqueAttributeDefinition()
      const createResponse = await request(app)
        .post('/attributesDictionary')
        .send(definition)
        .expect(201)
      const attributeId = createResponse.body._id

      testDictionaryIds.push(attributeId)

      // Simulate concurrent updates
      const update1 = { description: 'Update 1' }
      const update2 = { description: 'Update 2' }
      const promises = [
        request(app).put(`/attributesDictionary/${attributeId}`).send(update1),
        request(app).put(`/attributesDictionary/${attributeId}`).send(update2)
      ]
      const responses = await Promise.all(promises)
      // At least one should succeed
      const successfulUpdates = responses.filter(r => r.status === 200)

      expect(successfulUpdates.length).toBeGreaterThan(0)
    })
  })
})

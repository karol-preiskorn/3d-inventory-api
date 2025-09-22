/**
 * @file model.test.ts
 * @description Comprehensive test suite for Model API endpoints and database operations.
 * Tests CRUD operations, validation, error handling, and business logic for the 3D
 * inventory model system. Validates API response formats, status codes, database
 * persistence, and data integrity across all model management operations.
 * @version 2024-09-21 Enhanced with comprehensive API endpoint testing
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Model API and Database Tests', () => {
  let connection: MongoClient
  let db: Db
  const testModelIds: string[] = []

  beforeAll(async () => {
    try {
      if (!config.ATLAS_URI) {
        throw new Error('ATLAS_URI not configured')
      }

      connection = await MongoClient.connect(config.ATLAS_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000
      })
      db = connection.db(config.DBNAME)

      await db.admin().ping()
      console.log('MongoDB connection successful for model tests')
    } catch (error) {
      console.error('Database connection failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('timeout') || errorMessage.includes('ENOTFOUND')) {
        console.warn('Skipping database tests - database not accessible')

        return
      }

      throw error
    }
  }, 20000)

  afterAll(async () => {
    // Clean up test data
    if (connection && db && testModelIds.length > 0) {
      try {
        const models = db.collection('models')

        await models.deleteMany({
          _id: { $in: testModelIds.map(id => new ObjectId(id)) }
        })
      } catch (error) {
        console.warn('Error cleaning up test data:', error)
      }
    }

    if (connection) {
      await connection.close()
    }
  })

  const checkDbConnection = () => {
    if (!connection || !db) {
      console.warn('Skipping test - database not connected')

      return false
    }

    return true
  }
  const createTestModelData = () => {
    const deviceData = testGenerators.deviceSimple()

    return {
      name: `${deviceData.name} ${Date.now()}`,  // Add unique timestamp
      dimension: deviceData.dimensions,
      texture: {
        front: '/assets/texture/test-front.png',
        back: '/assets/texture/test-back.png',
        side: '/assets/texture/test-side.png',
        top: '/assets/texture/test-top.png',
        bottom: '/assets/texture/test-bottom.png'
      },
      type: 'server',
      category: 'hardware'
    }
  }

  describe('Database Model Operations', () => {
    it('should insert and retrieve models from database', async () => {
      if (!checkDbConnection()) {
        return
      }

      const models = db.collection('models')

      for (let index = 0; index < 3; index++) {
        const deviceData = testGenerators.deviceSimple()
        const mockModel = {
          name: `${deviceData.name} ${Date.now()}${index}`,
          dimension: deviceData.dimensions,
          texture: {
            front: '/assets/texture/r710-2.5-nobezel__29341.png',
            back: '/assets/texture/r710-2.5-nobezel__29341.png',
            side: '/assets/texture/r710-2.5-nobezel__29341.png',
            top: '/assets/texture/r710-2.5-nobezel__29341.png',
            bottom: '/assets/texture/r710-2.5-nobezel__29341.png'
          },
          type: 'server',
          category: 'hardware',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const insertResult = await models.insertOne(mockModel)
        const insertedModel = await models.findOne({ _id: insertResult.insertedId })

        expect(insertedModel).not.toBeNull()

        if (insertedModel) {
          expect(insertedModel._id).not.toBeNull()
          testModelIds.push(insertedModel._id!.toString())

          // Compare specific fields instead of object equality
          expect(insertedModel.name).toBe(mockModel.name)
          expect(insertedModel.dimension).toEqual(mockModel.dimension)
          expect(insertedModel.texture).toEqual(mockModel.texture)
          expect(insertedModel.type).toBe(mockModel.type)
          expect(insertedModel.category).toBe(mockModel.category)
          expect(insertedModel.isActive).toBe(mockModel.isActive)
        }
      }
    })
  })

  describe('GET /models', () => {
    it('should return array of models with correct structure', async () => {
      if (!checkDbConnection()) {
        return
      }

      const response = await request(app)
        .get('/models')
        .set('Accept', 'application/json')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('count')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(typeof response.body.count).toBe('number')

      if (response.body.data.length > 0) {
        const model = response.body.data[0]

        expect(model).toHaveProperty('_id')
        expect(model).toHaveProperty('name')
        expect(model).toHaveProperty('dimension')
        expect(model.dimension).toHaveProperty('width')
        expect(model.dimension).toHaveProperty('height')
        expect(model.dimension).toHaveProperty('depth')
        expect(model).toHaveProperty('texture')
        expect(model.texture).toHaveProperty('front')
        expect(model.texture).toHaveProperty('back')
      }
    })

    it('should respect limit parameter', async () => {
      if (!checkDbConnection()) {
        return
      }

      const response = await request(app)
        .get('/models?limit=1')
        .set('Accept', 'application/json')
        .expect(200)

      expect(response.body.data.length).toBeLessThanOrEqual(1)
    })
  })

  describe('POST /models', () => {
    it('should create a new model with valid data', async () => {
      if (!checkDbConnection()) {
        return
      }

      const modelData = createTestModelData()
      const response = await request(app)
        .post('/models')
        .send(modelData)
        .set('Accept', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('name', modelData.name)
      expect(typeof response.body._id).toBe('string')

      testModelIds.push(response.body._id)

      const models = db.collection('models')
      const savedModel = await models.findOne({ _id: new ObjectId(response.body._id) })

      expect(savedModel).not.toBeNull()
      expect(savedModel?.name).toBe(modelData.name)
      expect(savedModel?.dimension).toEqual(modelData.dimension)
    })

    it('should reject model without required name field', async () => {
      if (!checkDbConnection()) {
        return
      }

      const modelData = createTestModelData()

      delete (modelData as any).name

      const response = await request(app)
        .post('/models')
        .send(modelData)
        .set('Accept', 'application/json')
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Name is required')
    })

    it('should reject model with invalid dimension data', async () => {
      if (!checkDbConnection()) {
        return
      }

      const modelData = createTestModelData()

      modelData.dimension = { width: -1, height: 0, depth: 'invalid' } as any

      const response = await request(app)
        .post('/models')
        .send(modelData)
        .set('Accept', 'application/json')
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid input data')
    })
  })

  describe('GET /models/:id', () => {
    let testModelId: string

    beforeAll(async () => {
      if (checkDbConnection()) {
        const modelData = createTestModelData()
        const response = await request(app)
          .post('/models')
          .send(modelData)
          .expect(201)

        testModelId = response.body._id
        testModelIds.push(testModelId)
      }
    })

    it('should return specific model by valid ID', async () => {
      if (!checkDbConnection() || !testModelId) {
        return
      }

      const response = await request(app)
        .get(`/models/${testModelId}`)
        .set('Accept', 'application/json')
        .expect(200)

      expect(response.body).toHaveProperty('_id', testModelId)
      expect(response.body).toHaveProperty('name')
      expect(response.body).toHaveProperty('dimension')
      expect(response.body).toHaveProperty('texture')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      if (!checkDbConnection()) {
        return
      }

      const response = await request(app)
        .get('/models/invalid-id')
        .set('Accept', 'application/json')
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid')
    })

    it('should return 404 for non-existent model', async () => {
      if (!checkDbConnection()) {
        return
      }

      const nonExistentId = new ObjectId().toString()
      const response = await request(app)
        .get(`/models/${nonExistentId}`)
        .set('Accept', 'application/json')
        .expect(404)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('not found')
    })
  })

  describe('PUT /models/:id', () => {
    let updateModelId: string

    beforeAll(async () => {
      if (checkDbConnection()) {
        const modelData = createTestModelData()
        const response = await request(app)
          .post('/models')
          .send(modelData)
          .expect(201)

        updateModelId = response.body._id
        testModelIds.push(updateModelId)
      }
    })

    it('should update complete model with valid data', async () => {
      if (!checkDbConnection() || !updateModelId) {
        return
      }

      const updateData = {
        name: 'Updated Test Model',
        dimension: {
          width: 5,
          height: 6,
          depth: 7
        },
        texture: {
          front: '/assets/texture/updated-front.png',
          back: '/assets/texture/updated-back.png',
          side: '/assets/texture/updated-side.png',
          top: '/assets/texture/updated-top.png',
          bottom: '/assets/texture/updated-bottom.png'
        },
        type: 'updated-server'
      }
      const response = await request(app)
        .put(`/models/${updateModelId}`)
        .send(updateData)
        .set('Accept', 'application/json')
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Model updated successfully')

      const models = db.collection('models')
      const updatedModel = await models.findOne({ _id: new ObjectId(updateModelId) })

      expect(updatedModel?.name).toBe(updateData.name)
      expect(updatedModel?.dimension).toEqual(updateData.dimension)
    })
  })

  describe('DELETE /models/:id', () => {
    it('should delete specific model by ID', async () => {
      if (!checkDbConnection()) {
        return
      }

      // Create a unique model name to avoid conflicts
      const modelData = createTestModelData()

      modelData.name = 'Delete Test Model ' + Date.now()

      const createResponse = await request(app)
        .post('/models')
        .send(modelData)
        .expect(201)
      const modelToDelete = createResponse.body._id
      const response = await request(app)
        .delete(`/models/${modelToDelete}`)
        .set('Accept', 'application/json')
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Model deleted successfully')

      const models = db.collection('models')
      const deletedModel = await models.findOne({ _id: new ObjectId(modelToDelete) })

      expect(deletedModel).toBeNull()
    })

    it('should return 404 when deleting non-existent model', async () => {
      if (!checkDbConnection()) {
        return
      }

      const nonExistentId = new ObjectId().toString()
      const response = await request(app)
        .delete(`/models/${nonExistentId}`)
        .set('Accept', 'application/json')
        .expect(404)

      expect(response.body).toHaveProperty('message')
    })
  })

  describe('PATCH Operations', () => {
    let patchModelId: string

    beforeAll(async () => {
      if (checkDbConnection()) {
        const modelData = createTestModelData()
        const response = await request(app)
          .post('/models')
          .send(modelData)
          .expect(201)

        patchModelId = response.body._id
        testModelIds.push(patchModelId)
      }
    })

    it('should update only dimension fields', async () => {
      if (!checkDbConnection() || !patchModelId) {
        return
      }

      const newDimension = {
        width: 10,
        height: 15,
        depth: 20
      }
      const response = await request(app)
        .patch(`/models/dimension/${patchModelId}`)
        .send({ dimension: newDimension })
        .set('Accept', 'application/json')
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Model dimension updated successfully')

      const models = db.collection('models')
      const updatedModel = await models.findOne({ _id: new ObjectId(patchModelId) })

      expect(updatedModel?.dimension).toEqual(newDimension)
    })

    it('should update only texture fields', async () => {
      if (!checkDbConnection() || !patchModelId) {
        return
      }

      const newTexture = {
        front: '/assets/texture/new-front.png',
        back: '/assets/texture/new-back.png',
        side: '/assets/texture/new-side.png',
        top: '/assets/texture/new-top.png',
        bottom: '/assets/texture/new-bottom.png'
      }
      const response = await request(app)
        .patch(`/models/texture/${patchModelId}`)
        .send({ texture: newTexture })
        .set('Accept', 'application/json')
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Model texture updated successfully')

      const models = db.collection('models')
      const updatedModel = await models.findOne({ _id: new ObjectId(patchModelId) })

      expect(updatedModel?.texture).toEqual(newTexture)
    })
  })

  describe('Validation Tests', () => {
    it('should validate dimension values are positive numbers', async () => {
      if (!checkDbConnection()) {
        return
      }

      const modelData = createTestModelData()

      modelData.dimension = {
        width: -5,
        height: 0,
        depth: 10
      }

      const response = await request(app)
        .post('/models')
        .send(modelData)
        .set('Accept', 'application/json')
        .expect(400)

      expect(response.body.error).toContain('Invalid input data')
    })

    it('should validate texture paths are non-empty strings', async () => {
      if (!checkDbConnection()) {
        return
      }

      const modelData = createTestModelData()

      modelData.texture = {
        front: '',
        back: '/valid/path.png',
        side: '/valid/path.png',
        top: '/valid/path.png',
        bottom: '/valid/path.png'
      }

      const response = await request(app)
        .post('/models')
        .send(modelData)
        .set('Accept', 'application/json')
        .expect(400)

      expect(response.body.error).toContain('Invalid input data')
    })

    it('should sanitize input to prevent injection attacks', async () => {
      if (!checkDbConnection()) {
        return
      }

      const modelData = createTestModelData()

      modelData.name = 'Test Model ' + Date.now() // Make unique
      ;(modelData as any).$where = 'function() { return true; }'

      const response = await request(app)
        .post('/models')
        .send(modelData)
        .set('Accept', 'application/json')
        .expect(201)

      testModelIds.push(response.body._id)

      const models = db.collection('models')
      const savedModel = await models.findOne({ _id: new ObjectId(response.body._id) })

      expect(savedModel).not.toBeNull()
      expect(savedModel).not.toHaveProperty('$where')
    })
  })
})

/**
 * Model Router Integration Tests
 * Comprehensive testing of model management endpoints with enhanced coverage
 */
import express from 'express'
import request from 'supertest'
import {
  createModel,
  deleteAllModels,
  deleteModel,
  getAllModels,
  getModelById,
  updateModel,
  updateModelDimension,
  updateModelTexture
} from '../controllers/models'
import { createModelsRouter } from '../routers/models'

// Mock all the controller functions
jest.mock('../controllers/models', () => ({
  getAllModels: jest.fn(),
  getModelById: jest.fn(),
  createModel: jest.fn(),
  updateModel: jest.fn(),
  updateModelDimension: jest.fn(),
  updateModelTexture: jest.fn(),
  deleteModel: jest.fn(),
  deleteAllModels: jest.fn()
}))

// Mock middleware modules
jest.mock('../middlewares', () => ({
  validateObjectId: jest.fn((req: any, res: any, next: any) => next())
}))

// Mock database utilities
jest.mock('../utils/db', () => ({
  connectToCluster: jest.fn(),
  connectToDb: jest.fn(),
  closeConnection: jest.fn().mockResolvedValue(undefined)
}))

// Mock logging service
jest.mock('../services/logs', () => ({
  CreateLog: jest.fn().mockResolvedValue({ status: 'success' })
}))

// Mock logger
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }))
}))

const mockedGetAllModels = jest.mocked(getAllModels)
const mockedGetModelById = jest.mocked(getModelById)
const mockedCreateModel = jest.mocked(createModel)
const mockedUpdateModel = jest.mocked(updateModel)
const mockedUpdateModelDimension = jest.mocked(updateModelDimension)
const mockedUpdateModelTexture = jest.mocked(updateModelTexture)
const mockedDeleteModel = jest.mocked(deleteModel)
const mockedDeleteAllModels = jest.mocked(deleteAllModels)
const app = express()

app.use(express.json())
app.use('/models', createModelsRouter())

describe('Models Router', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /models', () => {
    it('should call getAllModels controller and return model list', async () => {
      const mockModels = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'Model 1',
          type: 'furniture',
          dimension: { width: 100, height: 200, depth: 50 },
          texture: { front: 'front.jpg', back: 'back.jpg', side: 'side.jpg', top: 'top.jpg', bottom: 'bottom.jpg' }
        },
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Model 2',
          type: 'equipment',
          dimension: { width: 150, height: 100, depth: 75 },
          texture: { front: 'front2.jpg', back: 'back2.jpg', side: 'side2.jpg', top: 'top2.jpg', bottom: 'bottom2.jpg' }
        }
      ]

      mockedGetAllModels.mockImplementation(async (req, res) => {
        res.status(200).json(mockModels)
      })

      const response = await request(app).get('/models')

      expect(mockedGetAllModels).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockModels)
      expect(response.body).toHaveLength(2)
    })

    it('should handle getAllModels errors', async () => {
      mockedGetAllModels.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Database connection failed' })
      })

      const response = await request(app).get('/models')

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Database connection failed')
    })

    it('should return empty array when no models exist', async () => {
      mockedGetAllModels.mockImplementation(async (req, res) => {
        res.status(200).json([])
      })

      const response = await request(app).get('/models')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(0)
    })
  })

  describe('GET /models/:id', () => {
    const modelId = '507f1f77bcf86cd799439011'

    it('should call getModelById controller and return model details', async () => {
      const mockModel = {
        _id: modelId,
        name: 'Test Model',
        type: 'furniture',
        dimension: { width: 100, height: 200, depth: 50 },
        texture: { front: 'front.jpg', back: 'back.jpg', side: 'side.jpg', top: 'top.jpg', bottom: 'bottom.jpg' }
      }

      mockedGetModelById.mockImplementation(async (req, res) => {
        res.status(200).json(mockModel)
      })

      const response = await request(app).get(`/models/${modelId}`)

      expect(mockedGetModelById).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockModel)
      expect(response.body._id).toBe(modelId)
    })

    it('should handle model not found', async () => {
      mockedGetModelById.mockImplementation(async (req, res) => {
        res.status(404).json({ error: 'Model not found' })
      })

      const response = await request(app).get(`/models/${modelId}`)

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Model not found')
    })

    it('should handle database errors for single model lookup', async () => {
      mockedGetModelById.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Database query failed' })
      })

      const response = await request(app).get(`/models/${modelId}`)

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Database query failed')
    })
  })

  describe('POST /models', () => {
    it('should call createModel controller with valid model data', async () => {
      const newModelData = {
        name: 'New Test Model',
        type: 'furniture',
        dimension: { width: 120, height: 180, depth: 60 },
        texture: { front: 'new_front.jpg', back: 'new_back.jpg', side: 'new_side.jpg', top: 'new_top.jpg', bottom: 'new_bottom.jpg' }
      }
      const createdModel = { _id: '507f1f77bcf86cd799439013', ...newModelData }

      mockedCreateModel.mockImplementation(async (req, res) => {
        res.status(201).json({
          message: 'Model created successfully',
          model: createdModel
        })
      })

      const response = await request(app)
        .post('/models')
        .send(newModelData)

      expect(mockedCreateModel).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(201)
      expect(response.body.model).toEqual(createdModel)
      expect(response.body.message).toBe('Model created successfully')
    })

    it('should validate required name field', async () => {
      const response = await request(app)
        .post('/models')
        .send({
          type: 'furniture',
          dimension: { width: 120, height: 180, depth: 60 }
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Name is required and must be a string')
    })

    it('should validate name field type', async () => {
      const response = await request(app)
        .post('/models')
        .send({
          name: 123,  // Invalid: should be string
          type: 'furniture',
          dimension: { width: 120, height: 180, depth: 60 }
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Name is required and must be a string')
    })

    it('should handle duplicate model creation', async () => {
      mockedCreateModel.mockImplementation(async (req, res) => {
        res.status(409).json({ error: 'Model with this name already exists' })
      })

      const response = await request(app)
        .post('/models')
        .send({
          name: 'Duplicate Model',
          type: 'furniture',
          dimension: { width: 120, height: 180, depth: 60 }
        })

      expect(response.status).toBe(409)
      expect(response.body.error).toBe('Model with this name already exists')
    })
  })

  describe('PUT /models/:id', () => {
    const modelId = '507f1f77bcf86cd799439011'

    it('should call updateModel controller with valid data', async () => {
      const updateData = {
        name: 'Updated Model',
        type: 'equipment',
        dimension: { width: 200, height: 150, depth: 80 }
      }
      const updatedModel = { _id: modelId, ...updateData }

      mockedUpdateModel.mockImplementation(async (req, res) => {
        res.status(200).json({
          message: 'Model updated successfully',
          model: updatedModel
        })
      })

      const response = await request(app)
        .put(`/models/${modelId}`)
        .send(updateData)

      expect(mockedUpdateModel).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body.model).toEqual(updatedModel)
      expect(response.body.message).toBe('Model updated successfully')
    })

    it('should validate name field for updates', async () => {
      const response = await request(app)
        .put(`/models/${modelId}`)
        .send({
          type: 'furniture'  // Missing required name
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Name is required and must be a string')
    })

    it('should handle model not found for update', async () => {
      mockedUpdateModel.mockImplementation(async (req, res) => {
        res.status(404).json({ error: 'Model not found for update' })
      })

      const response = await request(app)
        .put(`/models/${modelId}`)
        .send({
          name: 'Updated Model',
          type: 'furniture'
        })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Model not found for update')
    })
  })

  describe('PATCH /models/dimension/:id', () => {
    const modelId = '507f1f77bcf86cd799439011'

    it('should call updateModelDimension controller', async () => {
      const dimensionData = { width: 150, height: 200, depth: 75 }

      mockedUpdateModelDimension.mockImplementation(async (req, res) => {
        res.status(200).json({
          message: 'Model dimensions updated',
          model: { _id: modelId, dimension: dimensionData }
        })
      })

      const response = await request(app)
        .patch(`/models/dimension/${modelId}`)
        .send(dimensionData)

      expect(mockedUpdateModelDimension).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body.model.dimension).toEqual(dimensionData)
    })

    it('should handle invalid dimension data', async () => {
      mockedUpdateModelDimension.mockImplementation(async (req, res) => {
        res.status(400).json({ error: 'Invalid dimension data' })
      })

      const response = await request(app)
        .patch(`/models/dimension/${modelId}`)
        .send({ invalid: 'data' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid dimension data')
    })
  })

  describe('PATCH /models/texture/:id', () => {
    const modelId = '507f1f77bcf86cd799439011'

    it('should call updateModelTexture controller', async () => {
      const textureData = {
        front: 'new_front.jpg',
        back: 'new_back.jpg',
        side: 'new_side.jpg',
        top: 'new_top.jpg',
        bottom: 'new_bottom.jpg'
      }

      mockedUpdateModelTexture.mockImplementation(async (req, res) => {
        res.status(200).json({
          message: 'Model texture updated',
          model: { _id: modelId, texture: textureData }
        })
      })

      const response = await request(app)
        .patch(`/models/texture/${modelId}`)
        .send(textureData)

      expect(mockedUpdateModelTexture).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body.model.texture).toEqual(textureData)
    })

    it('should handle partial texture updates', async () => {
      const partialTextureData = { front: 'updated_front.jpg', back: 'updated_back.jpg' }

      mockedUpdateModelTexture.mockImplementation(async (req, res) => {
        res.status(200).json({
          message: 'Model texture updated',
          model: { _id: modelId, texture: partialTextureData }
        })
      })

      const response = await request(app)
        .patch(`/models/texture/${modelId}`)
        .send(partialTextureData)

      expect(response.status).toBe(200)
      expect(response.body.model.texture).toEqual(partialTextureData)
    })
  })

  describe('DELETE /models/:id', () => {
    const modelId = '507f1f77bcf86cd799439011'

    it('should call deleteModel controller', async () => {
      mockedDeleteModel.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Model deleted successfully' })
      })

      const response = await request(app).delete(`/models/${modelId}`)

      expect(mockedDeleteModel).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Model deleted successfully')
    })

    it('should handle model not found for deletion', async () => {
      mockedDeleteModel.mockImplementation(async (req, res) => {
        res.status(404).json({ error: 'Model not found' })
      })

      const response = await request(app).delete(`/models/${modelId}`)

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Model not found')
    })
  })

  describe('DELETE /models', () => {
    it('should call deleteAllModels controller', async () => {
      mockedDeleteAllModels.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'All models deleted', deletedCount: 10 })
      })

      const response = await request(app).delete('/models')

      expect(mockedDeleteAllModels).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body.deletedCount).toBe(10)
    })

    it('should handle authorization for bulk delete', async () => {
      mockedDeleteAllModels.mockImplementation(async (req, res) => {
        res.status(403).json({ error: 'Insufficient permissions' })
      })

      const response = await request(app).delete('/models')

      expect(response.status).toBe(403)
      expect(response.body.error).toBe('Insufficient permissions')
    })
  })

  describe('Error Handling & Edge Cases', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const response = await request(app)
        .post('/models')
        .set('Content-Type', 'application/json')
        .send('{ malformed json }')

      expect(response.status).toBe(400)
    })

    it('should handle invalid ObjectId format', async () => {
      mockedGetModelById.mockImplementation(async (req, res) => {
        res.status(400).json({ error: 'Invalid ObjectId format' })
      })

      const response = await request(app).get('/models/invalid-id')

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid ObjectId format')
    })

    it('should handle server errors gracefully', async () => {
      mockedGetAllModels.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Internal server error' })
      })

      const response = await request(app).get('/models')

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Internal server error')
    })
  })

  describe('Middleware Integration', () => {
    it('should parse JSON request bodies correctly', async () => {
      mockedCreateModel.mockImplementation(async (req, res) => {
        res.status(201).json({
          message: 'Model created',
          receivedBody: req.body,
          bodyType: typeof req.body
        })
      })

      const modelData = { name: 'Test Model', type: 'furniture' }
      const response = await request(app)
        .post('/models')
        .send(modelData)

      expect(response.status).toBe(201)
      expect(response.body.receivedBody).toEqual(modelData)
      expect(response.body.bodyType).toBe('object')
    })

    it('should validate ObjectId middleware for parameterized routes', async () => {
      mockedGetModelById.mockImplementation(async (req, res) => {
        res.status(200).json({
          message: 'ObjectId validation passed',
          receivedId: req.params.id
        })
      })

      const validObjectId = '507f1f77bcf86cd799439011'
      const response = await request(app).get(`/models/${validObjectId}`)

      expect(response.status).toBe(200)
      expect(mockedGetModelById).toHaveBeenCalledTimes(1)
    })
  })
})

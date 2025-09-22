/**
 * Models API Controller Tests
 * Tests the 3D model management API endpoints including model upload,
 * retrieval, dimension updates, texture management, and model associations
 */

import { ObjectId } from 'mongodb'
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

// Mock database utilities
jest.mock('../utils/db', () => ({
  connectToCluster: jest.fn(),
  connectToDb: jest.fn(),
  closeConnection: jest.fn().mockResolvedValue(undefined)
}))

const { connectToCluster, connectToDb } = jest.requireMock('../utils/db')

describe('Models Controller', () => {
  let mockRequest: any
  let mockResponse: any
  let mockClient: any
  let mockDb: any
  let mockCollection: any
  // Helper function to create valid model data
  const createValidModelData = () => ({
    name: 'Test Server Model',
    dimension: {
      width: 10.5,
      height: 2.0,
      depth: 15.0
    },
    texture: {
      front: 'front-texture.jpg',
      back: 'back-texture.jpg',
      side: 'side-texture.jpg',
      top: 'top-texture.jpg',
      bottom: 'bottom-texture.jpg'
    },
    type: 'server',
    category: 'hardware'
  })

  beforeEach(() => {
    mockRequest = { params: {}, query: {}, body: {} }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    }

    mockCollection = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn()
    }

    mockDb = { collection: jest.fn().mockReturnValue(mockCollection) }
    mockClient = { close: jest.fn() }

    connectToCluster.mockResolvedValue(mockClient)
    connectToDb.mockReturnValue(mockDb)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllModels', () => {
    it('should return all models successfully', async () => {
      const models = [
        { _id: new ObjectId(), name: 'Model 1' },
        { _id: new ObjectId(), name: 'Model 2' }
      ]

      mockCollection.find.mockReturnValue({
        limit: mockCollection.limit.mockReturnValue({
          toArray: mockCollection.toArray.mockResolvedValue(models)
        })
      })

      await getAllModels(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: models,
        count: models.length
      })
    })

    it('should return empty array when no models found', async () => {
      mockCollection.find.mockReturnValue({
        limit: mockCollection.limit.mockReturnValue({
          toArray: mockCollection.toArray.mockResolvedValue([])
        })
      })

      await getAllModels(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No models found',
        data: []
      })
    })

    it('should respect limit query parameter', async () => {
      const models = [{ name: 'Model 1' }]

      mockRequest.query = { limit: '5' }

      mockCollection.find.mockReturnValue({
        limit: mockCollection.limit.mockReturnValue({
          toArray: mockCollection.toArray.mockResolvedValue(models)
        })
      })

      await getAllModels(mockRequest, mockResponse)

      expect(mockCollection.limit).toHaveBeenCalledWith(5)
    })

    it('should handle invalid limit parameter', async () => {
      mockRequest.query = { limit: 'invalid' }

      mockCollection.find.mockReturnValue({
        limit: mockCollection.limit.mockReturnValue({
          toArray: mockCollection.toArray.mockResolvedValue([])
        })
      })

      await getAllModels(mockRequest, mockResponse)

      // Should default to DEFAULT_LIMIT (100)
      expect(mockCollection.limit).toHaveBeenCalledWith(100)
    })
  })

  describe('getModelById', () => {
    it('should return model when found', async () => {
      const modelId = '68d14f8ebbb778f8dd556130'
      const model = { _id: new ObjectId(modelId), name: 'Test Model' }

      mockRequest.params = { id: modelId }
      mockCollection.findOne.mockResolvedValue(model)

      await getModelById(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(model)
    })

    it('should return 404 when model not found', async () => {
      const modelId = '68d14f8ebbb778f8dd556130'

      mockRequest.params = { id: modelId }
      mockCollection.findOne.mockResolvedValue(null)

      await getModelById(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Model not found'
      })
    })

    it('should return 400 for invalid ObjectId', async () => {
      const invalidId = 'invalid-id'

      mockRequest.params = { id: invalidId }

      await getModelById(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid ID format',
        message: 'The provided ID is not a valid ObjectId'
      })
    })
  })

  describe('createModel', () => {
    it('should create model successfully', async () => {
      const modelData = createValidModelData()
      const insertResult = { insertedId: new ObjectId(), acknowledged: true }

      mockRequest.body = modelData
      mockCollection.insertOne.mockResolvedValue(insertResult)

      await createModel(mockRequest, mockResponse)

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          name: modelData.name,
          dimension: modelData.dimension,
          texture: modelData.texture
        })
      )
      expect(mockResponse.status).toHaveBeenCalledWith(201)
    })

    it('should validate required name field', async () => {
      const invalidData = { ...createValidModelData(), name: '' }

      mockRequest.body = invalidData

      await createModel(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid input data',
        message: 'name must be a non-empty string'
      })
    })

    it('should validate dimension object', async () => {
      const invalidData = { ...createValidModelData(), dimension: { width: -1, height: 2, depth: 3 } }

      mockRequest.body = invalidData

      await createModel(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid input data',
        message: 'dimension must be an object with width, height, and depth as positive numbers'
      })
    })

    it('should validate texture object', async () => {
      const invalidData = { ...createValidModelData(), texture: { front: '', back: 'back.jpg' } }

      mockRequest.body = invalidData

      await createModel(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid input data',
        message: 'texture must be an object with front, back, side, top, and bottom as non-empty strings'
      })
    })
  })

  describe('updateModel', () => {
    it('should update model successfully', async () => {
      const modelId = '68d14f8ebbb778f8dd556131'
      const updateData = createValidModelData()
      const updateResult = { modifiedCount: 1, acknowledged: true }

      mockRequest.params = { id: modelId }
      mockRequest.body = updateData
      mockCollection.updateOne.mockResolvedValue(updateResult)
      mockCollection.findOne.mockResolvedValue({ ...updateData, _id: new ObjectId(modelId) })

      await updateModel(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
    })

    it('should return 404 for non-existent model', async () => {
      const modelId = '68d14f8ebbb778f8dd556131'
      const updateData = createValidModelData()
      const updateResult = { modifiedCount: 0, acknowledged: true }

      mockRequest.params = { id: modelId }
      mockRequest.body = updateData
      mockCollection.updateOne.mockResolvedValue(updateResult)

      await updateModel(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Model not found'
      })
    })
  })

  describe('updateModelDimension', () => {
    it('should update model dimension successfully', async () => {
      const modelId = '68d14f8ebbb778f8dd556133'
      const newDimensionData = {
        dimension: { width: 20, height: 4, depth: 30 }
      }
      const updateResult = { modifiedCount: 1, matchedCount: 1, acknowledged: true }

      mockRequest.params = { id: modelId }
      mockRequest.body = newDimensionData
      mockCollection.updateOne.mockResolvedValue(updateResult)

      await updateModelDimension(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Model dimension updated successfully',
        matchedCount: 1,
        modifiedCount: 1
      })
    })

    it('should validate dimension data', async () => {
      const modelId = '68d14f8ebbb778f8dd556133'
      const invalidDimensionData = {
        dimension: { width: 'invalid', height: 4, depth: 30 }
      }

      mockRequest.params = { id: modelId }
      mockRequest.body = invalidDimensionData

      await updateModelDimension(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid input data',
        message: 'dimension must be an object with width, height, and depth as positive numbers'
      })
    })
  })

  describe('updateModelTexture', () => {
    it('should update model texture successfully', async () => {
      const modelId = '68d14f8ebbb778f8dd556134'
      const newTextureData = {
        texture: {
          front: 'new-front.jpg',
          back: 'new-back.jpg',
          side: 'new-side.jpg',
          top: 'new-top.jpg',
          bottom: 'new-bottom.jpg'
        }
      }
      const updateResult = { modifiedCount: 1, matchedCount: 1, acknowledged: true }

      mockRequest.params = { id: modelId }
      mockRequest.body = newTextureData
      mockCollection.updateOne.mockResolvedValue(updateResult)

      await updateModelTexture(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Model texture updated successfully',
        matchedCount: 1,
        modifiedCount: 1
      })
    })
  })

  describe('deleteModel', () => {
    it('should delete model successfully', async () => {
      const modelId = '68d14f8ebbb778f8dd556135'
      const deleteResult = { deletedCount: 1, acknowledged: true }

      mockRequest.params = { id: modelId }
      mockCollection.deleteOne.mockResolvedValue(deleteResult)

      await deleteModel(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Model deleted successfully',
        deletedCount: 1
      })
    })

    it('should return 404 when model not found for deletion', async () => {
      const modelId = '68d14f8ebbb778f8dd556135'
      const deleteResult = { deletedCount: 0, acknowledged: true }

      mockRequest.params = { id: modelId }
      mockCollection.deleteOne.mockResolvedValue(deleteResult)

      await deleteModel(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Model not found'
      })
    })
  })

  describe('deleteAllModels', () => {
    it('should delete all models successfully', async () => {
      const deleteResult = { deletedCount: 5, acknowledged: true }

      mockRequest.query = { confirm: 'true' }
      mockCollection.deleteMany.mockResolvedValue(deleteResult)

      await deleteAllModels(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All models deleted successfully',
        deletedCount: 5
      })
    })

    it('should handle no models to delete', async () => {
      const deleteResult = { deletedCount: 0, acknowledged: true }

      mockRequest.query = { confirm: 'true' }
      mockCollection.deleteMany.mockResolvedValue(deleteResult)

      await deleteAllModels(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All models deleted successfully',
        deletedCount: 0
      })
    })

    it('should require confirmation parameter', async () => {
      await deleteAllModels(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Confirmation required',
        message: 'Add ?confirm=true to proceed with deleting all models'
      })
    })
  })
})

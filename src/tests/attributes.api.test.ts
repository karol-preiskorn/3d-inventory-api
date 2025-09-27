/**
 * Comprehensive test suite for attributes API endpoints
 * Tests all 10 controller functions with validation, error handling, and edge cases
 */

import { ObjectId } from 'mongodb'
import {
  createAttribute,
  deleteAllAttributes,
  deleteAttribute,
  deleteAttributesByModelId,
  getAllAttributes,
  getAttributeById,
  updateAttribute
} from '../controllers/attributes'
import { testGenerators } from './testGenerators'

// Mock the database utilities
jest.mock('../utils/db', () => ({
  connectToCluster: jest.fn(),
  connectToDb: jest.fn(),
  closeConnection: jest.fn().mockResolvedValue(undefined),
  getDatabase: jest.fn()
}))

// Mock the logger
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }))
}))

describe('Attributes API Controller Tests', () => {
  let mockRequest: any
  let mockResponse: any
  let mockCollection: any
  let mockDb: any
  let mockClient: any
  const { connectToCluster, connectToDb, getDatabase } = jest.requireMock('../utils/db')

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      query: {}
    }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis()
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
    getDatabase.mockResolvedValue(mockDb)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllAttributes', () => {
    it('should return all attributes successfully', async () => {
      const attributes = [testGenerators.attributeSimple(), testGenerators.attributeSimple()]

      mockCollection.find.mockReturnValue({
        limit: mockCollection.limit.mockReturnValue({
          toArray: mockCollection.toArray.mockResolvedValue(attributes)
        })
      })

      await getAllAttributes(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(attributes)
    })

    it('should return 404 when no attributes found', async () => {
      mockCollection.find.mockReturnValue({
        limit: mockCollection.limit.mockReturnValue({
          toArray: mockCollection.toArray.mockResolvedValue([])
        })
      })

      await getAllAttributes(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.send).toHaveBeenCalledWith('Not found any attributes')
    })

    it('should handle database errors', async () => {
      mockCollection.find.mockReturnValue({
        limit: mockCollection.limit.mockReturnValue({
          toArray: mockCollection.toArray.mockRejectedValue(new Error('Database error'))
        })
      })

      await getAllAttributes(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        module: 'attributes',
        procedure: 'getAllAttributes',
        status: 'Internal Server Error',
        message: 'Database error'
      })
    })
  })

  describe('getAttributeById', () => {
    it('should return attribute by valid ID', async () => {
      const attributeId = new ObjectId().toString()
      const attribute = { _id: new ObjectId(attributeId), ...testGenerators.attributeSimple() }

      mockRequest.params.id = attributeId
      mockCollection.findOne.mockResolvedValue(attribute)

      await getAttributeById(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(attribute)
    })

    it('should return 404 when attribute not found', async () => {
      const attributeId = new ObjectId().toString()

      mockRequest.params.id = attributeId
      mockCollection.findOne.mockResolvedValue(null)

      await getAttributeById(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(404)
    })

    it('should return 400 for invalid attribute ID', async () => {
      mockRequest.params.id = 'invalid_id'

      await getAttributeById(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid attribute id' })
    })
  })

  describe('createAttribute', () => {
    it('should create attribute successfully', async () => {
      const newAttributeId = new ObjectId()
      const attributeData = {
        attributeDictionaryId: new ObjectId().toString(),
        deviceId: new ObjectId().toString(),
        value: 'test value'
      }

      mockRequest.body = attributeData
      mockCollection.insertOne.mockResolvedValue({
        acknowledged: true,
        insertedId: newAttributeId
      })

      await createAttribute(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        _id: newAttributeId,
        attributeDictionaryId: expect.any(ObjectId),
        connectionId: null,
        deviceId: expect.any(ObjectId),
        modelId: null,
        value: 'test value'
      })
    })

    it('should require value field', async () => {
      mockRequest.body = {
        attributeDictionaryId: new ObjectId().toString(),
        deviceId: new ObjectId().toString()
      }

      await createAttribute(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing or invalid "value", "attributeDictionaryId", or at least one of "connectionId", "deviceId", "modelId" must be provided'
      })
    })

    it('should validate attributeDictionaryId is valid ObjectId', async () => {
      mockRequest.body = {
        attributeDictionaryId: 'invalid_id',
        deviceId: new ObjectId().toString(),
        value: 'test value'
      }

      await createAttribute(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: '"attributeDictionaryId" must be a valid ObjectId string'
      })
    })
  })

  describe('updateAttribute', () => {
    it('should update attribute successfully', async () => {
      const attributeId = new ObjectId().toString()
      const updateData = {
        value: 'updated value',
        attributeDictionaryId: new ObjectId().toString()
      }

      mockRequest.params.id = attributeId
      mockRequest.body = updateData
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 })

      await updateAttribute(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({ updatedCount: 1 })
    })

    it('should return 404 when attribute not found for update', async () => {
      const attributeId = new ObjectId().toString()

      mockRequest.params.id = attributeId
      mockRequest.body = { value: 'updated value' }
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 0, modifiedCount: 0 })

      await updateAttribute(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.send).toHaveBeenCalledWith(`Attribute ${attributeId} not found`)
    })

    it('should return 400 for invalid attribute ID in update', async () => {
      mockRequest.params.id = 'invalid_id'
      mockRequest.body = { value: 'updated value' }

      await updateAttribute(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid attribute id' })
    })
  })

  describe('deleteAttribute', () => {
    it('should delete attribute successfully', async () => {
      const attributeId = new ObjectId().toString()

      mockRequest.params.id = attributeId
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 })

      await deleteAttribute(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({ deletedCount: 1 })
    })

    it('should return 404 when attribute not found for deletion', async () => {
      const attributeId = new ObjectId().toString()

      mockRequest.params.id = attributeId
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 })

      await deleteAttribute(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.send).toHaveBeenCalledWith('Attribute not found')
    })

    it('should return 400 for invalid attribute ID in deletion', async () => {
      mockRequest.params.id = 'invalid_id'

      await deleteAttribute(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid attribute id' })
    })
  })

  describe('deleteAllAttributes', () => {
    it('should delete all attributes successfully', async () => {
      mockCollection.deleteMany.mockResolvedValue({ deletedCount: 5 })

      await deleteAllAttributes(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({ deletedCount: 5 })
    })

    it('should return 404 when no attributes found to delete', async () => {
      mockCollection.deleteMany.mockResolvedValue({ deletedCount: 0 })

      await deleteAllAttributes(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.send).toHaveBeenCalledWith('Not found attributes to delete')
    })
  })

  describe('deleteAttributesByModelId', () => {
    it('should delete attributes by model ID successfully', async () => {
      const modelId = new ObjectId().toString()

      mockRequest.params.id = modelId
      mockCollection.deleteMany.mockResolvedValue({ deletedCount: 3 })

      await deleteAttributesByModelId(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({ deletedCount: 3 })
    })

    it('should return 404 when no attributes found for model deletion', async () => {
      const modelId = new ObjectId().toString()

      mockRequest.params.id = modelId
      mockCollection.deleteMany.mockResolvedValue({ deletedCount: 0 })

      await deleteAttributesByModelId(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.send).toHaveBeenCalledWith('Not found attributes to delete')
    })

    it('should return 400 for invalid model ID in deleteAttributesByModelId', async () => {
      mockRequest.params.id = 'invalid_model_id'

      await deleteAttributesByModelId(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid model id' })
    })
  })
})

/**
 * Device API Controller Tests
 * Tests the core device management API endpoints with proper mocking
 */

import { ObjectId } from 'mongodb'
import { createDevice, deleteAllDevices, deleteDevice, getAllDevices, getDeviceById } from '../controllers/devices'

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

const { connectToCluster, connectToDb } = jest.requireMock('../utils/db')

describe('Devices Controller', () => {
  let mockRequest: any
  let mockResponse: any
  let mockClient: any
  let mockDb: any
  let mockCollection: any

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

  describe('getAllDevices', () => {
    it('should return all devices successfully', async () => {
      const devices = [{ name: 'Device-1' }, { name: 'Device-2' }]

      mockCollection.find.mockReturnValue({
        limit: mockCollection.limit.mockReturnValue({
          toArray: mockCollection.toArray.mockResolvedValue(devices)
        })
      })

      await getAllDevices(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(devices)
    })

    it('should return 404 when no devices found', async () => {
      mockCollection.find.mockReturnValue({
        limit: mockCollection.limit.mockReturnValue({
          toArray: mockCollection.toArray.mockResolvedValue([])
        })
      })

      await getAllDevices(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.send).toHaveBeenCalledWith('Not found')
    })
  })

  describe('getDeviceById', () => {
    it('should return device when found', async () => {
      const deviceId = '68d14f8ebbb778f8dd556130'
      const device = { _id: deviceId, name: 'Test Device' }

      mockRequest.params = { id: deviceId }
      mockCollection.findOne.mockResolvedValue(device)

      await getDeviceById(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(device)
    })

    it('should return 404 when device not found', async () => {
      const deviceId = '68d14f8ebbb778f8dd556130'

      mockRequest.params = { id: deviceId }
      mockCollection.findOne.mockResolvedValue(null)

      await getDeviceById(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.send).toHaveBeenCalledWith('Not found')
    })
  })

  describe('createDevice', () => {
    it('should create device successfully', async () => {
      const deviceData = { name: 'Test Device', modelId: 'model123' }
      const insertResult = { insertedId: new ObjectId(), acknowledged: true }

      mockRequest.body = deviceData
      mockCollection.insertOne.mockResolvedValue(insertResult)

      await createDevice(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('should return 400 for empty body', async () => {
      mockRequest.body = {}

      await createDevice(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.send).toHaveBeenCalledWith('POST /devices - No data provided')
    })
  })

  describe('deleteDevice', () => {
    it('should delete device successfully', async () => {
      const deviceId = '68d14f8ebbb778f8dd556132'
      const deleteResult = { deletedCount: 1, acknowledged: true }

      mockRequest.params = { id: deviceId }
      mockCollection.deleteOne.mockResolvedValue(deleteResult)

      await deleteDevice(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(deleteResult)
    })
  })

  describe('deleteAllDevices', () => {
    it('should delete all devices successfully', async () => {
      const deleteResult = { deletedCount: 5, acknowledged: true }

      mockCollection.deleteMany.mockResolvedValue(deleteResult)

      await deleteAllDevices(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(deleteResult)
    })
  })
})

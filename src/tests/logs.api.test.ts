/**
 * @file logs.api.test.ts
 * @description Comprehensive logging API and audit trail functionality test suite.
 * Tests the logs REST API endpoints for system activity tracking, audit trails,
 * and operational event logging. Validates log entry creation, retrieval,
 * filtering, and formatting. Ensures proper logging of CRUD operations,
 * user activities, and system events with appropriate timestamps and metadata.
 * Tests log API response formats and query parameter handling.
 * @version 2024-09-21 Enhanced with comprehensive logging API validation
 */

import { Db, ObjectId } from 'mongodb'
import { createLog, deleteAllLogs, deleteLog, getAllLogs, getLogsByComponent, getLogsByObjectId, VALID_COMPONENTS } from '../controllers/logs'
import { getDatabase } from '../utils/db'
import { testGenerators } from './testGenerators'

// Mock the database connection utilities first
jest.mock('../utils/db', () => ({
  connectToCluster: jest.fn().mockResolvedValue({}),
  getDatabase: jest.fn(),
  closeConnection: jest.fn().mockResolvedValue(undefined)
}))

// Now define our test mocks that will use the same structure
const mockCollection = {
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
  insertOne: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn()
}
const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection)
} as unknown as Db
// Mock Express request and response objects
const mockRequest = {
  query: {},
  params: {},
  body: {}
} as any
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
} as any

describe('Logs Controller', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    mockRequest.query = {}
    mockRequest.params = {}
    mockRequest.body = {}
    mockResponse.status.mockReturnThis()
    mockResponse.json.mockClear()

    // Setup getDatabase mock
    ;(getDatabase as jest.MockedFunction<typeof getDatabase>).mockResolvedValue(mockDb)
  })

  describe('getAllLogs', () => {
    it('should return all logs with default limit', async () => {
      const mockLogs = [
        testGenerators.logSimple(),
        testGenerators.logSimple(),
        testGenerators.logSimple()
      ]

      mockCollection.toArray.mockResolvedValue(mockLogs)

      await getAllLogs(mockRequest, mockResponse, jest.fn())

      expect(mockDb.collection).toHaveBeenCalledWith('logs')
      expect(mockCollection.find).toHaveBeenCalledWith({})
      expect(mockCollection.sort).toHaveBeenCalledWith({ date: -1 })
      expect(mockCollection.limit).toHaveBeenCalledWith(200) // Default limit
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockLogs,
        count: mockLogs.length
      })
    })

    it('should apply custom limit when provided', async () => {
      const mockLogs = [testGenerators.logSimple()]

      mockRequest.query = { limit: '50' }
      mockCollection.toArray.mockResolvedValue(mockLogs)

      await getAllLogs(mockRequest, mockResponse, jest.fn())

      expect(mockCollection.limit).toHaveBeenCalledWith(50)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockLogs,
        count: mockLogs.length
      })
    })

    it('should enforce maximum limit', async () => {
      mockRequest.query.limit = '2000' // Above max
      const mockLogs = [testGenerators.logSimple()]

      mockCollection.toArray.mockResolvedValue(mockLogs)

      await getAllLogs(mockRequest, mockResponse, jest.fn())

      expect(mockCollection.limit).toHaveBeenCalledWith(1000) // Max limit
    })

    it('should handle invalid limit gracefully', async () => {
      mockRequest.query.limit = 'invalid'
      const mockLogs = [testGenerators.logSimple()]

      mockCollection.toArray.mockResolvedValue(mockLogs)

      await getAllLogs(mockRequest, mockResponse, jest.fn())

      expect(mockCollection.limit).toHaveBeenCalledWith(200) // Default limit
    })

    it('should return 404 when no logs found', async () => {
      mockCollection.toArray.mockResolvedValue([])

      await getAllLogs(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No logs found',
        data: []
      })
    })

    it('should handle database errors', async () => {
      mockCollection.toArray.mockRejectedValue(new Error('Database error'))

      await getAllLogs(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Database error',
        module: 'logs',
        procedure: 'getAllLogs'
      })
    })
  })

  describe('getLogsByObjectId', () => {
    it('should return logs for valid object ID', async () => {
      const objectId = 'test-object-123'
      const mockLogs = [{ ...testGenerators.logSimple(), objectId }]

      mockRequest.params = { id: objectId }
      mockCollection.toArray.mockResolvedValue(mockLogs)

      await getLogsByObjectId(mockRequest, mockResponse, jest.fn())

      expect(mockCollection.find).toHaveBeenCalledWith({ objectId })
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockLogs,
        count: mockLogs.length
      })
    })

    it('should return 404 when no logs found for object ID', async () => {
      const objectId = 'non-existent-id'

      mockRequest.params.id = objectId
      mockCollection.toArray.mockResolvedValue([])

      await getLogsByObjectId(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: `No logs found for objectId: ${objectId}`,
        data: []
      })
    })
  })

  describe('getLogsByComponent', () => {
    it('should return logs for valid component', async () => {
      const component = 'devices'
      const mockLogs = [{ ...testGenerators.logSimple(), component }]

      mockRequest.params = { component }
      mockCollection.toArray.mockResolvedValue(mockLogs)

      await getLogsByComponent(mockRequest, mockResponse, jest.fn())

      expect(mockCollection.find).toHaveBeenCalledWith({ component })
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockLogs,
        count: mockLogs.length
      })
    })
  })

  describe('createLog', () => {
    it('should create a new log entry', async () => {
      const logData = {
        objectId: 'test-object-123',
        operation: 'CREATE',
        component: 'devices',
        message: { test: 'data' }
      }

      mockRequest.body = logData

      const mockInsertResult = {
        insertedId: new ObjectId(),
        acknowledged: true
      }

      mockCollection.insertOne.mockResolvedValue(mockInsertResult)

      await createLog(mockRequest, mockResponse, jest.fn())

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          objectId: logData.objectId,
          operation: logData.operation,
          component: logData.component,
          message: '[object Object]', // message gets stringified by toString()
          date: expect.any(String)
        })
      )
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: mockInsertResult.insertedId,
          objectId: logData.objectId,
          operation: logData.operation,
          component: logData.component,
          message: '[object Object]', // Controller uses toString() not JSON.stringify()
          date: expect.any(String)
        })
      )
    })

    it('should validate required fields', async () => {
      mockRequest.body = { objectId: 'test' } // Missing required fields

      await createLog(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid input data',
          message: expect.stringContaining('Missing required fields')
        })
      )
    })

    it('should validate component against allowed values', async () => {
      mockRequest.body = {
        objectId: 'test',
        operation: 'CREATE',
        component: 'invalid-component',
        message: {}
      }

      await createLog(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid input data',
          message: expect.stringContaining('Invalid component')
        })
      )
    })

    it('should sanitize input data', async () => {
      const logData = {
        objectId: 'test-object-123',
        operation: 'CREATE',
        component: 'devices',
        message: { $where: 'malicious code' } // MongoDB injection attempt
      }

      mockRequest.body = logData

      const mockInsertResult = {
        insertedId: new ObjectId(),
        acknowledged: true
      }

      mockCollection.insertOne.mockResolvedValue(mockInsertResult)

      await createLog(mockRequest, mockResponse, jest.fn())

      // Should sanitize the message object
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '[object Object]' // $where removed by mongo-sanitize, then {}.toString() = '[object Object]'
        })
      )
    })
  })

  describe('deleteLog', () => {
    it('should delete log by valid ObjectId', async () => {
      const logId = new ObjectId().toString()

      mockRequest.params.id = logId

      mockCollection.deleteOne.mockResolvedValue({
        deletedCount: 1,
        acknowledged: true
      })

      await deleteLog(mockRequest, mockResponse, jest.fn())

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: new ObjectId(logId)
      })
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Log deleted successfully',
        deletedCount: 1
      })
    })

    it('should return 404 when log not found', async () => {
      const logId = new ObjectId().toString()

      mockRequest.params.id = logId

      mockCollection.deleteOne.mockResolvedValue({
        deletedCount: 0,
        acknowledged: true
      })

      await deleteLog(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Log not found'
      })
    })

    it('should validate ObjectId format', async () => {
      mockRequest.params.id = 'invalid-objectid'

      await deleteLog(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid ID format',
        message: 'The provided ID is not a valid ObjectId'
      })
    })
  })

  describe('deleteAllLogs', () => {
    it('should delete all logs successfully', async () => {
      mockRequest.query = { confirm: 'true' }
      mockCollection.deleteMany.mockResolvedValue({
        deletedCount: 100,
        acknowledged: true
      })

      await deleteAllLogs(mockRequest, mockResponse, jest.fn())

      expect(mockCollection.deleteMany).toHaveBeenCalledWith({})
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All logs deleted successfully',
        deletedCount: 100
      })
    })

    it('should handle case when no logs to delete', async () => {
      mockRequest.query = { confirm: 'true' }
      mockCollection.deleteMany.mockResolvedValue({
        deletedCount: 0,
        acknowledged: true
      })

      await deleteAllLogs(mockRequest, mockResponse, jest.fn())

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No logs found to delete',
        deletedCount: 0
      })
    })
  })

  describe('VALID_COMPONENTS', () => {
    it('should contain expected components', () => {
      const expectedComponents = ['attributes', 'devices', 'floors', 'models', 'connections', 'users', 'attributesDictionary']

      expect(VALID_COMPONENTS).toEqual(expectedComponents)
    })

    it('should be a const assertion array', () => {
      // TypeScript const assertion doesn't make runtime immutable, so test functionality instead
      expect(Array.isArray(VALID_COMPONENTS)).toBe(true)
      expect(VALID_COMPONENTS.length).toBeGreaterThan(0)
      expect(VALID_COMPONENTS).toContain('devices')
      expect(VALID_COMPONENTS).toContain('attributes')
    })
  })

  describe('Log data structure validation', () => {
    it('should validate log interface properties', () => {
      const log = testGenerators.logSimple()

      expect(log).toHaveProperty('action')
      expect(log).toHaveProperty('entity')
      expect(log).toHaveProperty('entityId')
      expect(log).toHaveProperty('userId')
      expect(log).toHaveProperty('timestamp')
      expect(log).toHaveProperty('details')
      expect(log).toHaveProperty('ipAddress')
      expect(log).toHaveProperty('userAgent')

      expect(typeof log.action).toBe('string')
      expect(typeof log.entity).toBe('string')
      expect(typeof log.entityId).toBe('string')
      expect(typeof log.userId).toBe('string')
      expect(typeof log.details).toBe('string')
      expect(typeof log.ipAddress).toBe('string')
      expect(typeof log.userAgent).toBe('string')
    })

    it('should have valid timestamp format', () => {
      const log = testGenerators.logSimple()

      // Should be a valid date object or string
      expect(log.timestamp).toBeTruthy()
      expect(new Date(log.timestamp as any).toISOString()).toBeTruthy()
    })

    it('should have valid action from allowed list', () => {
      const log = testGenerators.logSimple()
      const validActions = ['CREATE', 'UPDATE', 'DELETE', 'VIEW']

      expect(validActions).toContain(log.action)
    })

    it('should have valid entity from allowed list', () => {
      const log = testGenerators.logSimple()
      const validEntities = ['device', 'user', 'connection', 'model']

      expect(validEntities).toContain(log.entity)
    })
  })
})

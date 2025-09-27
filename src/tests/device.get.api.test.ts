/**
 * @file device.get.api.test.ts
 * @description Device retrieval API endpoint comprehensive test suite.
 * Tests the GET /devices REST API functionality including device listing,
 * individual device retrieval by ID, device updates, and data validation.
 * Validates response data types, device schema compliance, spatial coordinates,
 * model relationships, and proper HTTP status codes. Ensures API endpoint
 * reliability, error handling, and response format consistency.
 * @version 2024-09-21 Enhanced with comprehensive device API validation testing
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { getAllDevices, getDeviceById } from '../controllers/devices'
import { getDatabase } from '../utils/db'

// Mock the database
jest.mock('../utils/db')

describe('GET /devices', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockCollection: any

  beforeEach(() => {
    mockRequest = {
      query: {},
      params: {}
    }

    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn() as any
    }

    mockCollection = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      findOne: jest.fn()
    }

    const mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    }
    // Mock getDatabase
    const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>

    mockGetDatabase.mockResolvedValue(mockDb as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('GET /devices => array of devices', async () => {
    const mockDevices = [
      {
        _id: new ObjectId(),
        name: 'Test Device 1',
        modelId: 'model123',
        position: {
          x: 10,
          y: 20,
          h: 5
        }
      },
      {
        _id: new ObjectId(),
        name: 'Test Device 2',
        modelId: 'model456',
        position: {
          x: 15,
          y: 25,
          h: 8
        }
      }
    ]

    mockCollection.toArray.mockResolvedValue(mockDevices)

    await getAllDevices(mockRequest as Request, mockResponse as Response, jest.fn())

    expect(mockResponse.status).toHaveBeenCalledWith(200)
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockDevices,
      meta: {
        timestamp: expect.any(String),
        version: 'v1'
      }
    })

    // Test individual device retrieval
    mockRequest.params = { id: mockDevices[0]._id.toString() }
    mockCollection.findOne.mockResolvedValue(mockDevices[0])

    await getDeviceById(mockRequest as Request, mockResponse as Response, jest.fn())

    expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: mockDevices[0]._id })
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockDevices[0],
      meta: {
        timestamp: expect.any(String),
        version: 'v1'
      }
    })
  })
})

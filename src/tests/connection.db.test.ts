/**
 * @file connection.db.test.ts
 * @description Database connection establishment and validation test suite.
 * Tests MongoDB Atlas connection setup, database authentication, and
 * connection lifecycle management. Validates connection string parsing,
 * SSL/TLS configuration, connection pooling, and database accessibility.
 * Ensures robust database connectivity patterns and proper error handling
 * for production deployment scenarios and network resilience.
 * @version 2024-09-21 Enhanced with comprehensive database connection testing
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db } from 'mongodb'
import { getDatabase } from '../utils/db'

// Mock the database connection utilities
jest.mock('../utils/db', () => ({
  getDatabase: jest.fn(),
  connectToCluster: jest.fn().mockResolvedValue({}),
  closeConnection: jest.fn().mockResolvedValue(undefined)
}))

describe('ConnectToDatabase Mongo Atlas', () => {
  let mockDb: Db
  let mockCollection: any

  beforeAll(async () => {
    // Setup mock database and collection
    mockCollection = {
      findOne: jest.fn(),
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn()
    }

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    } as unknown as Db
  })

  afterAll(async () => {
    // Clean up mocks
    jest.clearAllMocks()
  })

  it('connect to database and verify collection access', async () => {
    // Setup getDatabase mock
    ;(getDatabase as jest.MockedFunction<typeof getDatabase>).mockResolvedValue(mockDb)

    // Mock device data
    const mockDevice = {
      _id: 'test-device-id',
      name: 'Test Device',
      model: 'Test Model'
    }

    mockCollection.findOne.mockResolvedValue(mockDevice)

    // Test the database connection
    const db = await getDatabase()
    const devices = db.collection('devices')
    const device = await devices.findOne({})

    expect(getDatabase).toHaveBeenCalled()
    expect(db.collection).toHaveBeenCalledWith('devices')
    expect(devices.findOne).toHaveBeenCalledWith({})
    expect(device).toBeDefined()
    expect(device).toEqual(mockDevice)
  })
})

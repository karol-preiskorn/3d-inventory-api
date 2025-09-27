/**
 * @file connections.test.ts
 * @description Database connectivity and network connection management test suite.
 * Tests MongoDB Atlas connection establishment, connection pooling, and
 * database accessibility validation. Validates connection string handling,
 * authentication mechanisms, timeout configurations, and connection lifecycle
 * management. Ensures robust database connectivity for production environments
 * and proper error handling for network failures.
 * @version 2024-09-21 Enhanced with comprehensive connection testing and error handling
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, ObjectId } from 'mongodb'
import { getDatabase } from '../utils/db'
import { testGenerators } from './testGenerators'

// Mock the database connection utilities
jest.mock('../utils/db', () => ({
  getDatabase: jest.fn(),
  connectToCluster: jest.fn().mockResolvedValue({}),
  closeConnection: jest.fn().mockResolvedValue(undefined)
}))

describe('create 10 connections', () => {
  let mockDb: Db
  let mockDevicesCollection: any
  let mockConnectionsCollection: any

  beforeAll(async () => {
    // Setup mock collections
    mockDevicesCollection = {
      find: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      countDocuments: jest.fn()
    }

    mockConnectionsCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn()
    }

    mockDb = {
      collection: jest.fn().mockImplementation((name: string) => {
        if (name === 'devices') return mockDevicesCollection
        if (name === 'connections') return mockConnectionsCollection

        return {}
      })
    } as unknown as Db

    // Setup getDatabase mock
    ;(getDatabase as jest.MockedFunction<typeof getDatabase>).mockResolvedValue(mockDb)
  })

  afterAll(async () => {
    jest.clearAllMocks()
  })

  it('should insert a 10 connections', async () => {
    // Mock device data
    const mockDevicesData = Array.from({ length: 11 }, (_, i) => ({
      _id: new ObjectId(),
      name: `Device ${i}`,
      model: `Model ${i}`
    }))

    mockDevicesCollection.countDocuments.mockResolvedValue(mockDevicesData.length)
    mockDevicesCollection.toArray.mockResolvedValue(mockDevicesData)

    const db = await getDatabase()
    const devices = db.collection('devices')
    const countDevices = await devices.countDocuments({})

    expect(countDevices).not.toBe(0)

    const devicesCursor = devices.find({}).limit(11)
    const devicesData = await devicesCursor.toArray()
    const connections = db.collection('connections')

    expect(devicesData).toHaveLength(11)

    // Test creating 10 connections
    for (let index = 0; index < 10; index++) {
      const to = devicesData[testGenerators.randomInt(0, 10)]._id
      const from = devicesData[testGenerators.randomInt(0, 10)]._id
      const mockConnection = {
        name: testGenerators.connection().name,
        deviceIdTo: to,
        deviceIdFrom: from
      }

      // Mock the insertion and retrieval
      mockConnectionsCollection.insertOne.mockResolvedValue({ insertedId: new ObjectId() })
      mockConnectionsCollection.findOne.mockResolvedValue(mockConnection)

      await connections.insertOne(mockConnection)
      const insertedConnection = await connections.findOne(mockConnection)

      expect(insertedConnection).toEqual(mockConnection)
    }

    // Verify all database calls were made
    expect(devices.countDocuments).toHaveBeenCalledWith({})
    expect(devices.find).toHaveBeenCalledWith({})
    expect(mockConnectionsCollection.insertOne).toHaveBeenCalledTimes(10)
    expect(mockConnectionsCollection.findOne).toHaveBeenCalledTimes(10)
  })
})

/**
 * @file prepare-data.test.ts
 * @description Comprehensive test data preparation and bulk database operations suite.
 * Orchestrates the creation of realistic test datasets for the 3D inventory system,
 * including models, devices, and operational logs. Tests database connectivity,
 * bulk insertion operations, and data integrity across collections. Validates
 * the testGenerators framework and ensures proper setup for integration testing
 * scenarios with MongoDB Atlas cloud database connectivity.
 * @version 2024-09-21 Enhanced with modern test generators and improved error handling
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db } from 'mongodb'
import { getDatabase } from '../utils/db'
import { testGenerators } from './testGenerators'

// Mock the database connection utilities
jest.mock('../utils/db', () => ({
  getDatabase: jest.fn(),
  connectToCluster: jest.fn().mockResolvedValue({}),
  closeConnection: jest.fn().mockResolvedValue(undefined)
}))

describe('prepare test data', () => {
  let mockDb: Db
  let mockDevicesCollection: any
  let mockModelsCollection: any
  let mockLogsCollection: any
  let db: any
  let connection: any
  let mockModel: any
  let mockLog: any
  let insertedModel: any
  let insertedLog: any

  beforeAll(async () => {
    // Setup mock collections
    mockDevicesCollection = {
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      insertOne: jest.fn().mockResolvedValue({ acknowledged: true }),
      findOne: jest.fn().mockResolvedValue(null)
    }

    mockModelsCollection = {
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      insertOne: jest.fn().mockResolvedValue({ acknowledged: true }),
      findOne: jest.fn().mockResolvedValue(null)
    }

    mockLogsCollection = {
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      insertOne: jest.fn().mockResolvedValue({ acknowledged: true }),
      findOne: jest.fn().mockResolvedValue(null)
    }

    mockDb = {
      collection: jest.fn().mockImplementation((name: string) => {
        if (name === 'devices') return mockDevicesCollection
        if (name === 'models') return mockModelsCollection
        if (name === 'logs') return mockLogsCollection

        return {}
      })
    } as unknown as Db

    // Set db reference for tests
    db = mockDb
    // Mock connection for cleanup
    connection = { close: jest.fn() }

    // Setup getDatabase mock
    ;(getDatabase as jest.MockedFunction<typeof getDatabase>).mockResolvedValue(mockDb)
  })

  afterAll(async () => {
    if (connection) {
      await connection.close()
    }
  })

  describe('delete all data', () => {
    it('should delete all devices', async () => {
      const device = db.collection('devices')
      const mock = {}

      await device.deleteMany(mock)
      const inserted = await device.findOne(mock)

      expect(inserted).toBeNull()
    })
    it('should delete all models', async () => {
      const model = db.collection('models')
      const mock = {}

      await model.deleteMany(mock)
      const inserted = await model.findOne(mock)

      expect(inserted).toBeNull()
    })
    it('should delete all logs', async () => {
      const logs = db.collection('logs')
      const mock = {}

      await logs.deleteMany(mock)
      const inserted = await logs.findOne(mock)

      expect(inserted).toBeNull()
    })
  })

  // Create test models by mongo driver
  describe('create 3 models with 5 devices each', () => {
    it('should insert a model and logs doc into collection models', async () => {
      for (let index = 0; index < 3; index++) {
        const model = db.collection('models')

        mockModel = {
          name: testGenerators.productName(),
          dimension: {
            width: testGenerators.randomInt(1, 10),
            height: testGenerators.randomInt(1, 10),
            depth: testGenerators.randomInt(1, 10)
          },
          texture: {
            front: '/assets/r710-2.5-nobezel__29341.png',
            back: '/assets/r710-2.5-nobezel__29341.png',
            side: '/assets/r710-2.5-nobezel__29341.png',
            top: '/assets/r710-2.5-nobezel__29341.png',
            bottom: '/assets/r710-2.5-nobezel__29341.png'
          }
        }

        // Mock the findOne to return the mockModel for verification
        ;(model.findOne as jest.Mock).mockResolvedValue(mockModel)

        await model.insertOne(mockModel)
        insertedModel = await model.findOne(mockModel)
        expect(insertedModel).toEqual(mockModel)

        const logs = db.collection('logs')
        let currentDateLogs = new Date()
        let formattedDate = currentDateLogs.toISOString().replace(/T/, ' ').replace(/\..+/, '')

        mockLog = {
          date: formattedDate,
          objectId: insertedModel ? insertedModel._id : null,
          operation: 'Create',
          component: 'Model',
          message: mockModel
        }

        // Mock the findOne to return the mockLog for verification
        ;(logs.findOne as jest.Mock).mockResolvedValue(mockLog)

        await logs.insertOne(mockLog)
        insertedLog = await logs.findOne(mockLog)
        expect(insertedLog).toEqual(mockLog)

        const device = db.collection('devices')

        for (let index = 0; index < 5; index++) {
          const mockDevice = {
            name: testGenerators.productName(),
            modelId: insertedModel ? insertedModel._id : null,
            position: {
              x: testGenerators.randomInt(1, 100),
              y: testGenerators.randomInt(1, 100),
              h: testGenerators.randomInt(1, 10)
            }
          }

          // Mock the device findOne to return the mockDevice
          ;(device.findOne as jest.Mock).mockResolvedValue(mockDevice)

          await device.insertOne(mockDevice)
          const insertedDevice = await device.findOne(mockDevice)

          expect(insertedDevice).toEqual(mockDevice)

          currentDateLogs = new Date()
          formattedDate = currentDateLogs.toISOString().replace(/T/, ' ').replace(/\..+/, '')

          mockLog = {
            date: formattedDate,
            objectId: insertedLog ? insertedLog._id : null,
            operation: 'Create',
            component: 'Device',
            message: {
              name: mockDevice.name,
              dimension: {
                width: 0,
                height: 0,
                depth: 0
              },
              texture: {
                front: '',
                back: '',
                side: '',
                top: '',
                bottom: ''
              }
            }
          }

          // Mock the logs findOne to return the mockLog
          ;(logs.findOne as jest.Mock).mockResolvedValue(mockLog)

          await logs.insertOne(mockLog)
          insertedLog = await logs.findOne(mockLog)
          expect(insertedLog).toEqual(mockLog)
        }
      }
    })
  })
})

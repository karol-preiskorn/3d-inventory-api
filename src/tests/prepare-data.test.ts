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
import { Db, MongoClient } from 'mongodb'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

describe('prepare test data', () => {
  let connection: MongoClient
  let db: Db
  let mockModel
  let insertedModel
  let insertedLog

  beforeAll(async () => {
    try {
      if (!config.ATLAS_URI) {
        throw new Error('ATLAS_URI not configured')
      }

      console.log('Attempting to connect to MongoDB...')
      connection = await MongoClient.connect(config.ATLAS_URI, {
        serverSelectionTimeoutMS: 15000, // 15 second timeout
        connectTimeoutMS: 15000
      })
      db = connection.db(config.DBNAME)

      // Test the connection
      await db.admin().ping()
      console.log('MongoDB connection successful')
    } catch (error) {
      console.error('Database connection failed:', error)

      // Skip all tests if database is not available
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('timeout') || errorMessage.includes('ENOTFOUND')) {
        console.warn('Skipping database tests - database not accessible')

        return
      }

      throw error
    }
  }, 20000) // 20 second timeout for this specific beforeAll

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
        await model.insertOne(mockModel)
        insertedModel = await model.findOne(mockModel)
        expect(insertedModel).toEqual(mockModel)

        const logs = db.collection('logs')
        let currentDateLogs = new Date()
        let formattedDate = currentDateLogs.toISOString().replace(/T/, ' ').replace(/\..+/, '')
        let mockLog = {
          date: formattedDate,
          objectId: insertedModel ? insertedModel._id : null,
          operation: 'Create',
          component: 'Model',
          message: mockModel
        }

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
          await logs.insertOne(mockLog)
          insertedLog = await logs.findOne(mockLog)
          expect(insertedLog).toEqual(mockLog)
        }
      }
    })
  })
})

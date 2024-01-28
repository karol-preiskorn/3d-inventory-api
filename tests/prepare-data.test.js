/**
 * @file        /tests/device.test.ts
 * @description create device in mongo DB /api/devices
 *              https://jestjs.io/docs/bypassing-module-mocks
 * @version     2023-12-26 C2RLO - Initial
 **/

import { faker } from '@faker-js/faker'
import '../utils/loadEnvironment.js'
import { MongoClient } from 'mongodb'
import { deviceType, deviceCategory } from './deviceType.js'

describe('prepare test data', () => {
  let connection
  let db
  let mockModel
  let insertedModel
  let insertedLog

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.ATLAS_URI, {})
    db = await connection.db(process.env.DBNAME)
  })

  afterAll(async () => {
    await connection.close()
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
          name: faker.commerce.product() + ' ' + faker.color.human() + ' ' + faker.animal.type(),
          dimension: {
            width: faker.number.int({ min: 1, max: 10 }),
            height: faker.number.int({ min: 1, max: 10 }),
            depth: faker.number.int({ min: 1, max: 10 }),
          },
          texture: {
            front: '/assets/r710-2.5-nobezel__29341.png',
            back: '/assets/r710-2.5-nobezel__29341.png',
            side: '/assets/r710-2.5-nobezel__29341.png',
            top: '/assets/r710-2.5-nobezel__29341.png',
            botom: '/assets/r710-2.5-nobezel__29341.png',
          },
          type: faker.helpers.arrayElement(deviceType).name,
          category: faker.helpers.arrayElement(deviceCategory).name,
        }
        await model.insertOne(mockModel)
        insertedModel = await model.findOne(mockModel)
        expect(insertedModel).toEqual(mockModel)

        const logs = db.collection('logs')
        let currentDateLogs = new Date()
        let formattedDate = currentDateLogs.toISOString().replace(/T/, ' ').replace(/\..+/, '')

        let mockLog = {
          'date': formattedDate,
          'objectId': insertedModel._id,
          'operation': 'Create',
          'component': 'Model',
          'message': mockModel
        }

        await logs.insertOne(mockLog)
        insertedLog = await logs.findOne(mockLog)
        expect(insertedLog).toEqual(mockLog)

        const device = db.collection('devices')
        for (let index = 0; index < 5; index++) {
          const mockDevice = {
            name: faker.commerce.product() + ' ' + faker.color.human() + '-' + faker.animal.type(),
            modelId: insertedModel._id,
            position: {
              x: faker.number.int({ min: 1, max: 100 }),
              y: faker.number.int({ min: 1, max: 100 }),
              h: faker.number.int({ min: 1, max: 10 }),
            },
          }
          await device.insertOne(mockDevice)
          const insertedDevice = await device.findOne(mockDevice)
          expect(insertedDevice).toEqual(mockDevice)

          currentDateLogs = new Date()
          formattedDate = currentDateLogs.toISOString().replace(/T/, ' ').replace(/\..+/, '')

          mockLog = {
            'date': formattedDate,
            'objectId': insertedLog._id,
            'operation': 'Create',
            'component': 'Device',
            'message': mockDevice
          }
          await logs.insertOne(mockLog)
          insertedLog = await logs.findOne(mockLog)
          expect(insertedLog).toEqual(mockLog)
        }
      }
    })
  })
})

/**
 * @file /tests/attributes.gen.test copy.js
 * @module /tests
 * @description
 * @version 2024-01-30 C2RLO - Initial
**/



/**
 * @file /tests/log.test copy.js
 * @module /tests
 * @description
 * @version 2024-01-30 C2RLO - Initial
**/



/**
 * @file /tests/prepare-data.test copy.js
 * @module /tests
 * @description
 * @version 2024-01-27 C2RLO - Initial
**/



/**
 * @file        /tests/device.test.ts
 * @description create device in mongo DB /api/devices
 *              https://jestjs.io/docs/bypassing-module-mocks
 * @version     2023-12-26 C2RLO - Initial
 **/

import { faker } from '@faker-js/faker'
import '../utils/loadEnvironment.js'
import { MongoClient , ObjectId } from 'mongodb'
import { deviceType, deviceCategory } from './types.js'

describe('prepare test data', () => {
  let connection
  let db
  let mockModel
  let mockLog

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.ATLAS_URI, {})
    db = await connection.db(process.env.DBNAME)
  })

  afterAll(async () => {
    await connection.close()
  })

  // Create test models by mongo driver
  describe('create 3 logs', () => {
    it('should insert a log doc into collection logs', async () => {
      for (let index = 0; index < 3; index++) {

        const logs = db.collection('logs')
        const currentDateLogs = new Date()
        const formattedDate = currentDateLogs.toISOString().replace(/T/, ' ').replace(/\..+/, '')
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
        mockLog = {
          'date': formattedDate,
          'objectId': new ObjectId('659a4400672627600b093713'),
          'operation': 'Create',
          'component': 'Model',
          'message': mockModel
        }

        await logs.insertOne(mockLog)
        const insertedLog = await logs.findOne(mockLog)
        expect(insertedLog).toEqual(mockLog)
      }
    })
  })
})

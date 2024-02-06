/**
 * @file /tests/attributes.gen.test copy.js
 * @module /tests
 * @description test create attributesDictionary
 * @version 2024-01-30 C2RLO - Initial
 */


import { faker } from '@faker-js/faker'
import '../utils/loadEnvironment.js'
import { MongoClient , ObjectId } from 'mongodb'
import { valueAttributeCategory } from '../utils/types.js'

describe('test create attributesDictionary', () => {
  let connection
  let db
  let mockModel
  let mockLog
  let logs

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.ATLAS_URI, {})
    db = connection.db(process.env.DBNAME)
    logs = db.collection('logs')
  })

  afterAll(async () => {
    await connection.close()
  })

  // Create test models by mongo driver
  describe('create attributesDictionary documents', () => {
    it('should insert a attributesDictionary x10', async () => {
      for (let index = 0; index < 10; index++) {

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
          category: valueAttributeCategory[Math.floor(Math.random() * valueAttributeCategory.length)].name,
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

/**
 * @file /tests/log.test copy.js
 * @module /tests
 * @description
 * @version 2024-01-30 C2RLO - Initial
**/


import { faker } from '@faker-js/faker'
import '../utils/loadEnvironment.js'
import { MongoClient, ObjectId } from 'mongodb'
import { deviceType, deviceCategory, components } from './types.js'


describe('prepare AttributeDictionary and Attribute test data', () => {
  let connection
  let db
  let mockLog
  let attributes
  let attributeDictionary
  let logs

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.ATLAS_URI, {})
    db = await connection.db(process.env.DBNAME)

    attributes = db.collection('attributes')
    await attributes.deleteMany({})

    attributeDictionary = db.collection('attribute-dictionary')
    await attributeDictionary.deleteMany({})
  })

  afterAll(async () => {
    await connection.close()
  })

  describe('create 3 attributes dictonary', () => {
    it('should insert a 3 attributes', async () => {
      logs = db.collection('logs')
      attributeDictionary = db.collection('attribute-dictionary')
      attributes = db.collection('attributes')
      for (let index = 0; index < 3; index++) {
        const currentDateLogs = new Date()
        const formattedDate = currentDateLogs.toISOString().replace(/T/, ' ').replace(/\..+/, '')

        const mockAttributesDictionary = {
          category: deviceCategory[Math.floor(Math.random() * deviceCategory.length)].name,
          type: deviceType[Math.floor(Math.random() * deviceType.length)].name,
          component: components[Math.floor(Math.random() * components.length)].component,
          name: faker.commerce.product() + ' ' + faker.color.human(),
        }
        await attributeDictionary.insertOne(mockAttributesDictionary)
        const insertedAttributesDictionary = await attributeDictionary.findOne(mockAttributesDictionary)
        expect(insertedAttributesDictionary).toEqual(mockAttributesDictionary)

        mockLog = {
          'date': formattedDate,
          'objectId': new ObjectId(insertedAttributesDictionary._id),
          'operation': 'Create',
          'component': 'AttributeDictionary',
          'message': mockAttributesDictionary
        }
        await logs.insertOne(mockLog)
        const insertedLog = await logs.findOne(mockLog)
        expect(insertedLog).toEqual(mockLog)

        for (let j = 0; j < 3; j++) {
          const mockAttributes = {
            attributeDictionaryId: new ObjectId(insertedAttributesDictionary._id),
            connectionId: new ObjectId(),
            deviceId: new ObjectId(),
            modelId: new ObjectId(),
            name: faker.commerce.product() + ' ' + faker.color.human(),
            value: faker.animal.type(),
          }
          await attributes.insertOne(mockAttributes)
          const insertedAttributes = await attributes.findOne(mockAttributes)
          expect(insertedAttributes).toEqual(mockAttributes)

          mockLog = {
            'date': formattedDate,
            'objectId': new ObjectId(insertedAttributes._id),
            'operation': 'Create',
            'component': 'Attributes',
            'message': mockAttributes
          }
          await logs.insertOne(mockLog)
          const insertedLog = await logs.findOne(mockLog)
          expect(insertedLog).toEqual(mockLog)
        }
      }
    })
  })
})

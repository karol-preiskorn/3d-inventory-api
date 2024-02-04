/* eslint-disable jest/no-conditional-expect */
/**
 * @file /tests/log.test copy.js
 * @module /tests
 * @description
 * @version 2024-01-30 C2RLO - Initial
 */

import { faker } from '@faker-js/faker'
import '../utils/loadEnvironment.js'
import { MongoClient, ObjectId } from 'mongodb'
import { valueAttributeType, valueAttributeCategory, components } from '../utils/types.js'
import { capitalizeFirstLetter } from '../utils/strings.js'


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

    attributeDictionary = db.collection('attributesDictionary')
    await attributeDictionary.deleteMany({})
  })

  afterAll(async () => {
    await connection.close()
  })

  describe('create 3 attributes dictionary', () => {
    it('should insert a 3 attributes', async () => {
      logs = db.collection('logs')
      attributeDictionary = db.collection('attributesDictionary')
      attributes = db.collection('attributes')

      const allowed = [true]
      const filteredComponents = components.filter((item) => allowed.includes(item.attributes))

      for (let i = 0; i < filteredComponents.length; i++) {
        const currentDateLogs = new Date()
        const formattedDate = currentDateLogs.toISOString().replace(/T/, ' ').replace(/\..+/, '')
        const randomComponent = filteredComponents[Math.floor(Math.random() * filteredComponents.length)].component
        const allowedAttributeCategory = [filteredComponents[i].component]
        const filteredAttributeCategory = valueAttributeCategory.filter((item) => allowedAttributeCategory.includes(item.component))

        const mockAttributesDictionary = {
          name: capitalizeFirstLetter(faker.hacker.noun()) + ' ' + capitalizeFirstLetter(faker.color.human()) + ' ' + capitalizeFirstLetter(faker.commerce.product()),
          component: filteredComponents[i].component,
          type: valueAttributeType[Math.floor(Math.random() * valueAttributeType.length)].type,
          category: filteredAttributeCategory[Math.floor(Math.random() * filteredAttributeCategory.length)].name,
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
        // const error = await getError(async () => logs.findOne(mockLog))
        const insertedLog = await logs.findOne(mockLog)
        // check that the returned error wasn't that no error was thrown
        // expect(error).not.toBeInstanceOf(NoErrorThrownError)
        // expect(error).toBe(mockLog)
        expect(insertedLog).toEqual(mockLog)

        if (['Devices', 'Connections', 'Models'].indexOf(randomComponent) > -1) {
          for (let j = 0; j < 3; j++) {
            const mockAttributes = {
              attributeDictionaryId: new ObjectId(insertedAttributesDictionary._id),
              connectionId: new ObjectId(),
              deviceId: new ObjectId(),
              modelId: new ObjectId(),
              name: faker.commerce.product() + ' ' + faker.color.human(),
              value: faker.commerce.productAdjective(),
            }
            await attributes.insertOne(mockAttributes)
            const insertedAttributes = await attributes.findOne(mockAttributes)

            const isEqual = insertedAttributes === mockAttributes
            expect(isEqual).toBe(true)

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
      }
    })
  })
})

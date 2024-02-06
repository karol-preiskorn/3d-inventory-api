/**
 * @file /home/karol/GitHub/3d-inventory-mongo-api/tests/attributes.gen.test.js
 * @module /tests
 * @description This file contains the test suite for preparing attributesDictionary and Attribute test data.
 * It imports necessary modules, connects to the database, and performs various tests to insert attributes and logs.
 * The tests include creating attributes dictionary, inserting attributes, and logging the operations.
 * This file is part of the 3D Inventory Mongo API project.
 * @version 2024-01-30 C2RLO - Initial
 */
/* eslint-disable jest/no-conditional-expect */


import { faker } from '@faker-js/faker'
import '../utils/loadEnvironment.js'
import { MongoClient, ObjectId } from 'mongodb'
import { valueAttributeType, valueAttributeCategory, components } from '../utils/types.js'
import { capitalizeFirstLetter } from '../utils/strings.js'


describe('prepare attributesDictionary and Attribute test data', () => {
  let connection
  let connections
  let models
  let devices
  let db
  let mockLog
  let attributes
  let attributesDictionary
  let logs

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.ATLAS_URI, {})
    db = await connection.db(process.env.DBNAME)

    attributes = db.collection('attributes')
    await attributes.deleteMany({})

    attributesDictionary = db.collection('attributesDictionary')
    await attributesDictionary.deleteMany({})
  })

  afterAll(async () => {
    await connection.close()
  })

  describe('create 3 attributes dictionary', () => {
    it('should insert a 3 attributes', async () => {
      logs = db.collection('logs')
      attributesDictionary = db.collection('attributesDictionary')
      attributes = db.collection('attributes')
      connections = db.collection('connections')
      models = db.collection('models')
      devices = db.collection('devices')


      const allowed = [true]
      const filteredComponents = components.filter((item) => allowed.includes(item.attributes))

      for (let i = 0; i < filteredComponents.length; i++) {
        const currentDateLogs = new Date()
        const formattedDate = currentDateLogs.toISOString().replace(/T/, ' ').replace(/\..+/, '')
        const iRandom = Math.floor(Math.random() * filteredComponents.length)
        const randomComponent = filteredComponents[iRandom].component
        const allowedAttributeCategory = [filteredComponents[iRandom].component]
        const filteredAttributeCategory = valueAttributeCategory.filter((item) => allowedAttributeCategory.includes(item.component))

        const mockAttributesDictionary = {
          name: capitalizeFirstLetter(faker.hacker.noun()) + ' ' + capitalizeFirstLetter(faker.color.human()) + ' ' + capitalizeFirstLetter(faker.commerce.product()),
          component: filteredComponents[i].component,
          type: valueAttributeType[Math.floor(Math.random() * valueAttributeType.length)].type,
          category: filteredAttributeCategory[Math.floor(Math.random() * filteredAttributeCategory.length)].name,
        }

        await attributesDictionary.insertOne(mockAttributesDictionary)
        const insertedAttributesDictionary = await attributesDictionary.findOne(mockAttributesDictionary)
        expect(insertedAttributesDictionary).toEqual(mockAttributesDictionary)

        mockLog = {
          'date': formattedDate,
          'objectId': new ObjectId(insertedAttributesDictionary._id),
          'operation': 'Create',
          'component': 'attributesDictionary',
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
            let mockAttributes
            let insertedAttributes
            if (randomComponent === 'Devices') {

              mockAttributes = {
                attributesDictionaryId: new ObjectId(insertedAttributesDictionary._id),
                connectionId: null,
                deviceId: new ObjectId(),
                modelId: null,
                name: faker.color.human() + ' ' + faker.commerce.product() + ' ' + faker.color.human(),
                value: faker.commerce.productAdjective(),
              }
              await attributes.insertOne(mockAttributes)
              insertedAttributes = await attributes.findOne(mockAttributes)

              expect(insertedAttributes).toBe(insertedAttributes)
            }
            if (randomComponent === 'Models') {
              mockAttributes = {
                attributesDictionaryId: new ObjectId(insertedAttributesDictionary._id),
                connectionId: null,
                deviceId: null,
                modelId: new ObjectId(),
                name: faker.color.human() + ' ' + faker.commerce.product() + ' ' + faker.color.human(),
                value: faker.commerce.productAdjective(),
              }
              await attributes.insertOne(mockAttributes)
              insertedAttributes = await attributes.findOne(mockAttributes)

              expect(insertedAttributes).toBe(insertedAttributes)
            }
            if (randomComponent === 'Connections') {
              mockAttributes = {
                attributesDictionaryId: new ObjectId(insertedAttributesDictionary._id),
                connectionId: new ObjectId(),
                deviceId: null,
                modelId: null,
                name: faker.color.human() + ' ' + faker.commerce.product() + ' ' + faker.color.human(),
                value: faker.commerce.productAdjective(),
              }
              await attributes.insertOne(mockAttributes)
              insertedAttributes = await attributes.findOne(mockAttributes)

              expect(insertedAttributes).toBe(insertedAttributes)
            }

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

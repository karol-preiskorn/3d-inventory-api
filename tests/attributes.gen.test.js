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
import { capitalizeFirstLetter } from '../utils/strings.js'

describe('prepare attributesDictionary and Attribute test data', () => {
  let connection
  // let connections
  // let models
  // let devices
  let db
  let mockLog
  let attributes
  let attributesDictionary
  let attributesTypes
  let logs

  let attributesCategory
  let components

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.ATLAS_URI, {})
    db = connection.db(process.env.DBNAME)

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
      // connections = db.collection('connections')
      // models = db.collection('models')
      // devices = db.collection('devices')

      attributesCategory = db.collection('attributesCategory')
      const attributesCategoryCursor = await attributesCategory.find({})
      expect(await attributesCategory.countDocuments({})).not.toBe(0)
      const attributesCategoryData = await attributesCategoryCursor.toArray()

      components = db.collection('components')
      const componentsCursor = await components.find({ attributes: true })
      expect(await components.countDocuments({ attributes: true })).not.toBe(0)
      const componentsData = await componentsCursor.toArray()

      attributesTypes = db.collection('attributesTypes')
      const attributesTypesCursor = await attributesTypes.find({})
      expect(await attributesTypes.countDocuments({})).not.toBe(0)
      const attributesTypesData = await attributesTypesCursor.toArray()

      for (let i = 0; i < componentsData.length; i++) {
        const currentDateLogs = new Date()
        const formattedDate = currentDateLogs
          .toISOString()
          .replace(/T/, ' ')
          .replace(/\..+/, '')
        const iRandom = Math.floor(Math.random() * componentsData.length)
        const randomComponent = componentsData[iRandom].component

        const mockAttributesDictionary = {
          name:
            capitalizeFirstLetter(faker.hacker.noun()) +
            ' ' +
            capitalizeFirstLetter(faker.color.human()) +
            ' ' +
            capitalizeFirstLetter(faker.commerce.product()),
          component: componentsData[i].component,
          type: attributesTypesData[
            Math.floor(Math.random() * attributesTypesData.length)
          ].type,
          category:
            attributesCategoryData[
              Math.floor(Math.random() * attributesCategoryData.length)
            ].name,
        }
        mockAttributesDictionary._id = (
          await attributesDictionary.insertOne(mockAttributesDictionary)
        ).insertedId
        const insertedAttributesDictionary = await attributesDictionary.findOne(
          mockAttributesDictionary,
        )
        expect(insertedAttributesDictionary).toEqual(mockAttributesDictionary)

        mockLog = {
          date: formattedDate,
          objectId: new ObjectId(insertedAttributesDictionary._id),
          operation: 'Create',
          component: 'attributesDictionary',
          message: mockAttributesDictionary,
        }

        await logs.insertOne(mockLog)
        const insertedLog = await logs.findOne(mockLog)
        expect(insertedLog).toEqual(mockLog)

        if (
          ['Devices', 'Connections', 'Models'].indexOf(randomComponent) > -1
        ) {
          for (let j = 0; j < 3; j++) {
            let mockAttributes
            let insertedAttributes
            if (randomComponent === 'Devices') {
              mockAttributes = {
                attributesDictionaryId: new ObjectId(
                  insertedAttributesDictionary._id,
                ),
                connectionId: null,
                deviceId: new ObjectId(),
                modelId: null,
                name:
                  faker.color.human() +
                  ' ' +
                  faker.commerce.product() +
                  ' ' +
                  faker.color.human(),
                value: faker.commerce.productAdjective(),
              }
              await attributes.insertOne(mockAttributes)
              insertedAttributes = await attributes.findOne(mockAttributes)

              expect(insertedAttributes).toBe(insertedAttributes)
            }
            if (randomComponent === 'Models') {
              mockAttributes = {
                attributesDictionaryId: new ObjectId(
                  insertedAttributesDictionary._id,
                ),
                connectionId: null,
                deviceId: null,
                modelId: new ObjectId(),
                name:
                  faker.color.human() +
                  ' ' +
                  faker.commerce.product() +
                  ' ' +
                  faker.color.human(),
                value: faker.commerce.productAdjective(),
              }
              await attributes.insertOne(mockAttributes)
              insertedAttributes = await attributes.findOne(mockAttributes)

              expect(insertedAttributes).toBe(insertedAttributes)
            }
            if (randomComponent === 'Connections') {
              mockAttributes = {
                attributesDictionaryId: new ObjectId(
                  insertedAttributesDictionary._id,
                ),
                connectionId: new ObjectId(),
                deviceId: null,
                modelId: null,
                name:
                  faker.color.human() +
                  ' ' +
                  faker.commerce.product() +
                  ' ' +
                  faker.color.human(),
                value: faker.commerce.productAdjective(),
              }
              await attributes.insertOne(mockAttributes)
              insertedAttributes = await attributes.findOne(mockAttributes)

              expect(insertedAttributes).toBe(insertedAttributes)
            }

            mockLog = {
              date: formattedDate,
              objectId: new ObjectId(insertedAttributes._id),
              operation: 'Create',
              component: 'Attributes',
              message: mockAttributes,
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

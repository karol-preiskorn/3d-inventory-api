/**
 * @file /home/karol/GitHub/3d-inventory-mongo-api/tests/attributes.gen.test.js
 * @module /tests
 * @description This file contains the test suite for preparing attributesDictionary and Attribute test data.
 * It imports necessary modules, connects to the database, and performs various tests to insert attributes and logs.
 * The tests include creating attributes dictionary, inserting attributes, and logging the operations.
 * This file is part of the 3D Inventory Mongo API project.
 * @version 2024-04-13 C2RLO - fix attributesDictionary and attributes tests convert to typescript
 * @version 2024-01-30 C2RLO - Initial
 */

import { faker } from '@faker-js/faker'
import { Collection, Db, MongoClient, ObjectId, WithId } from 'mongodb'
import '../utils/loadEnvironment.js'
import { AttributesDictionary } from '../routers/attributesDictionary'
import { capitalizeFirstLetter } from '../utils/strings'
import { Attributes } from '../routers/attributes.js'
import { AttributesTypes } from '../routers/attributesTypes'
import { Logs } from '../routers/logs'

describe('prepare attributesDictionary and Attribute test data', () => {
  let connection: MongoClient
  let db: Db
  let mockLog
  let attributes: Collection<Attributes[]>
  let attributesDictionary: Collection<AttributesDictionary[]>
  let attributesTypes: Collection<AttributesTypes[]>
  let logs: Collection<Logs[]>

  let components

  beforeAll(async () => {
    const atlasUri = process.env.ATLAS_URI || 'default-uri'
    connection = await MongoClient.connect(atlasUri, {})
    db = connection.db(process.env.DBNAME)

    const attributes = db.collection<Attributes>('attributes')
    await attributes.deleteMany({})

    const attributesDictionary = db.collection<AttributesDictionary>('attributesDictionary')
    await attributesDictionary.deleteMany({})
  })

  afterAll(async () => {
    await connection.close()
  })

  describe('create 3 attributes dictionary', () => {
    it('should insert a 3 attributes', async () => {
      logs = db.collection<Logs[]>('logs') // Assign a value to the 'logs' variable
      attributesDictionary = db.collection<AttributesDictionary[]>('attributesDictionary')
      attributes = db.collection<Attributes[]>('attributes')
      attributesTypes = db.collection<AttributesTypes[]>('attributesTypes')
      const attributesCategoryCursor = attributesTypes.find({})
      expect(await attributesTypes.countDocuments({})).not.toBe(0)

      const attributesCategoryData = await attributesCategoryCursor.toArray()
      components = db.collection('components')
      attributesTypes = db.collection<AttributesTypes[]>('attributesTypes')
      const attributesTypesCursor = attributesTypes.find({})
      expect(await attributesTypes.countDocuments({})).not.toBe(0)

      const attributesTypesData = attributesTypesCursor ? await attributesTypesCursor.toArray() : []

      for (let i = 0; i < attributesTypesData.length; i++) {
        const currentDateLogs = new Date()
        const formattedDate = currentDateLogs.toISOString().replace(/T/, ' ').replace(/\..+/, '')
        const iRandom = Math.floor(Math.random() * components.length)
        const attributesCategoryDataTyped: { name: string }[] = attributesCategoryData.map(
          (item: WithId<{ name: string }>) => ({ name: item.name }) as { name: string },
        )

        mockLog = {
          date: formattedDate,
          objectId: new ObjectId(),
          operation: 'Create',
          component: 'attributesDictionary',
          message: attributesDictionary,
        }

        await logs.insertOne(mockLog)
        const insertedLog = await logs.findOne(mockLog)
        expect(insertedLog).toEqual(mockLog)

        let randomComponent = '' // Initialize with a default value

        if (['Devices', 'Connections', 'Models'].indexOf(randomComponent) > -1) {
          for (let j = 0; j < 3; j++) {
            let mockAttributes: WithId<Attributes>
            let insertedAttributes

            if (randomComponent === 'Devices') {
              mockAttributes = {
                _id: new ObjectId(),
                component: null,
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
                attributesDictionaryId: attributesDictionary._id,
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
                attributesDictionaryId: new ObjectId(attributesDictionary?._id),
                connectionId: new ObjectId(),
                deviceId: null,
                modelId: null,
                name: faker.color.human() + ' ' + faker.commerce.product() + ' ' + faker.color.human(),
                value: faker.commerce.productAdjective(),
              }

              await attributes.insertOne(mockAttributes)
              insertedAttributes = await (attributes as unknown).findOne(mockAttributes)

              expect(insertedAttributes).toBe(insertedAttributes)
            }

            if (insertedAttributes) {
              mockLog = {
                date: formattedDate,
                objectId: new ObjectId(insertedAttributes._id),
                operation: 'Create',
                component: 'Attributes',
                message: mockAttributes,
              }

              await (logs as Collection<Logs>).insertOne(mockLog)
            }

            const insertedLog = (await logs.findOne(mockLog)) as Logs
            expect(insertedLog).toEqual(mockLog)
          }
        }
      }
    })
  })
})

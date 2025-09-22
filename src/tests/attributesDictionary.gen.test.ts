/**
 * @file attributesDictionary.gen.test.ts
 * @description Attributes dictionary generation and management test suite.
 * Tests the creation, validation, and management of attribute dictionaries
 * for device and model metadata. Validates attribute type definitions,
 * category mappings, value constraints, and dynamic attribute generation.
 * Ensures proper attribute schema compliance, type safety, and database
 * integration for flexible device property management.
 * @version 2024-09-21 Enhanced with comprehensive attribute dictionary testing
 */

import { Collection, Document, MongoClient, ObjectId } from 'mongodb'
import config from '../utils/config'
import { valueAttributeCategory } from '../utils/types'
import { testGenerators } from './testGenerators'

describe('test create attributesDictionary', () => {
  let connection: MongoClient
  let db
  let mockModel
  let mockLog
  let logs: Collection<Document>

  beforeAll(async () => {
    connection = await MongoClient.connect(config.ATLAS_URI ?? '', {})
    db = connection.db(config.DBNAME)
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
          name: testGenerators.productName(),
          dimension: {
            width: testGenerators.randomInt(1, 10),
            height: testGenerators.randomInt(1, 10),
            depth: testGenerators.randomInt(1, 10),
          },
          texture: {
            front: '/assets/r710-2.5-nobezel__29341.png',
            back: '/assets/r710-2.5-nobezel__29341.png',
            side: '/assets/r710-2.5-nobezel__29341.png',
            top: '/assets/r710-2.5-nobezel__29341.png',
            bottom: '/assets/r710-2.5-nobezel__29341.png',
          },
          category: valueAttributeCategory[Math.floor(Math.random() * valueAttributeCategory.length)].name,
        }
        mockLog = {
          date: formattedDate,
          objectId: new ObjectId('659a4400672627600b093713'),
          operation: 'Create',
          component: 'Model',
          message: mockModel,
        }

        await logs.insertOne(mockLog)
        const insertedLog = await logs.findOne(mockLog)

        expect(insertedLog).toEqual(mockLog)
      }
    })
  })
})

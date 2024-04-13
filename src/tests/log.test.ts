/**
 * @file /tests/prepare-data.test copy.js
 * @description This file contains the test suite for preparing test data. It imports necessary modules, connects to the database, and performs various tests to insert logs and models.
 *
 * @version 2024-01-27 C2RLO - Initial
 */

import { faker } from '@faker-js/faker'
import '../utils/loadEnvironment'
import { Db, MongoClient, ObjectId, OptionalId } from 'mongodb'
import { Log } from '../routers/logs'
import { formatDate } from 'date-fns'


describe('prepare test data', () => {
  let connection: MongoClient | undefined
  let db: Db
  let mockLog: OptionalId<Log>

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.ATLAS_URI || '', {})
    db = connection.db(process.env.DBNAME)
  })

  afterAll(async () => {
    await connection?.close()
  })

  // Create test models by mongo driver
  describe('create 3 logs', () => {
    it('should insert a log doc into collection logs', async () => {
      const attributesCategory = db.collection('attributesCategory')
      const attributesCategoryCursor = attributesCategory.find({})
      expect(await attributesCategory.countDocuments({})).not.toBe(0)
      const attributesCategoryData = await attributesCategoryCursor.toArray()

      const components = db.collection('components')
      const componentsCursor = components.find({ attributes: true })
      expect(await components.countDocuments({ attributes: true })).not.toBe(0)
      const componentsData = await componentsCursor.toArray()

      const attributesTypes = db.collection('attributesTypes')
      const attributesTypesCursor = attributesTypes.find({})
      expect(await attributesTypes.countDocuments({})).not.toBe(0)
      const attributesTypesData = await attributesTypesCursor.toArray()

      for (let index = 0; index < 3; index++) {
        const logs = db.collection('logs')
        const arrayElement = (array: string[]): string => faker.helpers.arrayElement(array);
        const mockModel = {
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
          type: 'string',
          category: 'string',
        };

        const formattedDate: string = formatDate(new Date(), 'yyyy-MM-dd');
        mockLog = {
          date: formattedDate,
          objectId: new ObjectId('659a4400672627600b093713').toString(),
          operation: 'Create',
          component: 'Model',
          message: JSON.stringify(mockModel),
        } as OptionalId<Log>;

        await logs.insertOne(mockLog)
        const insertedLog = await logs.findOne(mockLog)
        expect(insertedLog).toEqual(mockLog)
      }
    })
  })
})

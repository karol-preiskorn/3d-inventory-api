/**
 * @file        index.js
 * @description Create models and insert them into the database
 * @version 2023-11-26  C2RLO  Add mongo test
 * @version 2023-11-20  C2RLO  Add logger
 * @version 2023-10-29  C2RLO  Init
 */

import { faker } from '@faker-js/faker'
import '../utils/loadEnvironment.js'
import { Db, MongoClient } from 'mongodb'

describe('create 3 models', () => {
  let connection: MongoClient
  let db: Db
  let mockModel
  let insertedModel

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.ATLAS_URI as string, {})
    db = connection.db(process.env.DBNAME)
  })

  afterAll(async () => {
    await connection.close()
  })

  it('should insert a 10 models', async () => {
    const attributesTypes = db.collection('attributesTypes')
    const attributesTypesCursor = attributesTypes.find({
      component: 'Devices',
    })
    expect(await attributesTypes.countDocuments({})).not.toBe(0)
    // const attributesTypesData = await attributesTypesCursor.toArray()
    for (let index = 0; index < 10; index++) {
      const models = db.collection('models')
      // const attributesTypesData: { name: string }[] = await attributesTypesCursor.toArray().then(data => data.map((doc: { name: string }) => ({ name: doc.name })));
      mockModel = {
        name:
          faker.commerce.product() +
          ' ' +
          faker.color.human() +
          ' ' +
          faker.animal.type(),
        dimension: {
          width: faker.number.int({ min: 1, max: 10 }),
          height: faker.number.int({ min: 1, max: 10 }),
          depth: faker.number.int({ min: 1, max: 10 }),
        },
        texture: {
          front: '/assets/texture/r710-2.5-nobezel__29341.png',
          back: '/assets/texture/r710-2.5-nobezel__29341.png',
          side: '/assets/texture/r710-2.5-nobezel__29341.png',
          top: '/assets/texture/r710-2.5-nobezel__29341.png',
          bottom: '/assets/texture/r710-2.5-nobezel__29341.png',
        },
        // type: faker.helpers.arrayElement(attributesTypesData).name,
      }
      await models.insertOne(mockModel)
      insertedModel = await models.findOne(mockModel)
      expect(insertedModel).toEqual(mockModel)
    }
  })
})

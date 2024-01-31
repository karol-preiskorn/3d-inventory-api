/*
 * File:        index.js
 * Description: Connect to MongoDB 3d-inventory claster
 * Used by:     testing connect to Mongo Atlas
 * Dependency:  .env (not push to git)
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-11-26  C2RLO  Add mongo test
 * 2023-11-20  C2RLO  Add logger
 * 2023-10-29  C2RLO  Init
 */

import { faker } from '@faker-js/faker'
import '../utils/loadEnvironment.js'
import { deviceType, deviceCategory } from './deviceType.js'
import { MongoClient } from 'mongodb'

describe('create 3 models', () => {
  let connection
  let db
  let mockModel
  let insertedModel

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.ATLAS_URI, {})
    db = await connection.db(process.env.DBNAME)
  })

  afterAll(async () => {
    await connection.close()
  })

  it('should insert a 3 models', async () => {
    for (let index = 0; index < 3; index++) {
      const model = db.collection('models')
      mockModel = {
        name: faker.commerce.product() + ' ' + faker.color.human() + ' ' + faker.animal.type(),
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
          botom: '/assets/texture/r710-2.5-nobezel__29341.png',
        },
        type: faker.helpers.arrayElement(deviceType).name,
        category: faker.helpers.arrayElement(deviceCategory).name,
      }
      await model.insertOne(mockModel)
      insertedModel = await model.findOne(mockModel)
      expect(insertedModel).toEqual(mockModel)
    }
  })
})

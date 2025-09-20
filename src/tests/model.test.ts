/**
 * @file        index.js
 * @description Create models and insert them into the database
 * @version 2023-11-26  C2RLO  Add mongo test
 * @version 2023-11-20  C2RLO  Add logger
 * @version 2023-10-29  C2RLO  Init
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient } from 'mongodb'
import '../utils/config'
import { testGenerators } from './testGenerators'

describe('create 3 models', () => {
  let connection: MongoClient
  let db: Db
  let mockModel
  let insertedModel

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.ATLAS_URI ?? '', {})
    db = connection.db(process.env.DBNAME)
  })

  afterAll(async () => {
    await connection.close()
  })

  it('should insert a 10 models', async () => {
    const attributesTypes = db.collection('attributesTypes')

    expect(await attributesTypes.countDocuments({})).not.toBe(0)
    // const attributesTypesData = await attributesTypesCursor.toArray()
    for (let index = 0; index < 10; index++) {
      const models = db.collection('models')
      // const attributesTypesData: { name: string }[] = await attributesTypesCursor.toArray().then(data => data.map((doc: { name: string }) => ({ name: doc.name })));
      const deviceData = testGenerators.deviceSimple()

      mockModel = {
        name: deviceData.name,
        dimension: deviceData.dimensions,
        texture: {
          front: '/assets/texture/r710-2.5-nobezel__29341.png',
          back: '/assets/texture/r710-2.5-nobezel__29341.png',
          side: '/assets/texture/r710-2.5-nobezel__29341.png',
          top: '/assets/texture/r710-2.5-nobezel__29341.png',
          bottom: '/assets/texture/r710-2.5-nobezel__29341.png'
        }
        // type: faker.helpers.arrayElement(attributesTypesData).name,
      }
      const insertResult = await models.insertOne(mockModel)

      insertedModel = await models.findOne({ _id: insertResult.insertedId })
      // Remove _id before comparison
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...modelWithoutId } = insertedModel || {}

      expect(modelWithoutId).toEqual(mockModel)
    }
  })
})

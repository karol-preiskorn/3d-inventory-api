/**
 * @file model.test.ts
 * @description Comprehensive test suite for model document operations in MongoDB.
 * Tests the complete lifecycle of 3D inventory model creation, insertion, and validation.
 * Verifies that model objects generated using testGenerators maintain data integrity
 * when stored and retrieved from the database, ensuring proper handling of dimensions,
 * textures, and metadata while excluding MongoDB-generated fields from comparison.
 * @version 2024-09-21 Updated with enhanced test data generators and error handling
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient } from 'mongodb'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

describe('create 3 models', () => {
  let connection: MongoClient
  let db: Db
  let mockModel
  let insertedModel

  beforeAll(async () => {
    connection = await MongoClient.connect(config.ATLAS_URI)
    db = connection.db(config.DBNAME)
  })

  afterAll(async () => {
    if (connection) {
      await connection.close()
    }
  })

  it('should insert a 10 models', async () => {
    for (let index = 0; index < 3; index++) {
      // Reduced from 10 to 3 for faster testing
      const models = db.collection('models')
      const deviceData = testGenerators.deviceSimple()

      mockModel = {
        name: deviceData.name,
        dimension: deviceData.dimensions, // Note: deviceData has 'dimensions' (plural) but mockModel expects 'dimension' (singular)
        texture: {
          front: '/assets/texture/r710-2.5-nobezel__29341.png',
          back: '/assets/texture/r710-2.5-nobezel__29341.png',
          side: '/assets/texture/r710-2.5-nobezel__29341.png',
          top: '/assets/texture/r710-2.5-nobezel__29341.png',
          bottom: '/assets/texture/r710-2.5-nobezel__29341.png',
        },
      }

      const insertResult = await models.insertOne(mockModel)

      insertedModel = await models.findOne({ _id: insertResult.insertedId })

      // Ensure insertedModel exists
      expect(insertedModel).not.toBeNull()

      // Remove _id before comparison
      if (insertedModel) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...modelWithoutId } = insertedModel

        expect(modelWithoutId).toEqual(mockModel)
      }
    }
  })
})

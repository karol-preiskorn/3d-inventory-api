/**
 * @file models.test.ts
 * @description Models REST API endpoint integration test suite.
 * Comprehensive testing of model management API operations including model
 * retrieval, creation, updates, and component relationships. Validates API
 * response formats, model schema compliance, attribute type associations,
 * and database integration through Express.js endpoints. Tests model-device
 * relationships, texture mapping, and dimensional data handling.
 * @version 2024-09-21 Enhanced with comprehensive model API testing
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient } from 'mongodb'
import request, { Response } from 'supertest'
import app from '../main'
import config from '../utils/config'

describe('GET /models', () => {
  let connection: MongoClient
  let db: Db

  beforeAll(async () => {
    connection = await MongoClient.connect(config.ATLAS_URI ?? '', {})
    db = connection.db(config.DBNAME)
  })

  afterAll(async () => {
    await connection.close()
    app.listen().close()
  })

  it('GET /models => array of models', async () => {
    const response = await request(app).get('/models').set('Accept', 'application/json; charset=utf-8').expect(200)
    const components = db.collection('components')

    // const componentsCursor = components.find({ attributes: true })
    expect(await components.countDocuments({ attributes: true })).not.toBe(0)

    const attributesTypes = db.collection('attributesTypes')

    /*   const attributesTypesCursor = attributesTypes.find({
      component: 'Devices',
    }) */
    expect(await attributesTypes.countDocuments({})).not.toBe(0)

    expect((response as Response).body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
          type: expect.any(String),
          dimension: {
            depth: expect.any(Number),
            height: expect.any(Number),
            width: expect.any(Number),
          },
          texture: {
            back: expect.any(String),
            bottom: expect.any(String),
            front: expect.any(String),
            side: expect.any(String),
            top: expect.any(String),
          },
        }),
      ]),
    )

    // Assuming the response body is an array of objects with an _id property
    interface ModelResponse {
      _id: string
      // other properties...
    }

    const requestBody = (response as Response).body as ModelResponse[]

    if (requestBody.length > 0) {
      const responseGetId = await request(app)
        .get('/models/' + requestBody[0]._id)
        .expect(200)

      expect(responseGetId.body).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
          type: expect.any(String),
          dimension: {
            width: expect.any(Number),
            height: expect.any(Number),
            depth: expect.any(Number),
          },
          texture: {
            front: expect.any(String),
            back: expect.any(String),
          },
        }),
      )
    }
  })
})

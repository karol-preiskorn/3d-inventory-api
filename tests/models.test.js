/**
 * @file /tests/models.test.js
 * @description test models api operatio
 * @version 2024-02-01 C2RLO - Add test for post device
 */

import { faker } from '@faker-js/faker'
import request from 'supertest'
import app from '../index.js'
import '../utils/loadEnvironment.js'
import { MongoClient } from 'mongodb'

describe('GET /models', () => {
  let connection
  let db

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.ATLAS_URI, {})
    db = connection.db(process.env.DBNAME)
  })

  afterAll(async () => {
    await connection.close()
    app.listen().close()
  })

  it('GET /models => array of models', async () => {
    const components = db.collection('components')
    const componentsCursor = await components.find({ attributes: true })
    expect(await components.countDocuments({ attributes: true })).not.toBe(0)
    const componentsData = await componentsCursor.toArray()

    const attributesTypes = db.collection('attributesTypes')
    const attributesTypesCursor = await attributesTypes.find({
      component: 'Devices',
    })
    expect(await attributesTypes.countDocuments({})).not.toBe(0)
    const attributesTypesData = await attributesTypesCursor.toArray()

    const response = await request(app)
      .get('/models')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    const mockModel = {
      name: faker.color.human() + ' ' + faker.commerce.product(),
      type: faker.helpers.arrayElement(attributesTypesData).value,
      dimension: {
        depth: faker.number.int({ min: 1, max: 10 }),
        height: faker.number.int({ min: 1, max: 10 }),
        width: faker.number.int({ min: 1, max: 10 }),
      },
      texture: {
        back: '/assets/texture/r710_2.5_nobezel__29341.png',
        bottom: '/assets/texture/r710_2.5_nobezel__29341.png',
        front: '/assets/texture/r710_2.5_nobezel__29341.png',
        side: '/assets/texture/r710_2.5_nobezel__29341.png',
        top: '/assets/texture/r710_2.5_nobezel__29341.png',
      },
    }

    expect(response.body).toEqual(
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

    const responseGetId = await request(app)
      .get('/models/' + response.body[0]._id)
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
          side: expect.any(String),
          top: expect.any(String),
          bottom: expect.any(String),
        },
      }),
    )
  })
})

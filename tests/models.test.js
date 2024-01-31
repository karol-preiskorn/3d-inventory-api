/**
 * @file /tests/models.test.js
 * @module /tests
 * @description test models api operation
 * @version 2024-02-01 C2RLO - Add test for post device
**/

import { faker } from '@faker-js/faker'
import request from 'supertest'
// import assert from "assert"
import app from '../index.js'
import { deviceType, deviceCategory } from './deviceType.js'

describe('GET /models', () => {

  afterAll(async () => {
    app.listen().close()
  })

  it('GET /models => array of models', async () => {
    const response = await request(app)
      .get('/models')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    const mockModel = {
      name: faker.commerce.product() + ' ' + faker.color.human() + ' ' + faker.animal.type(),
      dimension: {
        width: faker.number.int({ min: 1, max: 10 }),
        height: faker.number.int({ min: 1, max: 10 }),
        depth: faker.number.int({ min: 1, max: 10 }),
      },
      texture: {
        front: '/assets/texture/r710_2.5_nobezel__29341.png',
        back: '/assets/texture/r710_2.5_nobezel__29341.png',
        side: '/assets/texture/r710_2.5_nobezel__29341.png',
        top: '/assets/texture/r710_2.5_nobezel__29341.png',
        botom: '/assets/texture/r710_2.5_nobezel__29341.png',
      },
      category: faker.helpers.arrayElement(deviceCategory).name,
      type: faker.helpers.arrayElement(deviceType).name,
    }

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          category: expect.any(String),
          dimension: {
            depth: expect.any(Number),
            height: expect.any(Number),
            width: expect.any(Number),
          },
          name: expect.any(String),
          texture: {
            back: expect.any(String),
            bottom: expect.any(String),
            front: expect.any(String),
            side: expect.any(String),
            top: expect.any(String),
          },
          type: expect.any(String),
        }),
      ])
    )

    const responseGetId = await request(app)
      .get('/models/' + response.body[0]._id)
      .expect(200)

    expect(responseGetId.body).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        name: expect.any(String),
        type: expect.any(String),
        category: expect.any(String),
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
        }
      }),
    )}
  )
})

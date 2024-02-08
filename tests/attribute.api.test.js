/**
 * @file /tests/devices.test copy.js
 * @module /tests
 * @description Test suite for the GET /devices endpoint.
 * @version 2024-01-30 C2RLO - Initial
 * @version 2024-01-13  C2RLO  Add variant promises test, async/await and superagent for learn
 * @version 2024-01-06  C2RLO  Add array test
 * @version 2024-01-03  C2RLO  Initial
 */


// import faker from "@faker-js/faker"
import request from 'supertest'
// import assert from "assert"
import app from '../index.js'

describe('GET /devices', () => {

  afterAll(async () => {
    await app.listen().close()
  })

  it('GET /devices => array of devices', async () => {
    const response = await request(app)
      .get('/devices')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
          modelId: expect.any(String),
          position: {
            x: expect.any(Number),
            y: expect.any(Number),
            h: expect.any(Number),
          },
        }),
      ])
    )

    const responseGetId = await request(app)
      .get('/devices/' + response.body[0]._id)
      .expect(200)

    expect(responseGetId.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
          modelId: expect.any(String),
          position: {
            x: expect.any(Number),
            y: expect.any(Number),
            h: expect.any(Number),
          },
        }),
      ])
    )
  })
})

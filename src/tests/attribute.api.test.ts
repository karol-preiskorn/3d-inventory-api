/**
 * @file /tests/devices.test copy.js
 * @module /tests
 * @description Test suite for the GET /devices endpoint.
 * @version 2024-01-30 C2RLO - Initial
 * @version 2024-01-13  C2RLO  Add variant promises test, async/await and superagent for learn
 * @version 2024-01-06  C2RLO  Add array test
 * @version 2024-01-03  C2RLO  Initial
 */

import request from 'supertest'
import app from '../index.js'

describe('GET /devices', () => {
  afterAll(async () => {
    app.listen().close()
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
          _id: expect.stringMatching(/.+/) as string,
          name: expect.any(String) as string,
          modelId: expect.any(String) as string,
          position: {
            x: expect.any(Number) as number,
            y: expect.any(Number) as number,
            h: expect.any(Number) as number,
          },
        }),
      ]),
    )

    const responseGetId = await request(app)
      .get('/devices/' + response.body[0]._id)
      .expect(200)

    expect(responseGetId.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String) as string,
          name: expect.any(String) as string,
          modelId: expect.any(String) as string,
          position: {
            x: expect.any(Number) as number,
            y: expect.any(Number) as number,
            h: expect.any(Number) as number,
          },
        }),
      ]),
    )
  })
})

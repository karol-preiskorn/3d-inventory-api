/**
 * @module /tests
 * @description Test suite for the GET /devices endpoint.
 *  - Checks if the endpoint returns an array of devices.
 *  - Checks if the endpoint returns a specific device by ID.
 *  - Checks if the endpoint updates a device by ID. Check data types and values.
 * @version 2024-01-30  C2RLO  Initial
 * @version 2024-01-13  C2RLO  Add variant promises test, async/await and superagent for learn
 * @version 2024-01-06  C2RLO  Add array test
 * @version 2024-01-03  C2RLO  Initial
 */

import { expect, it, describe, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../main'

describe('GET /devices', () => {
  afterAll(function () {
    app.listen().close()
  })

  it('GET /devices => array of devices', async () => {
    const response = await request(app).get('/devices').set('Accept', 'application/json; charset=utf-8').expect(200)

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.stringMatching(/.+/),
          name: expect.any(String),
          modelId: expect.any(String),
          position: {
            x: expect.any(Number),
            y: expect.any(Number),
            h: expect.any(Number)
          }
        })
      ])
    )

    const responseGetId = await request(app)
      .get('/devices/' + (response.body as { _id: string }[])[0]._id)
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
            h: expect.any(Number)
          }
        })
      ])
    )
  })
})

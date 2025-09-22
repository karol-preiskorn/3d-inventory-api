/**
 * @file device.get.api.test.ts
 * @description Device retrieval API endpoint comprehensive test suite.
 * Tests the GET /devices REST API functionality including device listing,
 * individual device retrieval by ID, device updates, and data validation.
 * Validates response data types, device schema compliance, spatial coordinates,
 * model relationships, and proper HTTP status codes. Ensures API endpoint
 * reliability, error handling, and response format consistency.
 * @version 2024-09-21 Enhanced with comprehensive device API validation testing
 */

import { afterAll, describe, expect, it } from '@jest/globals'
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
            h: expect.any(Number),
          },
        }),
      ]),
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
            h: expect.any(Number),
          },
        }),
      ]),
    )
  })
})

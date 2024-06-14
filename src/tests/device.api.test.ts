/**
 * File:        /tests/devices.js
 * Description: Test devices api operation
 * 2024-01-13  C2RLO  Add variant promises test, async/await and superagent for learn
 * 2024-01-06  C2RLO  Add array test
 * 2024-01-03  C2RLO  Initial
 */

// import faker from "@faker-js/faker"
import request from 'supertest'
// import assert from "assert"
import app from '../index'

describe('GET /devices', () => {
  afterAll(() => {
    app.listen().close()
  })

  it('GET /devices => array of devices', async () => {
    const response = await request(app).get('/devices').set('Accept', 'application/json').expect('Content-Type', /json/).expect(200)

    expect(response.body).toEqual(
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

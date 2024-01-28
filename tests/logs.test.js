/**
 * @file /tests/logs.test.js
 * @module /tests
 * @description
 * @version 2024-01-28 C2RLO - Initial
**/

// import faker from "@faker-js/faker"
// import assert from "assert"
import request from 'supertest'
import app from '../index.js'

describe('GET /logs', () => {
  it('GET /logs => array of items', async () => {
    const response = await request(app)
      .get('/logs')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          date: expect.any(String),
          objectId: expect.any(String),
          operation: expect.any(String),
          component: expect.any(String),
          message: expect.any(Object),
        }),
      ])
    )

    // console.log('response.body: ' + JSON.stringify(response.body))

    const responseGetId = await request(app)
      .get('/logs/' + response.body[0]._id)
      .expect(200)

    expect(responseGetId.body).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        date: expect.any(String),
        objectId: expect.any(String),
        operation: expect.any(String),
        component: expect.any(String),
        message: expect.any(Object),
      }),
    )
  })
})

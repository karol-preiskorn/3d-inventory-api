/**
 * File:        /tests/devices.js
 * Description: Test devices api operation
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2024-01-13  C2RLO  Add variant promises test, async/await and superagent for learn
 * 2024-01-06  C2RLO  Add array test
 * 2024-01-03  C2RLO  Initial
 */

// import faker from "@faker-js/faker"
import request from 'supertest'
// import assert from "assert"
import app from '../index.js'

// let respond

describe('GET /devices', () => {
  it('GET /devices => array of items', () => request(app)
    .get('/devices')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((response) => {
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

    }).then((response) => {
      console.log(response.body)
      request(app)
        .get('/devices/' + response.body[0]._id)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((responseGetId) => {
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
  )
})

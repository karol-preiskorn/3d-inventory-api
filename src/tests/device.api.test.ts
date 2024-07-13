/**
 * @description: Test devices api operation
 *
 * @version: 2024-07-12  C2RLO  add put test
 * @version: 2024-01-13  C2RLO  Add variant promises test, async/await and superagent for learn
 * @version: 2024-01-06  C2RLO  Add array test
 * @version: 2024-01-03  C2RLO  Initial
 */

import { ObjectId } from 'mongodb';
import request from 'supertest';

import { faker } from '@faker-js/faker';

const app = 'http://localhost:8080'

describe('GET /devices', () => {
  it('GET /devices => array of devices', async () => {
    const response = await request(app).get('/devices').set('Accept', 'application/json').expect('Content-Type', /json/).expect(200)

    if (response.body.length === 0) {
      console.log('No devices found')
    } else if (typeof response.body.length === 'object') {
      console.log('Device found')
      expect.objectContaining({
        _id: expect.any(String) as ObjectId,
        name: expect.any(String) as string,
        modelId: expect.any(String) as ObjectId,
        position: {
          x: expect.any(Number) as number,
          y: expect.any(Number) as number,
          h: expect.any(Number) as number,
        },
      })
    } else {
      console.log('Devices found')
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String) as ObjectId,
            name: expect.any(String) as string,
            modelId: expect.any(String) as ObjectId,
            position: {
              x: expect.any(Number) as number,
              y: expect.any(Number) as number,
              h: expect.any(Number) as number,
            },
          }),
        ]),
      )
    }

    const responseGetId = await request(app)
      .get('/devices/' + response.body[0]._id)
      .expect(200)

    expect(responseGetId.body).toEqual(
      expect.objectContaining({
        _id: expect.any(String) as ObjectId,
        name: expect.any(String) as string,
        modelId: expect.any(String) as ObjectId,
        position: {
          x: expect.any(Number) as number,
          y: expect.any(Number) as number,
          h: expect.any(Number) as number,
        },
      }),
    )
  })

  it('PUT /devices/:id => update device', async () => {
    const response = await request(app).get('/devices').set('Accept', 'application/json').expect('Content-Type', /json/).expect(200)

    const responsePut = await request(app)
      .put('/devices/' + response.body[0]._id)
      .send({
        name: faker.color.human() + ' ' + faker.commerce.product(),
        modelId: response.body[0].modelId as ObjectId,
        position: {
          x: faker.number.int({ min: 1, max: 10 }),
          y: faker.number.int({ min: 1, max: 10 }),
          h: faker.number.int({ min: 1, max: 10 }),
        },
      })
      .expect(200)

    expect(responsePut.body.modifiedCount).toBe(1)
  })
})

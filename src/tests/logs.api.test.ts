/**
 * @file /tests/logs.test.js
 * @module /tests
 * @description This file contains tests for the '/logs' endpoint of the API. It includes tests for retrieving an array of logs and retrieving a specific log by ID.
 * @version 2024-01-28 C2RLO - Initial
 */

import request from 'supertest'
import app from '../index.js'


describe('GET /logs', () => {
  let response: request.Response;

  beforeAll(async () => {
    response = await request(app)
      .get('/logs')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  afterAll(async () => {
    app.listen().close();
  });

  it('GET /logs => array of items', async () => {
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String) as string,
          date: expect.any(String) as string,
          objectId: expect.any(String) as string,
          operation: expect.any(String) as string,
          component: expect.any(String) as string,
          message: expect.any(Object) as object,
        }),
      ]),
    )
    // console.log('response.body: ' + JSON.stringify(response.body))
  })

  it('GET /logs/:id => item', async () => {
    const firstLogId = (response.body)[0]?._id as string;

    const responseGetId = await request(app)
      .get('/logs/' + firstLogId)
      .expect(200);

    expect(responseGetId.body).toEqual(
      expect.objectContaining({
        _id: expect.any(String) as string,
        date: expect.any(String) as string,
        objectId: expect.any(String) as string,
        operation: expect.any(String) as string,
        component: expect.any(String) as string,
        message: expect.any(Object) as object,
      }),
    );
  })

  it('GET /logs/collection/devices', async () => {
    const responseGetId = await request(app)
      .get('/logs/collection/devices')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    expect(responseGetId.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String) as string,
          date: expect.any(String) as string,
          objectId: expect.any(String) as string,
          operation: expect.any(String) as string,
          component: expect.any(String) as string,
          message: expect.any(Object) as object,
        }),
      ]),
    )
  })
})

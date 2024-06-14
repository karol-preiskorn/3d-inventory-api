/**
 * @file /tests/attributesDictionary.test.js
 * @description This file contains tests for the '/logs' endpoint of the API. It includes tests for retrieving an array of logs and retrieving a specific log by ID.
 * @version 2024-01-30 C2RLO - Initial
 */

import app from '../index'
import supertest from 'supertest'

describe('GET /logs', () => {
  it('should return an array of items', async () => {
    const response = await supertest(app).get('/logs')
    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String) as string,
          date: expect.any(String) as string,
          objectId: expect.any(String) as string,
          component: expect.any(String) as string,
          message: expect.any(Object) as object,
        }),
      ]),
    )
  })

  it('should return a specific log by ID', async () => {
    const body: { _id: string } = { _id: 'your_id_here' }
    const responseGetId = await supertest(app).get('/logs/' + body._id)
    expect(responseGetId.status).toBe(200)
    // Add your assertions for the specific log here
  })
})

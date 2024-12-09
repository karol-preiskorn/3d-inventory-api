import request from 'supertest'

import app from '../index'

describe('GET /logs', () => {
  let response: request.Response

  beforeAll(async () => {
    response = await request(app).get('/logs').set('Accept', 'application/json; charset=utf-8').expect(200)
  })

  afterAll(() => {
    app.listen().close()
  })

  it('GET /logs => array of items', () => {
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String) as string,
          date: expect.any(String) as string,
          objectId: expect.any(String) as string,
          operation: expect.any(String) as string,
          component: expect.any(String) as string,
          message: expect.any(Object) as object
        })
      ])
    )
    // console.log('response.body: ' + JSON.stringify(response.body));
  })
})

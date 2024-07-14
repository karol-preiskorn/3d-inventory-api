import '../utils/loadEnvironment';

import app from 'express';
import request from 'supertest';

let issues = ''

describe('GitHub API', () => {
  afterAll(() => {
    ;(app as any).close()
  })
  it('should get GitHub issues', async () => {
    const response = await request(app).get('/github/issues')

    expect(response.status).toBe(200)
    expect(response.body).toBeDefined()

    console.log('response.body: ' + JSON.stringify(response.body, null, ' '))
    // expect(response.body).toEqual(issues)
  })
})

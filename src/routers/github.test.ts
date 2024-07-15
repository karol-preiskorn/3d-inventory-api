import '../utils/loadEnvironment'

import cors from 'cors'
import request from 'supertest'

import app from '../index'

let issues = ''

describe('GitHub API', () => {
  it('should get GitHub issues', async () => {
    const response = await request(app).get('/github/issues')

    expect(response.status).toBe(200)
    expect(response.body).toBeDefined()

    console.log('response.body: ' + JSON.stringify(response, null, ' '))
    // expect(response.body).toEqual(issues)
  })
})

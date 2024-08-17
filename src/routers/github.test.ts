/**
 * Test case for getting GitHub issues.
 *
 * @remarks
 * This test case verifies that the API endpoint for retrieving GitHub issues is functioning correctly.
 *
 * @returns {Promise<void>} A promise that resolves when the test case is complete.
 */
import '../utils/loadEnvironment'

import app from '../index'
import request from 'supertest'

describe('GitHub API', () => {
  it('should get GitHub issues', async () => {
    const response = await request(app).get('/github/issues')

    expect(response.status).toBe(200)
    expect(response.body).toBeDefined()

    console.log('response.body: ' + JSON.stringify(response, null, ' '))
    // expect(response.body).toEqual(issues)
  })
})

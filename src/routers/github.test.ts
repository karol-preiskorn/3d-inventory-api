/// <reference types="jest" />
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve('./.env') })

import request from 'supertest'
import app from '../main'
import { expect, it, describe } from '@jest/globals'

describe('GitHub API', () => {
  it('should get GitHub issues', async () => {
    const response = await request(app).get('/github/issues')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBeGreaterThanOrEqual(0)
    // Optionally, check structure of an issue if array is not empty
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('id')
      expect(response.body[0]).toHaveProperty('title')
    }
  })
})

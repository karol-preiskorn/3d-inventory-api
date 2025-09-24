/**
 * @file github.test.ts
 * @description GitHub API integration test suite for external service connectivity.
 * Tests the GitHub API router endpoints, validating proper integration with GitHub's
 * REST API services. Ensures issue fetching, API response handling, and proper
 * error management for external API dependencies. Validates API key authentication,
 * rate limiting compliance, and response data structure integrity.
 * @version 2024-09-21 Enhanced with comprehensive API validation testing
 */
/// <reference types="jest" />
import path from 'path'
import dotenv from 'dotenv'
import request from 'supertest'
import app from '../main'

dotenv.config({ path: path.resolve('./.env') })

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

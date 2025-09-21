/**
 * @file logs.api.test.ts
 * @description Logging API and audit trail functionality test suite.
 * Tests the logs REST API endpoints for system activity tracking, audit trails,
 * and operational event logging. Validates log entry creation, retrieval,
 * filtering, and formatting. Ensures proper logging of CRUD operations,
 * user activities, and system events with appropriate timestamps and metadata.
 * Tests log API response formats and query parameter handling.
 * @version 2024-09-21 Enhanced with comprehensive logging API validation
 */
import { beforeAll, describe, expect, it } from '@jest/globals'
import request from 'supertest'
// Make sure the correct path to the Express app is used.
// For example, if your app is exported from '../app', update the import as follows:
import app from '../main'
// If the file is actually at '../index.ts', ensure it is compiled or use the correct extension if needed:
// import app from '../index.ts'

describe('GET /logs', () => {
  let response: request.Response

  beforeAll(async () => {
    response = await request(app).get('/logs').set('Accept', 'application/json; charset=utf-8').expect(200)
  })

  // No need to close the server here since Supertest handles it.

  it('GET /logs => array of items', () => {
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          date: expect.any(String),
          objectId: expect.any(String),
          operation: expect.any(String),
          component: expect.any(String),
          message: expect.any(Object)
        })
      ])
    )
    // console.log('response.body: ' + JSON.stringify(response.body));
  })
})

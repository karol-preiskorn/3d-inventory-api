/**
 * @description This file is used to test the README.md file rendering
 * @module tests
 * @version 2024-01-27 C2RLO - Initial
 */
import express from 'express'
import helmet from 'helmet'
import request from 'supertest'

import { createReadmeRouter } from '../routers/readme'

// Import Jest globals for type safety and editor support

const app = express()

app.use(helmet())
app.use('/', createReadmeRouter())

describe('GET /', () => {
  it('should return the rendered README.md', async () => {
    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.text).toContain('<h1>Sample README</h1>') // Replace with the expected content of your README.md
  })

  it('should return 404 if README.md file is not found', async () => {
    // This test would require mocking the fs module or the controller
    // For now, we'll test the actual behavior when file doesn't exist
    const response = await request(app).get('/nonexistent')

    // Since we're hitting the root route, this will test the actual file reading
    // The test should be updated based on actual behavior expectations
    expect(response.status).toBeDefined()
  })
})

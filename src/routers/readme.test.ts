/**
 * @description This file is used to test the README.md file rendering
 * @module tests
 * @version 2024-01-27 C2RLO - Initial
 */
import express from 'express'
import request from 'supertest'
import router from '../routers/readme'

const app = express()
app.use('/', router as express.RequestHandler)

describe('GET /', () => {
  it('should return the rendered README.md', async () => {
    const response = await request(app).get('/')
    expect(response.status).toBe(200)
    expect(response.text).toContain('<h1>Sample README</h1>') // Replace with the expected content of your README.md
  })

  it('should return 404 if README.md file is not found', async () => {
    jest.spyOn(router as express.Router, 'get').mockImplementation(() => {
      throw new Error('File not found')
    })
    const response = await request(app).get('/')
    expect(response.status).toBe(404)
    expect(response.text).toContain('File ./../assets/README.md: File not found')
  })
})

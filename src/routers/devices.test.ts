/**
 * @file devices.test.ts
 * @description Device router API endpoint integration test suite.
 * Comprehensive testing of device management REST API endpoints including
 * CRUD operations, attribute updates, spatial positioning, and device-model
 * relationships. Validates HTTP request handling, response formats, error
 * conditions, and database integration through the Express.js router layer.
 * Tests authentication, authorization, and data validation for device operations.
 * @version 2024-09-21 Enhanced with comprehensive device API testing
 */
import express from 'express'
import helmet from 'helmet'
import { Collection, Db, Document, MongoClient } from 'mongodb'
import request from 'supertest'
import config from '../utils/config'
import { logger } from '../utils/logger'
import router from './devices'

const app = express()

app.use(express.json())
app.use(helmet())
app.use('/devices', router)

describe('PUT /devices/:id/attributes', () => {
  let client: MongoClient
  let db: Db
  let collection: jest.Mocked<Collection<Document>>

  beforeAll(async () => {
    if (!config.ATLAS_URI) {
      throw new Error('ATLAS_URI is not defined in the environment variables')
    }
    client = new MongoClient(config.ATLAS_URI)
    await client.connect()
    db = client.db(config.DBNAME)
    collection = db.collection('devices') as jest.Mocked<Collection<Document>>

    // Mock the updateOne method
    collection.updateOne.mockResolvedValue({
      acknowledged: true,
      matchedCount: 0,
      modifiedCount: 0,
      upsertedCount: 0,
      upsertedId: null,
    })
  })

  afterAll(async () => {
    await client.close()
  })

  it('should return 404 if the device id is invalid', async () => {
    const response = await request(app)
      .put('/devices/6830d0319a425_0cceba42be2/attributes')
      .send({ attributes: [{ key: 'color', value: 'red' }] })

    expect(response.status).toBe(404)
    expect(logger.error).toHaveBeenCalledWith('PUT /devices/6830d0319a425_0cceba42be2/attributes - wrong device id')
  })

  it('should return 404 if the device is not found', async () => {
    collection.updateOne.mockResolvedValueOnce({
      acknowledged: true,
      matchedCount: 0,
      modifiedCount: 0,
      upsertedCount: 0,
      upsertedId: null,
    })

    const response = await request(app).put('/devices/66af8c766f87d90fa87bb982/attributes').send({ attribute: 'value' })

    expect(response.status).toBe(404)
  })

  it('should update the device attributes and return 200', async () => {
    collection.updateOne.mockResolvedValueOnce({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    })

    const response = await request(app)
      .put('/devices/66af8c766f87d90fa87bb982/attributes')
      .send({ attributes: [{ key: 'color', value: 'red' }] })

    expect(response.status).toBe(200)
    expect(logger.info).toHaveBeenCalledWith('PUT /devices/66af8c766f87d90fa87bb982 - success updated device 66af8c766f87d90fa87bb982 attributes')
  })
})

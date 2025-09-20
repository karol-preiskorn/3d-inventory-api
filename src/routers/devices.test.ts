import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import { Db, MongoClient } from 'mongodb'
import request from 'supertest'

import { logger } from '../utils/logger'
import router from './devices'
import { Collection, Document } from 'mongodb'

dotenv.config()

const app = express()

app.use(express.json())
app.use(helmet())
app.use('/devices', router)

describe('PUT /devices/:id/attributes', () => {
  let client: MongoClient
  let db: Db
  let collection: jest.Mocked<Collection<Document>>

  beforeAll(async () => {
    if (!process.env.ATLAS_URI) {
      throw new Error('ATLAS_URI is not defined in the environment variables')
    }
    client = new MongoClient(process.env.ATLAS_URI)
    await client.connect()
    db = client.db(process.env.DBNAME)
    collection = db.collection('devices') as jest.Mocked<Collection<Document>>

    // Mock the updateOne method
    collection.updateOne.mockResolvedValue({
      acknowledged: true,
      matchedCount: 0,
      modifiedCount: 0,
      upsertedCount: 0,
      upsertedId: null
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
      upsertedId: null
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
      upsertedId: null
    })

    const response = await request(app)
      .put('/devices/66af8c766f87d90fa87bb982/attributes')
      .send({ attributes: [{ key: 'color', value: 'red' }] })

    expect(response.status).toBe(200)
    expect(logger.info).toHaveBeenCalledWith('PUT /devices/66af8c766f87d90fa87bb982 - success updated device 66af8c766f87d90fa87bb982 attributes')
  })
})

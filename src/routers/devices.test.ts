import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { Collection, Db, MongoClient } from 'mongodb';
import request from 'supertest';

import { expect, jest } from '@jest/globals';

import { connectionClose } from '../db/dbUtils';
import { logger } from '../utils/logger';
import router from './devices';

dotenv.config()

jest.mock('../db/dbUtils')
jest.mock('../utils/logger')

const app = express()
app.use(express.json())
app.use(helmet())
app.use('/devices', router)

describe('PUT /devices/:id/attributes', () => {
  let client: MongoClient
  let db: Db
  interface Device {
    _id: string
    attributes: { key: string; value: string }[]
  }

  let collection: Collection<Device>

  beforeAll(() => {
    if (!process.env.ATLAS_URI) {
      throw new Error('ATLAS_URI is not defined in the environment variables')
    }
    client = new MongoClient(process.env.ATLAS_URI)
    db = client.db(process.env.DBNAME)
    collection = db.collection('devices')

    // Mock the updateOne method
    collection.updateOne = jest.fn<jest.MockedFunction<typeof collection.updateOne>>().mockResolvedValue({
      acknowledged: true,
      matchedCount: 0,
      modifiedCount: 0,
      upsertedCount: 0,
      upsertedId: null,
    })
  })

  afterAll(async () => {
    await connectionClose(client)
  })

  it('should return 404 if the device id is invalid', async () => {
    const response = await request(app)
      .put('/devices/66af8c766f87d90fa87bb982/attributes')
      .send({ attributes: [{ key: 'color', value: 'red' }] })

    expect(response.status).toBe(404)
    expect(logger.error).toHaveBeenCalledWith('PUT /devices/6_6af8c766f87d90fa87bb982/attributes - wrong device id')
  })

  it('should return 404 if the device is not found', async () => {
    ;(collection.updateOne as jest.Mock<jest.MockedFunction<typeof collection.updateOne>>).mockResolvedValueOnce({
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
    ;(collection.updateOne as jest.Mock<jest.MockedFunction<typeof collection.updateOne>>).mockResolvedValueOnce({
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

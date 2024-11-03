/**
 * @description: Test devices api operation
 *
 * @version: 2024-07-12  C2RLO  add put test
 * @version: 2024-01-13  C2RLO  Add variant promises test, async/await and superagent for learn
 * @version: 2024-01-06  C2RLO  Add array test
 * @version: 2024-01-03  C2RLO  Initial
 */

import '../utils/loadEnvironment';

import { Collection, Db, ObjectId } from 'mongodb';
import request from 'supertest';

import { faker } from '@faker-js/faker';

import { connectToCluster, connectToDb } from '../db/dbUtils';
import { Device } from '../routers/devices';

describe('GET /devices', () => {
  it('GET /devices => array of devices', async () => {
    const response = await request(app).get('/devices').set('Accept', 'application/json; charset=utf-8').expect(200)
    const devices: Device[] = response.body as Device[]

    if (devices.length === 0) {
      console.log('No devices found')
    } else {
      console.log('Device found')
      expect(devices).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String) as ObjectId,
            name: expect.any(String) as string,
            modelId: expect.any(String) as ObjectId,
            position: {
              x: expect.any(Number) as number,
              y: expect.any(Number) as number,
              h: expect.any(Number) as number,
            },
          }),
        ]),
      )
    }
  })
})

describe('Database Connection', () => {
  it('should connect to the database', async (done) => {
    const client = await connectToCluster()
    const db: Db = connectToDb(client)
    const collection: Collection<Device> = db.collection<Device>('devices')
    const results: Device[] = await collection.find({}).limit(10).toArray()

    if (!results) {
      // Simulate response for testing
      const res: { status: jest.Mock; send: jest.Mock } = { status: jest.fn().mockReturnThis(), send: jest.fn() }
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith('Not found')
    } else {
      // Simulate response for testing
      const res: { status: jest.Mock; send: jest.Mock } = { status: jest.fn().mockReturnThis(), send: jest.fn() }
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(results)
    }

    done()
  })
})

describe('POST /devices', () => {
  it('POST /devices => create new device', async () => {
    const device = {
      name: faker.color.human() + ' ' + faker.commerce.product(),
      modelId: new ObjectId(),
      position: {
        x: faker.number.int({ min: 1, max: 10 }),
        y: faker.number.int({ min: 1, max: 10 }),
        h: faker.number.int({ min: 1, max: 10 }),
      },
    }

    const response = await request(app).post('/devices').send(device).set('Accept', 'application/json; charset=utf-8').expect(201)

    const createdDevice: Device = response.body as Device

    expect(createdDevice).toEqual(
      expect.objectContaining({
        _id: expect.any(String) as ObjectId,
        name: device.name,
        modelId: device.modelId,
        position: device.position,
      }),
    )
  })
})

const app = 'http://localhost:8080'

describe('GET /devices', () => {
  it('GET /devices => array of devices', async () => {
    const response = await request(app).get('/devices').set('Accept', 'application/json; charset=utf-8').expect(200)

    if (Array.isArray(response.body) && response.body.length === 0) {
      console.log('No devices found')
    } else if (typeof response.body === 'object' && response.body !== null) {
      console.log('Device found')
      expect.objectContaining({
        _id: expect.any(String) as ObjectId,
        name: expect.any(String) as string,
        modelId: expect.any(String) as ObjectId,
        position: {
          x: expect.any(Number) as number,
          y: expect.any(Number) as number,
          h: expect.any(Number) as number,
        },
      })
    } else {
      console.log('Devices found')
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String) as ObjectId,
            name: expect.any(String) as string,
            modelId: expect.any(String) as ObjectId,
            position: {
              x: expect.any(Number) as number,
              y: expect.any(Number) as number,
              h: expect.any(Number) as number,
            },
          }),
        ]),
      )
    }

    interface Device {
      _id: string
      // Add other properties as needed
    }

    interface GetDevicesResponse {
      body: Device[]
    }

    const getDevicesResponse = response as GetDevicesResponse

    const responseGetId = await request(app)
      .get('/devices/' + getDevicesResponse.body[0]._id)
      .expect(200)

    expect(responseGetId.body).toEqual(
      expect.objectContaining({
        _id: expect.any(String) as ObjectId,
        name: expect.any(String) as string,
        modelId: expect.any(String) as ObjectId,
        position: {
          x: expect.any(Number) as number,
          y: expect.any(Number) as number,
          h: expect.any(Number) as number,
        },
      }),
    )
  })

  it('PUT /devices/:id => update device', async () => {
    const response = await request(app).get('/devices').set('Accept', 'application/json; charset=utf-8').expect(200)

    // ---INSERT---
    interface Device {
      _id: string
      modelId: ObjectId
      // Add other properties as needed
    }

    interface GetDevicesResponse {
      body: Device[]
    }

    // Assuming response is of type Response
    const getDevicesResponse = response as GetDevicesResponse

    const responsePut = await request(app)
      .put('/devices/' + getDevicesResponse.body[0]._id)
      .send({
        name: faker.color.human() + ' ' + faker.commerce.product(),
        modelId: getDevicesResponse.body[0].modelId,
        position: {
          x: faker.number.int({ min: 1, max: 10 }),
          y: faker.number.int({ min: 1, max: 10 }),
          h: faker.number.int({ min: 1, max: 10 }),
        },
      })
      .expect(200)

    interface ResponseBody {
      modifiedCount: number
    }

    // Assuming responsePut is of type Response
    const responseBody = responsePut.body as ResponseBody

    expect(responseBody.modifiedCount).toBe(1)
  })
})

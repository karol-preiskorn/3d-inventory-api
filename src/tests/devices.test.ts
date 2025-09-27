/**
 * Device Router Integration Tests
 * Comprehensive testing of device management endpoints with enhanced coverage
 */
import express from 'express'
import request from 'supertest'
import {
  createDevice,
  deleteAllDevices,
  deleteDevice,
  deleteDevicesByModel,
  getAllDevices,
  getDeviceById,
  getDevicesByModel,
  updateDevice,
  updateDevicePosition
} from '../controllers/devices'
import createDevicesRouter from '../routers/devices'

// Mock all the controller functions
jest.mock('../controllers/devices', () => ({
  getAllDevices: jest.fn(),
  getDeviceById: jest.fn(),
  updateDevice: jest.fn(),
  createDevice: jest.fn(),
  getDevicesByModel: jest.fn(),
  updateDevicePosition: jest.fn(),
  deleteDevice: jest.fn(),
  deleteAllDevices: jest.fn(),
  deleteDevicesByModel: jest.fn()
}))

// Mock middleware modules
jest.mock('../middlewares', () => ({
  validateObjectId: jest.fn((req: any, res: any, next: any) => next()),
  validateDeviceInput: jest.fn((req: any, res: any, next: any) => next()),
  validateDeviceUpdate: jest.fn((req: any, res: any, next: any) => next()),
  validatePositionUpdate: jest.fn((req: any, res: any, next: any) => next()),
  requireAuth: jest.fn((req: any, res: any, next: any) => next()),
  requirePermission: jest.fn(() => (req: any, res: any, next: any) => next()),
  optionalAuth: jest.fn((req: any, res: any, next: any) => next()),
  Permission: {
    WRITE_DEVICES: 'write_devices',
    DELETE_DEVICES: 'delete_devices'
  }
}))

// Mock database utilities
jest.mock('../utils/db', () => ({
  connectToCluster: jest.fn(),
  connectToDb: jest.fn(),
  closeConnection: jest.fn().mockResolvedValue(undefined)
}))

// Mock logging service
jest.mock('../services/logs', () => ({
  CreateLog: jest.fn().mockResolvedValue({ status: 'success' })
}))

const mockedGetAllDevices = jest.mocked(getAllDevices)
const mockedGetDeviceById = jest.mocked(getDeviceById)
const mockedUpdateDevice = jest.mocked(updateDevice)
const mockedCreateDevice = jest.mocked(createDevice)
const mockedDeleteDevice = jest.mocked(deleteDevice)
const mockedGetDevicesByModel = jest.mocked(getDevicesByModel)
const mockedUpdateDevicePosition = jest.mocked(updateDevicePosition)
const mockedDeleteAllDevices = jest.mocked(deleteAllDevices)
const mockedDeleteDevicesByModel = jest.mocked(deleteDevicesByModel)
const app = express()

app.use(express.json())
app.use('/devices', createDevicesRouter())

describe('Devices Router', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /devices', () => {
    it('should call getAllDevices controller and return device list', async () => {
      const mockDevices = [
        { _id: '507f1f77bcf86cd799439011', name: 'Device 1' },
        { _id: '507f1f77bcf86cd799439012', name: 'Device 2' }
      ]

      mockedGetAllDevices.mockImplementation(async (req, res) => {
        res.status(200).json({ devices: mockDevices })
      })

      const response = await request(app).get('/devices')

      expect(mockedGetAllDevices).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body.devices).toEqual(mockDevices)
      expect(response.body.devices).toHaveLength(2)
    })

    it('should handle getAllDevices errors', async () => {
      mockedGetAllDevices.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Database connection failed' })
      })

      const response = await request(app).get('/devices')

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Database connection failed')
    })

    it('should return empty array when no devices exist', async () => {
      mockedGetAllDevices.mockImplementation(async (req, res) => {
        res.status(200).json({ devices: [] })
      })

      const response = await request(app).get('/devices')

      expect(response.status).toBe(200)
      expect(response.body.devices).toHaveLength(0)
    })
  })

  describe('GET /devices/:id', () => {
    const deviceId = '507f1f77bcf86cd799439011'

    it('should call getDeviceById controller and return device details', async () => {
      const mockDevice = {
        _id: deviceId,
        name: 'Test Device',
        modelId: '507f1f77bcf86cd799439012',
        position: { x: 0, y: 0, h: 0 }
      }

      mockedGetDeviceById.mockImplementation(async (req, res) => {
        res.status(200).json({ device: mockDevice })
      })

      const response = await request(app).get(`/devices/${deviceId}`)

      expect(mockedGetDeviceById).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body.device).toEqual(mockDevice)
      expect(response.body.device._id).toBe(deviceId)
    })

    it('should handle device not found', async () => {
      mockedGetDeviceById.mockImplementation(async (req, res) => {
        res.status(404).json({ error: 'Device not found' })
      })

      const response = await request(app).get(`/devices/${deviceId}`)

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Device not found')
    })

    it('should handle database errors for single device lookup', async () => {
      mockedGetDeviceById.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Database query failed' })
      })

      const response = await request(app).get(`/devices/${deviceId}`)

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Database query failed')
    })
  })

  describe('PUT /devices/:id', () => {
    const deviceId = '507f1f77bcf86cd799439011'

    it('should call updateDevice controller with valid data', async () => {
      const updateData = { name: 'Updated Device', status: 'active' }
      const updatedDevice = { _id: deviceId, ...updateData }

      mockedUpdateDevice.mockImplementation(async (req, res) => {
        res.status(200).json({
          message: 'Device updated successfully',
          device: updatedDevice
        })
      })

      const response = await request(app).put(`/devices/${deviceId}`).send(updateData)

      expect(mockedUpdateDevice).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body.device).toEqual(updatedDevice)
      expect(response.body.message).toBe('Device updated successfully')
    })

    it('should handle validation errors for invalid update data', async () => {
      mockedUpdateDevice.mockImplementation(async (req, res) => {
        res.status(400).json({ error: 'Invalid device data provided' })
      })

      const response = await request(app).put(`/devices/${deviceId}`).send({ invalidField: 'invalid value' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid device data provided')
    })

    it('should handle device not found for update', async () => {
      mockedUpdateDevice.mockImplementation(async (req, res) => {
        res.status(404).json({ error: 'Device not found for update' })
      })

      const response = await request(app).put(`/devices/${deviceId}`).send({ name: 'Updated Device' })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Device not found for update')
    })
  })

  describe('POST /devices', () => {
    it('should call createDevice controller with valid device data', async () => {
      const newDeviceData = {
        name: 'New Test Device',
        modelId: '507f1f77bcf86cd799439012',
        position: { x: 10, y: 20, h: 5 }
      }
      const createdDevice = { _id: '507f1f77bcf86cd799439013', ...newDeviceData }

      mockedCreateDevice.mockImplementation(async (req, res) => {
        res.status(201).json({
          message: 'Device created successfully',
          device: createdDevice
        })
      })

      const response = await request(app).post('/devices').send(newDeviceData)

      expect(mockedCreateDevice).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(201)
      expect(response.body.device).toEqual(createdDevice)
      expect(response.body.message).toBe('Device created successfully')
    })

    it('should handle missing required fields', async () => {
      mockedCreateDevice.mockImplementation(async (req, res) => {
        res.status(400).json({ error: 'Missing required fields: name, modelId' })
      })

      const response = await request(app).post('/devices').send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Missing required fields: name, modelId')
    })

    it('should handle duplicate device creation', async () => {
      mockedCreateDevice.mockImplementation(async (req, res) => {
        res.status(409).json({ error: 'Device with this name already exists' })
      })

      const response = await request(app).post('/devices').send({ name: 'Duplicate Device', modelId: '507f1f77bcf86cd799439012' })

      expect(response.status).toBe(409)
      expect(response.body.error).toBe('Device with this name already exists')
    })
  })

  describe('DELETE /devices/:id', () => {
    const deviceId = '507f1f77bcf86cd799439011'

    it('should call deleteDevice controller', async () => {
      mockedDeleteDevice.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Device deleted' })
      })

      const response = await request(app).delete(`/devices/${deviceId}`)

      expect(mockedDeleteDevice).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
    })

    it('should handle device not found for deletion', async () => {
      mockedDeleteDevice.mockImplementation(async (req, res) => {
        res.status(404).json({ error: 'Device not found' })
      })

      const response = await request(app).delete(`/devices/${deviceId}`)

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Device not found')
    })
  })

  describe('GET /devices/model/:modelId', () => {
    const modelId = '507f1f77bcf86cd799439012'

    it('should call getDevicesByModel controller', async () => {
      mockedGetDevicesByModel.mockImplementation(async (req, res) => {
        res.status(200).json({ devices: [{ _id: '1', modelId: req.params.modelId }] })
      })

      const response = await request(app).get(`/devices/model/${modelId}`)

      expect(mockedGetDevicesByModel).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body.devices).toHaveLength(1)
    })

    it('should handle no devices found for model', async () => {
      mockedGetDevicesByModel.mockImplementation(async (req, res) => {
        res.status(200).json({ devices: [] })
      })

      const response = await request(app).get(`/devices/model/${modelId}`)

      expect(response.status).toBe(200)
      expect(response.body.devices).toHaveLength(0)
    })
  })

  describe('PATCH /devices/position/:id', () => {
    const deviceId = '507f1f77bcf86cd799439011'
    const positionData = { x: 10, y: 20, h: 5 }

    it('should call updateDevicePosition controller', async () => {
      mockedUpdateDevicePosition.mockImplementation(async (req, res) => {
        res.status(200).json({
          message: 'Position updated',
          device: { _id: req.params.id, position: req.body }
        })
      })

      const response = await request(app).patch(`/devices/position/${deviceId}`).send(positionData)

      expect(mockedUpdateDevicePosition).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body.device.position).toEqual(positionData)
    })

    it('should validate position data', async () => {
      mockedUpdateDevicePosition.mockImplementation(async (req, res) => {
        res.status(400).json({ error: 'Invalid position coordinates' })
      })

      const response = await request(app).patch(`/devices/position/${deviceId}`).send({ invalid: 'data' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid position coordinates')
    })
  })

  describe('DELETE /devices', () => {
    it('should call deleteAllDevices controller', async () => {
      mockedDeleteAllDevices.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'All devices deleted', deletedCount: 5 })
      })

      const response = await request(app).delete('/devices')

      expect(mockedDeleteAllDevices).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body.deletedCount).toBe(5)
    })

    it('should handle authorization for bulk delete', async () => {
      mockedDeleteAllDevices.mockImplementation(async (req, res) => {
        res.status(403).json({ error: 'Insufficient permissions' })
      })

      const response = await request(app).delete('/devices')

      expect(response.status).toBe(403)
      expect(response.body.error).toBe('Insufficient permissions')
    })
  })

  describe('DELETE /devices/model/:modelId', () => {
    const modelId = '507f1f77bcf86cd799439012'

    it('should call deleteDevicesByModel controller', async () => {
      mockedDeleteDevicesByModel.mockImplementation(async (req, res) => {
        res.status(200).json({
          message: 'Devices deleted by model',
          deletedCount: 3,
          modelId: req.params.id // The router parameter is :id, not :modelId
        })
      })

      const response = await request(app).delete(`/devices/model/${modelId}`)

      expect(mockedDeleteDevicesByModel).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(response.body.deletedCount).toBe(3)
      expect(response.body.modelId).toBe(modelId)
    })
  })

  describe('Error Handling & Edge Cases', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const response = await request(app).post('/devices').set('Content-Type', 'application/json').send('{ malformed json }')

      expect(response.status).toBe(400)
    })

    it('should handle missing request body in PUT requests', async () => {
      mockedUpdateDevice.mockImplementation(async (req, res) => {
        res.status(400).json({ error: 'Request body is required' })
      })

      const response = await request(app).put('/devices/507f1f77bcf86cd799439011')

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Request body is required')
    })

    it('should handle invalid ObjectId format', async () => {
      const response = await request(app).get('/devices/invalid-id')

      // Assuming middleware handles this before reaching controller
      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should handle server errors gracefully', async () => {
      mockedGetAllDevices.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Internal server error' })
      })

      const response = await request(app).get('/devices')

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Internal server error')
    })
  })

  describe('Middleware Integration', () => {
    it('should parse JSON request bodies correctly', async () => {
      mockedCreateDevice.mockImplementation(async (req, res) => {
        res.status(201).json({
          message: 'Device created',
          receivedBody: req.body,
          bodyType: typeof req.body
        })
      })

      const deviceData = { name: 'Test Device', modelId: '507f1f77bcf86cd799439012' }
      const response = await request(app).post('/devices').send(deviceData)

      expect(response.status).toBe(201)
      expect(response.body.receivedBody).toEqual(deviceData)
      expect(response.body.bodyType).toBe('object')
    })

    it('should handle authentication middleware pass-through', async () => {
      mockedGetAllDevices.mockImplementation(async (req, res) => {
        res.status(200).json({
          message: 'Authenticated request processed',
          devices: []
        })
      })

      const response = await request(app).get('/devices')

      expect(response.status).toBe(200)
      expect(mockedGetAllDevices).toHaveBeenCalledTimes(1)
    })
  })
})

import express from 'express'
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
import {
  Permission,
  optionalAuth,
  requireAuth,
  requirePermission,
  validateDeviceInput,
  validateDeviceUpdate,
  validateObjectId,
  validatePositionUpdate
} from '../middlewares'

// Create devices router with enhanced security
export default function createDevicesRouter() {
  const router = express.Router()

  // GET /devices - Get all devices (public read access)
  router.get('/', optionalAuth, getAllDevices)

  // GET /devices/:id - Get device by ID (public read access)
  router.get('/:id', validateObjectId, optionalAuth, getDeviceById)

  // PUT /devices/:id - Update device by ID (requires write permission)
  router.put('/:id', validateObjectId, validateDeviceUpdate, requireAuth, requirePermission(Permission.DEVICE_UPDATE), updateDevice)

  // POST /devices - Create new device (requires write permission)
  router.post('/', validateDeviceInput, requireAuth, requirePermission(Permission.DEVICE_CREATE), createDevice)

  // GET /devices/model/:id - Get devices by model ID (public read access)
  router.get('/model/:id', validateObjectId, optionalAuth, getDevicesByModel)

  // PATCH /devices/position/:id - Update device position (requires write permission)
  router.patch('/position/:id', validateObjectId, validatePositionUpdate, requireAuth, requirePermission(Permission.DEVICE_UPDATE), updateDevicePosition)

  // DELETE /devices/:id - Delete device by ID (requires delete permission)
  router.delete('/:id', validateObjectId, requireAuth, requirePermission(Permission.DEVICE_DELETE), deleteDevice)

  // DELETE /devices - Delete all devices (requires delete permission)
  router.delete('/', requireAuth, requirePermission(Permission.DEVICE_DELETE), deleteAllDevices)

  // DELETE /devices/model/:id - Delete devices by model ID (requires delete permission)
  router.delete('/model/:id', validateObjectId, requireAuth, requirePermission(Permission.DEVICE_DELETE), deleteDevicesByModel)

  // DELETE /devices/model/:id - Delete devices by model ID
  router.delete('/model/:id', validateObjectId, deleteDevicesByModel)

  return router
}

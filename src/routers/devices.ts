import express from 'express';
import {
  getAllDevices,
  getDeviceById,
  updateDevice,
  createDevice,
  getDevicesByModel,
  updateDevicePosition,
  deleteDevice,
  deleteAllDevices,
  deleteDevicesByModel
} from '../controllers/devices';
import {
  validateObjectId,
  requireAuth,
  requirePermission,
  Permission,
  optionalAuth
} from '../middlewares';

// Create devices router with enhanced security
export default function createDevicesRouter() {
  const router = express.Router();

  // GET /devices - Get all devices (public read access)
  router.get('/', optionalAuth, getAllDevices);

  // GET /devices/:id - Get device by ID (public read access)
  router.get('/:id', validateObjectId, optionalAuth, getDeviceById);

  // PUT /devices/:id - Update device by ID (requires write permission)
  router.put('/:id', validateObjectId, requireAuth, requirePermission(Permission.WRITE_DEVICES), updateDevice);

  // POST /devices - Create new device (requires write permission)
  router.post('/', requireAuth, requirePermission(Permission.WRITE_DEVICES), createDevice);

  // GET /devices/model/:id - Get devices by model ID (public read access)
  router.get('/model/:id', validateObjectId, optionalAuth, getDevicesByModel);

  // PATCH /devices/position/:id - Update device position (requires write permission)
  router.patch('/position/:id', validateObjectId, requireAuth, requirePermission(Permission.WRITE_DEVICES), updateDevicePosition);

  // DELETE /devices/:id - Delete device by ID (requires delete permission)
  router.delete('/:id', validateObjectId, requireAuth, requirePermission(Permission.DELETE_DEVICES), deleteDevice);

  // DELETE /devices - Delete all devices (requires delete permission)
  router.delete('/', requireAuth, requirePermission(Permission.DELETE_DEVICES), deleteAllDevices);

  // DELETE /devices/model/:id - Delete devices by model ID (requires delete permission)
  router.delete('/model/:id', validateObjectId, requireAuth, requirePermission(Permission.DELETE_DEVICES), deleteDevicesByModel);

  // DELETE /devices/model/:id - Delete devices by model ID
  router.delete('/model/:id', validateObjectId, deleteDevicesByModel);

  return router;
}

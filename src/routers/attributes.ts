import { Router } from 'express';
import {
  getAllAttributes,
  getAttributeById,
  getAttributesByModelId,
  getAttributesByDeviceId,
  getAttributesByConnectionId,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  deleteAllAttributes,
  deleteAttributesByModelId
} from '../controllers/attributes';
import {
  validateObjectId,
  validateAttributeInput
} from '../middlewares';

/**
 * Creates and configures the attributes router
 * @returns {Router} Configured Express router
 */
export function createAttributesRouter(): Router {
  const router = Router();

  // Basic CRUD routes
  router.get('/', getAllAttributes);
  router.get('/:id', validateObjectId, getAttributeById);
  router.post('/', validateAttributeInput, createAttribute);
  router.put('/:id', validateObjectId, validateAttributeInput, updateAttribute);
  router.delete('/:id', validateObjectId, deleteAttribute);
  router.delete('/', deleteAllAttributes);

  // Specialized query routes
  router.get('/model/:id', validateObjectId, getAttributesByModelId);
  router.get('/device/:id', validateObjectId, getAttributesByDeviceId);
  router.get('/connection/:id', validateObjectId, getAttributesByConnectionId);

  // Specialized delete routes
  router.delete('/model/:id', validateObjectId, deleteAttributesByModelId);

  return router;
}

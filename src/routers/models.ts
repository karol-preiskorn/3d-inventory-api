import { Router, RequestHandler } from 'express';
import {
  getAllModels,
  getModelById,
  createModel,
  updateModel,
  updateModelDimension,
  updateModelTexture,
  deleteModel,
  deleteAllModels,
} from '../controllers/models';
import { validateObjectId } from '../middlewares';

// Middleware to validate model input
const validateModelInput: RequestHandler = (req, res, next) => {
  if (!req.body.name || typeof req.body.name !== 'string') {
    return res.status(400).json({ error: 'Name is required and must be a string' });
  }
  next();
};

/**
 * Creates and configures the models router
 * @returns {Router} Configured Express router
 */
export function createModelsRouter(): Router {
  const router = Router();

  // Route definitions
  router.get('/', getAllModels);
  router.get('/:id', validateObjectId, getModelById);
  router.post('/', validateModelInput, createModel);
  router.put('/:id', validateObjectId, validateModelInput, updateModel);
  router.patch('/dimension/:id', validateObjectId, updateModelDimension);
  router.patch('/texture/:id', validateObjectId, updateModelTexture);
  router.delete('/:id', validateObjectId, deleteModel);
  router.delete('/', deleteAllModels);

  return router;
}

import { Router, RequestHandler } from 'express';
import {
  getAllFloors,
  getFloorById,
  getFloorByModelId,
  createFloor,
  updateFloor,
  addFloorDimension,
  deleteFloor,
  deleteAllFloors,
  deleteFloorsByModelId,
  Address,
  Dimension,
} from '../controllers/floors';
import { validateObjectId } from '../middlewares';

// Middleware to validate floor input
const validateFloorInput: RequestHandler = (req, res, next) => {
  const { name, address, dimension } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({
      error: 'Invalid input data',
      message: 'name must be a non-empty string',
    });

    return;
  }

  if (!address || typeof address !== 'object') {
    res.status(400).json({
      error: 'Invalid input data',
      message: 'address must be an object',
    });

    return;
  }

  const { street, city, country, postcode } = address as Address;

  if (
    !street ||
    typeof street !== 'string' ||
    !city ||
    typeof city !== 'string' ||
    !country ||
    typeof country !== 'string' ||
    !postcode ||
    typeof postcode !== 'string'
  ) {
    res.status(400).json({
      error: 'Invalid input data',
      message: 'address must contain street, city, country, and postcode as strings',
    });

    return;
  }

  if (!Array.isArray(dimension)) {
    res.status(400).json({
      error: 'Invalid input data',
      message: 'dimension must be an array',
    });

    return;
  }

  const isValidDimension = dimension.every(
    (dim: Dimension) =>
      typeof dim.description === 'string' &&
      typeof dim.x === 'number' &&
      typeof dim.y === 'number' &&
      typeof dim.h === 'number' &&
      typeof dim.xPos === 'number' &&
      typeof dim.yPos === 'number' &&
      typeof dim.hPos === 'number',
  );

  if (!isValidDimension) {
    res.status(400).json({
      error: 'Invalid input data',
      message: 'Each dimension must contain description (string) and x, y, h, xPos, yPos, hPos (numbers)',
    });

    return;
  }

  next();
};
// Middleware to validate dimension input for PATCH operations
const validateDimensionInput: RequestHandler = (req, res, next) => {
  const { description, x, y, h, xPos, yPos, hPos } = req.body;

  if (
    typeof description !== 'string' ||
    typeof x !== 'number' ||
    typeof y !== 'number' ||
    typeof h !== 'number' ||
    typeof xPos !== 'number' ||
    typeof yPos !== 'number' ||
    typeof hPos !== 'number'
  ) {
    res.status(400).json({
      error: 'Invalid input data',
      message: 'Dimension must contain description (string) and x, y, h, xPos, yPos, hPos (numbers)',
    });

    return;
  }

  next();
};

/**
 * Creates and configures the floors router
 * @returns {Router} Configured Express router
 */
export function createFloorsRouter(): Router {
  const router = Router();

  // Basic CRUD routes
  router.get('/', getAllFloors);
  router.get('/:id', validateObjectId, getFloorById);
  router.post('/', validateFloorInput, createFloor);
  router.put('/:id', validateObjectId, validateFloorInput, updateFloor);
  router.delete('/:id', validateObjectId, deleteFloor);
  router.delete('/', deleteAllFloors);

  // Specialized routes
  router.get('/model/:id', validateObjectId, getFloorByModelId);
  router.patch('/dimension/:id', validateObjectId, validateDimensionInput, addFloorDimension);
  router.delete('/model/:id', validateObjectId, deleteFloorsByModelId);

  return router;
}

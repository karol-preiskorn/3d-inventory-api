import { Request, Response } from 'express';
import sanitize from 'mongo-sanitize';
import { Collection, Db, InsertOneResult, UpdateResult, DeleteResult, ObjectId } from 'mongodb';
import { closeConnection, connectToCluster, connectToDb } from '../utils/db';
import getLogger from '../utils/logger';

const logger = getLogger('models');
const proc = '[models]';
const collectionName = 'models';

export interface Dimension {
  width: number;
  height: number;
  depth: number;
}

export interface Texture {
  front: string;
  back: string;
  side: string;
  top: string;
  bottom: string;
}

export interface Model {
  _id?: ObjectId;
  name: string;
  dimension: Dimension;
  texture: Texture;
  type?: string;
  category?: string;
}

export interface ModelInput {
  name: string;
  dimension: Dimension;
  texture: Texture;
  type?: string;
  category?: string;
}

// Constants
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

// Validation helper functions
function validateObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

function validateModelInput(data: Partial<ModelInput>): { isValid: boolean; error?: string } {
  const { name, dimension, texture } = data;

  if (typeof name !== 'string' || name.trim().length === 0) {
    return { isValid: false, error: 'name must be a non-empty string' };
  }

  if (
    !dimension ||
    typeof dimension !== 'object' ||
    typeof dimension.width !== 'number' ||
    dimension.width <= 0 ||
    typeof dimension.height !== 'number' ||
    dimension.height <= 0 ||
    typeof dimension.depth !== 'number' ||
    dimension.depth <= 0
  ) {
    return { isValid: false, error: 'dimension must be an object with width, height, and depth as positive numbers' };
  }

  if (
    !texture ||
    typeof texture !== 'object' ||
    typeof texture.front !== 'string' ||
    texture.front.trim().length === 0 ||
    typeof texture.back !== 'string' ||
    texture.back.trim().length === 0 ||
    typeof texture.side !== 'string' ||
    texture.side.trim().length === 0 ||
    typeof texture.top !== 'string' ||
    texture.top.trim().length === 0 ||
    typeof texture.bottom !== 'string' ||
    texture.bottom.trim().length === 0
  ) {
    return { isValid: false, error: 'texture must be an object with front, back, side, top, and bottom as non-empty strings' };
  }

  return { isValid: true };
}

// Get all models
export async function getAllModels(req: Request, res: Response) {
  let limit = DEFAULT_LIMIT;

  if (req.query.limit) {
    const parsed = parseInt(req.query.limit as string, 10);

    if (!isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, MAX_LIMIT);
    }
  }

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);
    const collection: Collection = db.collection(collectionName);
    const results = await collection.find({}).limit(limit).toArray();

    if (!results.length) {
      logger.info(`${proc} No models found`);
      res.status(200).json({ message: 'No models found', data: [] });

      return;
    }

    logger.info(`${proc} Retrieved ${results.length} models`);
    res.status(200).json({ data: results, count: results.length });
  } catch (error) {
    logger.error(`${proc} Error fetching models: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'models',
      procedure: 'getAllModels',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await closeConnection(client);
  }
}

// Get model by ID
export async function getModelById(req: Request, res: Response) {
  const { id } = req.params;

  if (!validateObjectId(id)) {
    logger.warn(`${proc} Invalid ObjectId: ${id}`);
    res.status(400).json({
      error: 'Invalid ID format',
      message: 'The provided ID is not a valid ObjectId',
    });

    return;
  }

  const query = { _id: new ObjectId(id) };
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);
    const collection: Collection = db.collection(collectionName);
    const model = await collection.findOne(query);

    if (!model) {
      logger.warn(`${proc} Model not found: ${id}`);
      res.status(404).json({ message: 'Model not found' });

      return;
    }

    logger.info(`${proc} Retrieved model: ${id}`);
    res.status(200).json(model);
  } catch (error) {
    logger.error(`${proc} Error fetching model ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'models',
      procedure: 'getModelById',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await closeConnection(client);
  }
}

// Create new model
export async function createModel(req: Request, res: Response) {
  const { name, dimension, texture, type, category } = req.body;
  // Validate input
  const validation = validateModelInput({ name, dimension, texture });

  if (!validation.isValid) {
    logger.warn(`${proc} ${validation.error}`);
    res.status(400).json({
      error: 'Invalid input data',
      message: validation.error,
    });

    return;
  }

  const sanitizedName = sanitize(name).trim();
  const sanitizedType = type ? sanitize(type).trim() : undefined;
  const sanitizedCategory = category ? sanitize(category).trim() : undefined;
  const newModel: Model = {
    name: sanitizedName,
    dimension: {
      width: Number(dimension.width),
      height: Number(dimension.height),
      depth: Number(dimension.depth),
    },
    texture: {
      front: texture.front.trim(),
      back: texture.back.trim(),
      side: texture.side.trim(),
      top: texture.top.trim(),
      bottom: texture.bottom.trim(),
    },
    ...(sanitizedType && { type: sanitizedType }),
    ...(sanitizedCategory && { category: sanitizedCategory }),
  };
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);
    const collection: Collection = db.collection(collectionName);
    // Check for duplicate name
    const existingModel = await collection.findOne({ name: sanitizedName });

    if (existingModel) {
      logger.warn(`${proc} Model with name '${sanitizedName}' already exists`);
      res.status(409).json({
        error: 'Conflict',
        message: 'A model with this name already exists',
      });

      return;
    }

    const result: InsertOneResult<Model> = await collection.insertOne(newModel);

    if (!result.acknowledged) {
      res.status(500).json({ message: 'Failed to create model' });

      return;
    }

    const insertedModel = { _id: result.insertedId, ...newModel };

    logger.info(`${proc} Created model: ${result.insertedId}`);
    res.status(201).json(insertedModel);
  } catch (error) {
    logger.error(`${proc} Error creating model: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'models',
      procedure: 'createModel',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await closeConnection(client);
  }
}

// Update model by ID
export async function updateModel(req: Request, res: Response) {
  const { id } = req.params;
  const { name, dimension, texture, type, category } = req.body;

  if (!validateObjectId(id)) {
    logger.warn(`${proc} Invalid ObjectId: ${id}`);
    res.status(400).json({
      error: 'Invalid ID format',
      message: 'The provided ID is not a valid ObjectId',
    });

    return;
  }

  // Validate input
  const validation = validateModelInput({ name, dimension, texture });

  if (!validation.isValid) {
    logger.warn(`${proc} ${validation.error}`);
    res.status(400).json({
      error: 'Invalid input data',
      message: validation.error,
    });

    return;
  }

  const sanitizedName = sanitize(name).trim();
  const sanitizedType = type ? sanitize(type).trim() : undefined;
  const sanitizedCategory = category ? sanitize(category).trim() : undefined;
  const query = { _id: new ObjectId(id) };
  const updates = {
    $set: {
      name: sanitizedName,
      dimension: {
        width: Number(dimension.width),
        height: Number(dimension.height),
        depth: Number(dimension.depth),
      },
      texture: {
        front: texture.front.trim(),
        back: texture.back.trim(),
        side: texture.side.trim(),
        top: texture.top.trim(),
        bottom: texture.bottom.trim(),
      },
      ...(sanitizedType && { type: sanitizedType }),
      ...(sanitizedCategory && { category: sanitizedCategory }),
    },
  };
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);
    const collection: Collection = db.collection(collectionName);
    // Check if model exists
    const existingModel = await collection.findOne(query);

    if (!existingModel) {
      logger.warn(`${proc} Model not found for update: ${id}`);
      res.status(404).json({ message: 'Model not found' });

      return;
    }

    // Check for name conflict (if name is changing)
    if (sanitizedName !== existingModel.name) {
      const nameConflict = await collection.findOne({
        name: sanitizedName,
        _id: { $ne: new ObjectId(id) },
      });

      if (nameConflict) {
        logger.warn(`${proc} Model with name '${sanitizedName}' already exists`);
        res.status(409).json({
          error: 'Conflict',
          message: 'A model with this name already exists',
        });

        return;
      }
    }

    const result: UpdateResult = await collection.updateOne(query, updates);

    logger.info(`${proc} Updated model: ${id}`);
    res.status(200).json({
      message: 'Model updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error(`${proc} Error updating model ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'models',
      procedure: 'updateModel',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await closeConnection(client);
  }
}

// Update model dimension by ID
export async function updateModelDimension(req: Request, res: Response) {
  const { id } = req.params;
  const { dimension } = req.body;

  if (!validateObjectId(id)) {
    logger.warn(`${proc} Invalid ObjectId: ${id}`);
    res.status(400).json({
      error: 'Invalid ID format',
      message: 'The provided ID is not a valid ObjectId',
    });

    return;
  }

  // Validate dimension
  if (
    !dimension ||
    typeof dimension !== 'object' ||
    typeof dimension.width !== 'number' ||
    dimension.width <= 0 ||
    typeof dimension.height !== 'number' ||
    dimension.height <= 0 ||
    typeof dimension.depth !== 'number' ||
    dimension.depth <= 0
  ) {
    logger.warn(`${proc} Invalid dimension data for update`);
    res.status(400).json({
      error: 'Invalid input data',
      message: 'dimension must be an object with width, height, and depth as positive numbers',
    });

    return;
  }

  const query = { _id: new ObjectId(id) };
  const updates = {
    $set: {
      dimension: {
        width: Number(dimension.width),
        height: Number(dimension.height),
        depth: Number(dimension.depth),
      },
    },
  };
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);
    const collection: Collection = db.collection(collectionName);
    const result: UpdateResult = await collection.updateOne(query, updates);

    if (result.matchedCount === 0) {
      logger.warn(`${proc} Model not found for dimension update: ${id}`);
      res.status(404).json({ message: 'Model not found' });

      return;
    }

    logger.info(`${proc} Updated model dimension: ${id}`);
    res.status(200).json({
      message: 'Model dimension updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error(`${proc} Error updating model dimension ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'models',
      procedure: 'updateModelDimension',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await closeConnection(client);
  }
}

// Update model texture by ID
export async function updateModelTexture(req: Request, res: Response) {
  const { id } = req.params;
  const { texture } = req.body;

  if (!validateObjectId(id)) {
    logger.warn(`${proc} Invalid ObjectId: ${id}`);
    res.status(400).json({
      error: 'Invalid ID format',
      message: 'The provided ID is not a valid ObjectId',
    });

    return;
  }

  // Validate texture
  if (
    !texture ||
    typeof texture !== 'object' ||
    typeof texture.front !== 'string' ||
    texture.front.trim().length === 0 ||
    typeof texture.back !== 'string' ||
    texture.back.trim().length === 0 ||
    typeof texture.side !== 'string' ||
    texture.side.trim().length === 0 ||
    typeof texture.top !== 'string' ||
    texture.top.trim().length === 0 ||
    typeof texture.bottom !== 'string' ||
    texture.bottom.trim().length === 0
  ) {
    logger.warn(`${proc} Invalid texture data for update`);
    res.status(400).json({
      error: 'Invalid input data',
      message: 'texture must be an object with front, back, side, top, and bottom as non-empty strings',
    });

    return;
  }

  const query = { _id: new ObjectId(id) };
  const updates = {
    $set: {
      texture: {
        front: texture.front.trim(),
        back: texture.back.trim(),
        side: texture.side.trim(),
        top: texture.top.trim(),
        bottom: texture.bottom.trim(),
      },
    },
  };
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);
    const collection: Collection = db.collection(collectionName);
    const result: UpdateResult = await collection.updateOne(query, updates);

    if (result.matchedCount === 0) {
      logger.warn(`${proc} Model not found for texture update: ${id}`);
      res.status(404).json({ message: 'Model not found' });

      return;
    }

    logger.info(`${proc} Updated model texture: ${id}`);
    res.status(200).json({
      message: 'Model texture updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error(`${proc} Error updating model texture ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'models',
      procedure: 'updateModelTexture',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await closeConnection(client);
  }
}

// Delete model by ID
export async function deleteModel(req: Request, res: Response) {
  const { id } = req.params;

  if (!validateObjectId(id)) {
    logger.warn(`${proc} Invalid ObjectId: ${id}`);
    res.status(400).json({
      error: 'Invalid ID format',
      message: 'The provided ID is not a valid ObjectId',
    });

    return;
  }

  const query = { _id: new ObjectId(id) };
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);
    const collection: Collection = db.collection(collectionName);
    const result: DeleteResult = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      logger.warn(`${proc} Model not found for deletion: ${id}`);
      res.status(404).json({ message: 'Model not found' });

      return;
    }

    logger.info(`${proc} Deleted model: ${id}`);
    res.status(200).json({
      message: 'Model deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    logger.error(`${proc} Error deleting model ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'models',
      procedure: 'deleteModel',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await closeConnection(client);
  }
}

// Delete all models
export async function deleteAllModels(req: Request, res: Response) {
  // Production safety check
  if (process.env.NODE_ENV === 'production') {
    logger.warn(`${proc} Attempt to delete all models in production environment`);
    res.status(403).json({
      error: 'Forbidden in production environment',
      message: 'This operation is not allowed in production',
    });

    return;
  }

  if (req.query.confirm !== 'true') {
    logger.warn(`${proc} Missing confirmation for delete all models`);
    res.status(400).json({
      error: 'Confirmation required',
      message: 'Add ?confirm=true to proceed with deleting all models',
    });

    return;
  }

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);
    const collection: Collection = db.collection(collectionName);
    const result: DeleteResult = await collection.deleteMany({});

    logger.warn(`${proc} Deleted all ${result.deletedCount} models`);
    res.status(200).json({
      message: 'All models deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    logger.error(`${proc} Error deleting all models: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'models',
      procedure: 'deleteAllModels',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await closeConnection(client);
  }
}

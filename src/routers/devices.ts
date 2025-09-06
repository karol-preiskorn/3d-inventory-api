import express, { RequestHandler } from 'express';
import { Collection, Db, Document, InsertOneResult, ObjectId, OptionalId, UpdateFilter } from 'mongodb';

import { CreateLog } from '../services/logs';
import { closeConnection, connectToCluster, connectToDb } from '../utils/db';
import log from '../utils/logger';

const logger = log('devices');

export interface Device {
  _id: string;
  name: string;
  modelId: string;
  position: {
    x: number;
    y: number;
    h: number;
  };
  attributes: Attribute[];
}

export interface Attribute {
  key: string;
  value: string;
}

export interface Position {
  x: number;
  y: number;
  h: number;
}

const router: express.Router = express.Router();

const collectionName = 'devices';

// Middleware to validate ObjectId in req.params.id
const validateObjectId: RequestHandler = (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    logger.error(`${req.method} ${req.originalUrl} - invalid id format`);
    res.status(400).send('Invalid id format');

    return;
  }
  next();
};

/**
 * Get Device array from database.
 * @function GET /devices
 * @returns {Promise<object[]>} A promise that resolves to an array of objects.
 * @throws {Error}
 */
router.get('/', (async (_req, res) => {
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const results: object[] = await collection.find({}).limit(1000).toArray();

    if (results.length === 0) {
      logger.warn('GET /devices - not found');
      res.status(404).send('Not found');
    } else {
      logger.info(`GET /devices - oki return ${results.length} devices ${JSON.stringify(results)}`);
      res.status(200).json(results);
    }
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

/**
 * Get a single device by its ID from the database.
 * @function GET /devices/:id
 * @param {string} id - The ObjectId of the device to retrieve.
 * @returns {Promise<object>} A promise that resolves to the device object.
 * @throws {Error}
 */
router.get('/:id', validateObjectId, (async (req, res) => {
  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection: Collection = db.collection(collectionName);

  const query = { _id: new ObjectId(req.params.id) };

  const result = await collection.findOne(query);

  if (!result) {
    logger.warn(`GET /devices/${req.params.id} - not found device`);
    res.status(404).send('Not found');
  } else {
    logger.info(`GET /devices/${req.params.id} - oki, device: ${JSON.stringify(result)}`);
    res.status(200).json(result);
  }
  await closeConnection(client);
}) as RequestHandler);

/**
 * Update a device by its ID in the database.
 * @function PUT /devices/:id
 * @param {string} id - The ObjectId of the device to update.
 * @returns {Promise<object>} A promise that resolves to the updated device object.
 * @throws {Error}
 */
router.put('/:id', validateObjectId, (async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };

  const updates: UpdateFilter<Document>[] = [
    {
      $set: {
        name: (req.body as { name: string }).name,
        modelId: (req.body as { modelId: string }).modelId,
        position: (req.body as { position: Position }).position,
        attributes: (req.body as { attributes: Attribute[] }).attributes
      }
    }
  ];

  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection: Collection = db.collection(collectionName);

  let result;

  try {
    result = await collection.updateOne(query, updates);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error(`PUT /devices/${req.params.id} - error updating device: ${errorMessage}`);
    res.status(500).json({
      module: 'devices',
      procedure: 'updateDevice',
      status: 'Internal Server Error',
      message: errorMessage
    });

    return;
  }
  if (result.modifiedCount === 0) {
    logger.error(`PUT /devices/${req.params.id} - not found devices to update`);
    res.status(404).send('Not found devices to update');
  } else {
    const updatedDevice = await collection.findOne(query);

    logger.info(`PUT /devices/${req.params.id} - oki updated ${result.modifiedCount} devices`);
    res.status(200).json(updatedDevice);
  }
}) as RequestHandler);

router.get('/model/:id', validateObjectId, (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    logger.error(`GET /devices/model/${req.params.id} - wrong id`);
    res.sendStatus(400);

    return;
  }
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const query = { modelId: req.params.id };

    const result = await collection.find(query).toArray();

    res.status(200).json(result);
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

router.post('/', (async (req: express.Request, res: express.Response) => {
  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  let resultLog = {};

  const collection: Collection = db.collection(collectionName);

  logger.error(`POST /devices - body: ${JSON.stringify(req.body)}`);

  if (!req.body || Object.keys(req.body).length === 0) {
    logger.error('POST /devices - No data provided');
    res.status(400).send('POST /devices - No data provided');
    await closeConnection(client);

    return;
  }
  const newDocument: OptionalId<Document> & { date: Date } = req.body as OptionalId<Document> & { date: Date };

  newDocument.date = new Date();
  const result: InsertOneResult<Document> = await collection.insertOne(newDocument);

  if (!result?.insertedId) {
    logger.error(`POST /devices - Device not created with id: ${JSON.stringify(newDocument)}`);
    await CreateLog('', newDocument, 'Create', 'Device');
    res.status(500).send('POST /devices - Device not created');
  } else {
    logger.info(`POST /devices - device created successfully with id: ${result.insertedId.toString()}, ${JSON.stringify(newDocument)}`);
    resultLog = await CreateLog(result.insertedId.toString(), newDocument, 'Create', 'Device');
    res.status(200).json(resultLog);
  }
  await closeConnection(client);
}) as RequestHandler);

router.patch('/position/:id', validateObjectId, (async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };

  const updates: UpdateFilter<Document>[] = [
    {
      $set: { position: req.body as Position }
    }
  ];

  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection: Collection = db.collection(collectionName);

  let result;

  try {
    result = await collection.updateOne(query, updates);
  } catch (error) {
    logger.error(`PATCH /devices/position/${req.params.id} - error updating position: ${(error as Error).message}`);
    res.status(500).json({
      module: 'devices',
      procedure: 'updateDevicePosition',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    await closeConnection(client);

    return;
  }
  if (!result || result.modifiedCount === 0) {
    logger.error(`PATCH /devices/position/${req.params.id} - no position updated`);
    res.status(404).send('No position updated');
  } else {
    logger.info(`PATCH /devices/position/${req.params.id} - position updated successfully`);
    res.status(200).json(result);
  }
  await closeConnection(client);
}) as RequestHandler);

router.delete('/:id', validateObjectId, (async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };

  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection: Collection = db.collection(collectionName);

  const result = await collection.deleteOne(query);

  if (!result) {
    logger.error(`POST /devices/${req.params.id} - Device not created`);
    res.status(500).json({ error: `POST /devices/${req.params.id} - Device not created` });
  } else {
    logger.info(`POST /devices/${req.params.id} - device created successfully.`);
    res.status(200).json(result);
  }
  await closeConnection(client);
}) as RequestHandler);

/**
 * Dummy authentication middleware for demonstration purposes only.
 * WARNING: Do NOT use this in production. Replace with a secure authentication and authorization mechanism.
 */
const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`requireAuth: Missing or invalid Authorization header for ${req.method} ${req.originalUrl}`);
    res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });

    return;
  }

  const token = authHeader.substring('Bearer '.length).trim();

  // Replace this with your real Bearer token validation logic
  // For demonstration, accept a hardcoded token "3d-inventory-secret-token"
  if (token !== '3d-inventory-secret-token') {
    logger.warn(`requireAuth: Invalid Bearer token for ${req.method} ${req.originalUrl}`);
    res.status(403).json({ error: 'Forbidden: Invalid Bearer token' });

    return;
  }

  logger.info(`requireAuth: Bearer token authorized for ${req.method} ${req.originalUrl}`);
  next();
};

router.delete('/', requireAuth, (async (_req, res) => {
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result = await collection.deleteMany({});

    res.status(200).json(result);
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

router.delete('/model/:id', validateObjectId, (async (req, res) => {
  const query = { modelId: req.params.id };

  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection: Collection = db.collection(collectionName);

  const result = await collection.deleteMany(query);

  res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

export default router;

/**
 * @file /routers/connections.js
 * @module routers
 * @description connections router for the API
 */

import express, { RequestHandler } from 'express';
import sanitize from 'mongo-sanitize';
import { Collection, Db, InsertOneResult, ObjectId } from 'mongodb';

import { closeConnection, connectToCluster, connectToDb } from '../utils/db';

interface Connection {
  _id?: ObjectId;
  name: string;
  deviceIdFrom: ObjectId;
  deviceIdTo: ObjectId;
}

const collectionName = 'connections';

const router: express.Router = express.Router();

/**
 * @route GET /connections
 * @description Retrieve a list of all connections.
 * @query {number} [limit] - Optional. Limits the number of returned connections (default: 256, max: 1000).
 * @returns {200} Array of Connection objects on success.
 * @returns {404} If no connections are found.
 * @returns {500} On server error.
 */
router.get('/', (async (req, res) => {
  const DEFAULT_LIMIT = 256; // Default limit for returned connections

  const MAX_LIMIT = 1000; // Maximum allowed limit to prevent abuse

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

    const results: object[] = await collection.find({}).limit(limit).toArray();

    res.set('Content-Type', 'application/json; charset=utf-8');
    if (!results) res.status(404).send('Not found any connection');
    else res.status(200).send(JSON.stringify(results));
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

/**
 * @route GET /connections/:id
 * @description Get a connection by its ObjectId.
 * @param {string} id - ObjectId string of the connection to retrieve.
 * @returns {200} {Connection} on success.
 * @returns {404} { error: string } if the connection is not found.
 * @returns {500} { error: string } on server error.
 */
router.get('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: 'Not found' });

    return;
  }
  const query = { _id: new ObjectId(req.params.id) };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const connection = await collection.findOne(query);

    if (!connection) {
      res.status(404).json({ error: 'Not found' });

      return;
    } else {
      res.status(200).json(connection);

      return;
    }
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

router.put('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: 'Not found' });

    return;
  }
  const query = { _id: new ObjectId(req.params.id) };

  // Validate and sanitize input fields
  const { name, deviceIdFrom, deviceIdTo } = req.body;

  const sanitizedName = sanitize(name);

  const sanitizedDeviceIdFrom = sanitize(deviceIdFrom);

  const sanitizedDeviceIdTo = sanitize(deviceIdTo);

  if (
    typeof sanitizedName !== 'string' ||
    typeof sanitizedDeviceIdFrom !== 'string' ||
    typeof sanitizedDeviceIdTo !== 'string' ||
    !ObjectId.isValid(sanitizedDeviceIdFrom) ||
    !ObjectId.isValid(sanitizedDeviceIdTo)
  ) {
    res.status(400).json({ error: 'Invalid input data: name must be a string, deviceIdFrom and deviceIdTo must be valid ObjectId strings.' });

    return;
  }

  const updates = {
    $set: {
      name: sanitizedName,
      deviceIdFrom: new ObjectId(sanitizedDeviceIdFrom),
      deviceIdTo: new ObjectId(sanitizedDeviceIdTo)
    }
  };

  let client;

  try {
    client = await connectToCluster();
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result = await collection.updateOne(query, updates);

    if (result.matchedCount === 0) {
      res.status(404).json({ error: 'Not found' });
    } else {
      res.status(200).json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
    }
  } catch {
    res.status(500).json({
      module: 'connections',
      procedure: 'updateOne',
      error: 'Internal server error'
    });
  } finally {
    if (client) {
      await closeConnection(client);
    }
  }
}) as RequestHandler);

router.get('/from/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: 'Not found' });

    return;
  }
  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection: Collection = db.collection(collectionName);

  const query = { deviceIdFrom: new ObjectId(req.params.id) };

  const result = await collection.findOne(query);

  if (!result) res.status(404).end();
  else res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

router.get('/to/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: 'Not found' });

    return;
  }
  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection: Collection = db.collection(collectionName);

  const query = { deviceIdTo: new ObjectId(req.params.id) };

  const result = await collection.findOne(query);

  if (!result) res.status(404).json({ error: 'Not found' });
  else res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

// Add a route for getting a connection by deviceIdFrom and deviceIdTo
router.get('/from/:idFrom/to/:idTo', (async (req, res) => {
  if (!ObjectId.isValid(req.params.idFrom) || !ObjectId.isValid(req.params.idTo)) {
    res.status(404).json({ error: 'Not found' });

    return;
  }
  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection: Collection = db.collection(collectionName);

  const query = {
    deviceIdFrom: new ObjectId(req.params.idFrom),
    deviceIdTo: new ObjectId(req.params.idTo)
  };

  const result = await collection.findOne(query);

  if (!result) res.status(404).json({ error: 'Not found' });
  else res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

/**
 * @route POST /connections
 * @description Create a new connection.
 * @body {string} name - Name of the connection.
 * @body {string} deviceIdFrom - ObjectId string of the source device.
 * @body {string} deviceIdTo - ObjectId string of the target device.
 * @returns {201} { insertedId: ObjectId } on success.
 * @returns {400} { error: string } if input data is invalid.
 * @returns {500} { error: string } on server error.
 */
router.post('/', (async (req, res) => {
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    // Destructure and sanitize input fields directly
    const { name, deviceIdFrom, deviceIdTo } = req.body;

    const sanitizedName = sanitize(name);

    const sanitizedDeviceIdFrom = sanitize(deviceIdFrom);

    const sanitizedDeviceIdTo = sanitize(deviceIdTo);

    // Validate input
    if (
      typeof sanitizedName !== 'string' ||
      typeof sanitizedDeviceIdFrom !== 'string' ||
      typeof sanitizedDeviceIdTo !== 'string' ||
      !ObjectId.isValid(sanitizedDeviceIdFrom) ||
      !ObjectId.isValid(sanitizedDeviceIdTo)
    ) {
      return res.status(400).json({ error: 'Invalid input data: name must be a string, deviceIdFrom and deviceIdTo must be valid ObjectId strings.' });
    }

    const newDocument: Connection = {
      name: sanitizedName,
      deviceIdFrom: new ObjectId(sanitizedDeviceIdFrom),
      deviceIdTo: new ObjectId(sanitizedDeviceIdTo)
    };

    const result: InsertOneResult<Connection> = await collection.insertOne(newDocument);

    res.status(201).json({ insertedId: result.insertedId });
  } catch {
    res.status(500).json({
      module: 'connections',
      procedure: 'insertOne',
      error: 'Internal server error'
    });
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

// delete all devices with specific :id model
router.delete('/from/:idFrom/to/:idTo', (async (req, res) => {
  if (!ObjectId.isValid(req.params.idFrom) || !ObjectId.isValid(req.params.idTo)) {
    res.status(404).json({ error: 'Not found' });

    return;
  }
  const query = {
    deviceIdFrom: new ObjectId(req.params.idFrom),
    deviceIdTo: new ObjectId(req.params.idTo)
  };

  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection: Collection = db.collection(collectionName);

  const result = await collection.deleteMany(query);

  res.status(200).json({ deletedCount: result.deletedCount });
  await closeConnection(client);
}) as RequestHandler);

router.delete('/from/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: 'Not found' });

    return;
  }
  const query = { deviceIdFrom: new ObjectId(req.params.id) };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result = await collection.deleteMany(query);

    res.status(200).json({ deletedCount: result.deletedCount });
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

router.delete('/to/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: 'Not found' });

    return;
  }
  const query = { deviceIdTo: new ObjectId(req.params.id) };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result = await collection.deleteMany(query);

    res.status(200).json({ deletedCount: result.deletedCount });
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

/**
 * @route DELETE /connections/:id
 * @description Delete a connection by its ObjectId.
 * @param {string} id - ObjectId string of the connection to delete.
 * @returns {200} { deletedCount: number } on success.
 * @returns {404} { error: string } if the connection is not found or id is invalid.
 * @returns {500} { error: string } on server error.
 */
router.delete('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: 'Not found' });

    return;
  }
  const query = { _id: new ObjectId(req.params.id) };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Not found' });
    } else {
      res.status(200).json({ deletedCount: result.deletedCount });
    }
  } catch (err) {
    res.status(500).json({
      module: 'connections',
      procedure: 'deleteConnection',
      error: err instanceof Error ? err.message : 'Unknown error',
      message: 'Internal server error'
    });
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

/**
 * @route DELETE /connections/
 * @description Delete all connections from the collection. This is a destructive operation and requires authentication/authorization.
 * Note: The included authentication middleware is for demonstration purposes only and should be replaced with a secure implementation in production.
 * @security Requires authentication/authorization. The provided middleware is a placeholder and not suitable for production use.
 * @returns {200} { deletedCount: number } on success.
 */

// WARNING: This is a placeholder authentication middleware for demonstration purposes only.
const dummyRequireAuth: express.RequestHandler = (req, res, next) => {
  // WARNING: This is insecure and for demonstration only.
  // Do NOT use hardcoded tokens in production. Replace with a secure authentication mechanism.
  // Example: check for an 'Authorization' header or session
  if (!req.headers.authorization || req.headers.authorization !== '3d-inventory-secret-token') {
    res.status(403).json({ error: 'Forbidden: Unauthorized access' });

    return;
  }
  next();
};

router.delete('/', dummyRequireAuth, (async (_req, res) => {
  try {
    const query: Record<string, unknown> = {};

    const client = await connectToCluster();

    try {
      const db: Db = connectToDb(client);

      const collection: Collection = db.collection(collectionName);

      const result = await collection.deleteMany(query);

      res.status(200).json({ deletedCount: result.deletedCount });
    } finally {
      await closeConnection(client);
    }
  } catch {
    res.status(401).json({ error: 'Unauthorized or authentication error' });
  }
}) as RequestHandler);

export default router;

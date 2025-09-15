import { Request, Response } from 'express';
import sanitize from 'mongo-sanitize';
import { Collection, Db, InsertOneResult, UpdateResult, DeleteResult, ObjectId } from 'mongodb';
import { closeConnection, connectToCluster, connectToDb } from '../utils/db';
import getLogger from '../utils/logger';

const logger = getLogger('connections');

const proc = '[connections]';

const collectionName = 'connections';

export interface Connection {
  _id?: ObjectId;
  name: string;
  deviceIdFrom: ObjectId;
  deviceIdTo: ObjectId;
}

export interface ConnectionInput {
  name: string;
  deviceIdFrom: string;
  deviceIdTo: string;
}

// Constants
const DEFAULT_LIMIT = 256;

const MAX_LIMIT = 1000;

// Get all connections
export async function getAllConnections(req: Request, res: Response) {
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
      logger.info('No connections found');
      res.status(404).json({ message: 'No connections found' });

      return;
    }

    logger.info(`Retrieved ${results.length} connections`);
    res.status(200).json(results);
  } catch (error) {
    logger.error(`${proc} Error fetching connections: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'connections',
      procedure: 'getAllConnections',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

// Get connection by ID
export async function getConnectionById(req: Request, res: Response) {
  const { id } = req.params;

  const query = { _id: new ObjectId(id) };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const connection = await collection.findOne(query);

    if (!connection) {
      logger.warn(`${proc} Connection not found: ${id}`);
      res.status(404).json({ message: 'Connection not found' });

      return;
    }

    logger.info(`${proc} Retrieved connection: ${id}`);
    res.status(200).json(connection);
  } catch (error) {
    logger.error(`${proc} Error fetching connection ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'connections',
      procedure: 'getConnectionById',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

// Get connections from a specific device
export async function getConnectionsFrom(req: Request, res: Response) {
  const { id } = req.params;

  const query = { deviceIdFrom: new ObjectId(id) };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const connections = await collection.find(query).toArray();

    if (!connections.length) {
      logger.info(`${proc} No connections found from device: ${id}`);
      res.status(404).json({ message: `No connections found from device: ${id}` });

      return;
    }

    logger.info(`${proc} Retrieved ${connections.length} connections from device: ${id}`);
    res.status(200).json(connections);
  } catch (error) {
    logger.error(`${proc} Error fetching connections from device ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'connections',
      procedure: 'getConnectionsFrom',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

// Get connections to a specific device
export async function getConnectionsTo(req: Request, res: Response) {
  const { id } = req.params;

  const query = { deviceIdTo: new ObjectId(id) };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const connections = await collection.find(query).toArray();

    if (!connections.length) {
      logger.info(`${proc} No connections found to device: ${id}`);
      res.status(404).json({ message: `No connections found to device: ${id}` });

      return;
    }

    logger.info(`${proc} Retrieved ${connections.length} connections to device: ${id}`);
    res.status(200).json(connections);
  } catch (error) {
    logger.error(`${proc} Error fetching connections to device ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'connections',
      procedure: 'getConnectionsTo',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

// Get connection between two devices
export async function getConnectionBetweenDevices(req: Request, res: Response) {
  const { idFrom, idTo } = req.params;

  if (!ObjectId.isValid(idFrom) || !ObjectId.isValid(idTo)) {
    logger.warn(`${proc} Invalid ObjectIds: ${idFrom}, ${idTo}`);
    res.status(400).json({
      error: 'Invalid ID format',
      message: 'Both device IDs must be valid ObjectIds'
    });

    return;
  }

  const query = {
    deviceIdFrom: new ObjectId(idFrom),
    deviceIdTo: new ObjectId(idTo)
  };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const connection = await collection.findOne(query);

    if (!connection) {
      logger.info(`${proc} No connection found between devices: ${idFrom} -> ${idTo}`);
      res.status(404).json({ message: 'Connection not found between specified devices' });

      return;
    }

    logger.info(`${proc} Retrieved connection between devices: ${idFrom} -> ${idTo}`);
    res.status(200).json(connection);
  } catch (error) {
    logger.error(`${proc} Error fetching connection between devices ${idFrom} -> ${idTo}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'connections',
      procedure: 'getConnectionBetweenDevices',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

// Create new connection
export async function createConnection(req: Request, res: Response) {
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
    logger.warn(`${proc} Invalid connection input data`);
    res.status(400).json({
      error: 'Invalid input data',
      message: 'name must be a string, deviceIdFrom and deviceIdTo must be valid ObjectId strings'
    });

    return;
  }

  const newConnection: Connection = {
    name: sanitizedName,
    deviceIdFrom: new ObjectId(sanitizedDeviceIdFrom),
    deviceIdTo: new ObjectId(sanitizedDeviceIdTo)
  };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result: InsertOneResult<Connection> = await collection.insertOne(newConnection);

    if (!result.acknowledged) {
      res.status(500).json({ message: 'Failed to create connection' });

      return;
    }

    const insertedConnection = { _id: result.insertedId, ...newConnection };

    logger.info(`${proc} Created connection: ${result.insertedId}`);
    res.status(201).json(insertedConnection);
  } catch (error) {
    logger.error(`${proc} Error creating connection: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'connections',
      procedure: 'createConnection',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

// Update connection by ID
export async function updateConnection(req: Request, res: Response) {
  const { id } = req.params;

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
    logger.warn(`${proc} Invalid connection input data for update`);
    res.status(400).json({
      error: 'Invalid input data',
      message: 'name must be a string, deviceIdFrom and deviceIdTo must be valid ObjectId strings'
    });

    return;
  }

  const query = { _id: new ObjectId(id) };

  const updates = {
    $set: {
      name: sanitizedName,
      deviceIdFrom: new ObjectId(sanitizedDeviceIdFrom),
      deviceIdTo: new ObjectId(sanitizedDeviceIdTo)
    }
  };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result: UpdateResult = await collection.updateOne(query, updates);

    if (result.matchedCount === 0) {
      logger.warn(`${proc} Connection not found for update: ${id}`);
      res.status(404).json({ message: 'Connection not found' });

      return;
    }

    logger.info(`${proc} Updated connection: ${id}`);
    res.status(200).json({
      message: 'Connection updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    logger.error(`${proc} Error updating connection ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'connections',
      procedure: 'updateConnection',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

// Delete connection by ID
export async function deleteConnection(req: Request, res: Response) {
  const { id } = req.params;

  const query = { _id: new ObjectId(id) };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result: DeleteResult = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      logger.warn(`${proc} Connection not found for deletion: ${id}`);
      res.status(404).json({ message: 'Connection not found' });

      return;
    }

    logger.info(`${proc} Deleted connection: ${id}`);
    res.status(200).json({
      message: 'Connection deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error(`${proc} Error deleting connection ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'connections',
      procedure: 'deleteConnection',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

// Delete connections from device
export async function deleteConnectionsFrom(req: Request, res: Response) {
  const { id } = req.params;

  const query = { deviceIdFrom: new ObjectId(id) };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result: DeleteResult = await collection.deleteMany(query);

    logger.info(`${proc} Deleted ${result.deletedCount} connections from device: ${id}`);
    res.status(200).json({
      message: `Deleted connections from device: ${id}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error(`${proc} Error deleting connections from device ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'connections',
      procedure: 'deleteConnectionsFrom',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

// Delete connections to device
export async function deleteConnectionsTo(req: Request, res: Response) {
  const { id } = req.params;

  const query = { deviceIdTo: new ObjectId(id) };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result: DeleteResult = await collection.deleteMany(query);

    logger.info(`${proc} Deleted ${result.deletedCount} connections to device: ${id}`);
    res.status(200).json({
      message: `Deleted connections to device: ${id}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error(`${proc} Error deleting connections to device ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'connections',
      procedure: 'deleteConnectionsTo',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

// Delete connections between devices
export async function deleteConnectionsBetweenDevices(req: Request, res: Response) {
  const { idFrom, idTo } = req.params;

  if (!ObjectId.isValid(idFrom) || !ObjectId.isValid(idTo)) {
    logger.warn(`${proc} Invalid ObjectIds for deletion: ${idFrom}, ${idTo}`);
    res.status(400).json({
      error: 'Invalid ID format',
      message: 'Both device IDs must be valid ObjectIds'
    });

    return;
  }

  const query = {
    deviceIdFrom: new ObjectId(idFrom),
    deviceIdTo: new ObjectId(idTo)
  };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result: DeleteResult = await collection.deleteMany(query);

    logger.info(`${proc} Deleted ${result.deletedCount} connections between devices: ${idFrom} -> ${idTo}`);
    res.status(200).json({
      message: `Deleted connections between devices: ${idFrom} -> ${idTo}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error(`${proc} Error deleting connections between devices ${idFrom} -> ${idTo}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'connections',
      procedure: 'deleteConnectionsBetweenDevices',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

// Delete all connections
export async function deleteAllConnections(req: Request, res: Response) {
  // Production safety check
  if (process.env.NODE_ENV === 'production') {
    logger.warn(`${proc} Attempt to delete all connections in production environment`);
    res.status(403).json({
      error: 'Forbidden in production environment',
      message: 'This operation is not allowed in production'
    });

    return;
  }

  if (req.query.confirm !== 'true') {
    logger.warn(`${proc} Missing confirmation for delete all connections`);
    res.status(400).json({
      error: 'Confirmation required',
      message: 'Add ?confirm=true to proceed with deleting all connections'
    });

    return;
  }

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result: DeleteResult = await collection.deleteMany({});

    logger.warn(`${proc} Deleted all ${result.deletedCount} connections`);
    res.status(200).json({
      message: 'All connections deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error(`${proc} Error deleting all connections: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'connections',
      procedure: 'deleteAllConnections',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

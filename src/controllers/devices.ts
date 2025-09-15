import { Request, Response } from 'express';
import type { Collection, Db, UpdateFilter, Document, InsertOneResult, OptionalId } from 'mongodb';
import { ObjectId as MongoObjectId } from 'mongodb';
import getLogger from '../utils/logger';
import { closeConnection, connectToCluster, connectToDb } from '../utils/db';
import { CreateLog } from '../services/logs';

const logger = getLogger('devices');

// const proc = '[devices]';

const collectionName = 'devices';

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

// Get all devices
export async function getAllDevices(_req: Request, res: Response) {
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
}

// Get device by ID
export async function getDeviceById(req: Request, res: Response) {
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const query = { _id: new MongoObjectId(req.params.id) };

    const result = await collection.findOne(query);

    if (!result) {
      logger.warn(`GET /devices/${req.params.id} - not found device`);
      res.status(404).send('Not found');
    } else {
      logger.info(`GET /devices/${req.params.id} - oki, device: ${JSON.stringify(result)}`);
      res.status(200).json(result);
    }
  } finally {
    await closeConnection(client);
  }
}

// Update device by ID
export async function updateDevice(req: Request, res: Response) {
  const query = { _id: new MongoObjectId(req.params.id) };

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

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result = await collection.updateOne(query, updates);

    if (result.modifiedCount === 0) {
      logger.error(`PUT /devices/${req.params.id} - not found devices to update`);
      res.status(404).send('Not found devices to update');
    } else {
      const updatedDevice = await collection.findOne(query);

      logger.info(`PUT /devices/${req.params.id} - oki updated ${result.modifiedCount} devices`);
      res.status(200).json(updatedDevice);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error(`PUT /devices/${req.params.id} - error updating device: ${errorMessage}`);
    res.status(500).json({
      module: 'devices',
      procedure: 'updateDevice',
      status: 'Internal Server Error',
      message: errorMessage
    });
  } finally {
    await closeConnection(client);
  }
}

// Create new device
export async function createDevice(req: Request, res: Response) {
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    logger.error(`POST /devices - body: ${JSON.stringify(req.body)}`);

    if (!req.body || Object.keys(req.body).length === 0) {
      logger.error('POST /devices - No data provided');
      res.status(400).send('POST /devices - No data provided');

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
      const resultLog = await CreateLog(result.insertedId.toString(), newDocument, 'Create', 'Device');

      res.status(200).json(resultLog);
    }
  } finally {
    await closeConnection(client);
  }
}

// Get devices by model ID
export async function getDevicesByModel(req: Request, res: Response) {
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
}

// Update device position
export async function updateDevicePosition(req: Request, res: Response) {
  const query = { _id: new MongoObjectId(req.params.id) };

  const updates: UpdateFilter<Document>[] = [
    {
      $set: { position: req.body as Position }
    }
  ];

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result = await collection.updateOne(query, updates);

    if (!result || result.modifiedCount === 0) {
      logger.error(`PATCH /devices/position/${req.params.id} - no position updated`);
      res.status(404).send('No position updated');
    } else {
      logger.info(`PATCH /devices/position/${req.params.id} - position updated successfully`);
      res.status(200).json(result);
    }
  } catch (error) {
    logger.error(`PATCH /devices/position/${req.params.id} - error updating position: ${(error as Error).message}`);
    res.status(500).json({
      module: 'devices',
      procedure: 'updateDevicePosition',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}

// Delete device by ID
export async function deleteDevice(req: Request, res: Response) {
  const query = { _id: new MongoObjectId(req.params.id) };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result = await collection.deleteOne(query);

    if (!result) {
      logger.error(`DELETE /devices/${req.params.id} - Device not deleted`);
      res.status(500).json({ error: `DELETE /devices/${req.params.id} - Device not deleted` });
    } else {
      logger.info(`DELETE /devices/${req.params.id} - device deleted successfully.`);
      res.status(200).json(result);
    }
  } finally {
    await closeConnection(client);
  }
}

// Delete all devices (requires auth)
export async function deleteAllDevices(_req: Request, res: Response) {
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result = await collection.deleteMany({});

    res.status(200).json(result);
  } finally {
    await closeConnection(client);
  }
}

// Delete devices by model ID
export async function deleteDevicesByModel(req: Request, res: Response) {
  const query = { modelId: req.params.id };

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const result = await collection.deleteMany(query);

    res.status(200).json(result);
  } finally {
    await closeConnection(client);
  }
}

/**
 * @description This file contains the router for handling log-related API endpoints.
 * @module routers
 */

import { format } from 'date-fns';
import express, { RequestHandler } from 'express';
import { Collection, Db, Document, Filter, InsertOneResult, ObjectId } from 'mongodb';

import { closeConnection, connectToCluster, connectToDb } from '../utils/db';
import log from '../utils/logger';

const logger = log('logs');

const VALID_COMPONENTS = ['attributes', 'devices', 'floors', 'models', 'connections', 'users', 'attributesDictionary'];

//const VALID_OPERATIONS = ['Create', 'Update', 'Delete', 'Fetch'];

export interface Logs {
  _id: ObjectId;
  objectId: string;
  date: string;
  operation: string;
  component: string;
  message: string;
}

const collectionName = 'logs';

const router: express.Router = express.Router();

router.get('/', (async (req: express.Request, res: express.Response): Promise<void> => {
  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection = db.collection(collectionName);

  const results: object[] = await collection.find({}).sort({ date: -1 }).limit(200).toArray();

  if (!results) {
    res.sendStatus(404);
  } else {
    res.status(200).json(results);
  }
  await closeConnection(client);
}) as RequestHandler);

router.get('/component/:component', (async (req, res) => {
  const component = req.params.component;

  const validComponentsString = VALID_COMPONENTS.join(', ');

  //const validOperationsString = VALID_OPERATIONS.join(', ');

  if (!component) {
    logger.error('GET /logs/component/ - No component name provided.');
    res.status(400).json({
      message: `Component name is required. Valid components are: [${validComponentsString}].`
    });

    return;
  }

  if (!VALID_COMPONENTS.includes(component)) {
    logger.warn(`GET /logs/component/${component} - Invalid component: ${component}. Valid components are: [${validComponentsString}].`);
    res.status(400).json({
      message: `Invalid component: ${component}. Valid components are: [${validComponentsString}].`
    });

    return;
  }

  // if (!req.query.operation || !VALID_OPERATIONS.includes(req.query.operation as string)) {
  //   logger.warn(`GET /logs/component/${component} - Invalid or missing operation: ${req.query.operation}. Valid operations are: [${validOperationsString}].`);
  //   res.status(400).json({
  //     message: `Invalid or missing operation. Valid operations are: [${validOperationsString}].`
  //   });

  //   return;
  // }

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection<Document> = db.collection(collectionName);

    const operation = req.query.operation as string;

    const query: Filter<Document> = { component: component, operation: operation };

    logger.info(`GET /logs/component/${component} - Query: ${JSON.stringify(query)}`);
    const result = await collection.find(query).sort({ date: -1 }).toArray();

    if (!result.length) {
      logger.warn(`GET /logs/component/${component} - No logs found.`);
      res.status(404).json({ message: `No logs found for component: ${component}.` });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    logger.error(`GET /logs/component/${component} - Error: ${error}`);
    res.status(500).json({
      module: 'logs',
      procedure: 'fetchLogsByComponent',
      status: 'Internal server error.',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

router.get('/model/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404);
  }
  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection: Collection = db.collection(collectionName);

  if (!ObjectId.isValid(req.params.id)) {
    logger.error(`GET /logs/model/${req.params.id} Invalid Id`);
    res.status(400).send('Invalid ID');

    return;
  }
  const query = { modelId: new ObjectId(req.params.id) };

  const result = await collection.find(query).sort({ date: -1 }).toArray();

  if (!result) {
    res.sendStatus(404);
    logger.warn(`GET /logs/model/${req.params.id}, query: ${JSON.stringify(query)} - 404 not found any model for objectId.`);
  } else {
    res.status(200).json(result);
    logger.info(`GET /logs/model/${req.params.id}, query: ${JSON.stringify(query)}`);
  }
  await closeConnection(client);
}) as RequestHandler);

router.get('/:id', (async (req, res) => {
  const { id } = req.params;

  if (!id) {
    logger.error('GET /logs/:id - No ID provided.');
    res.status(400).json({ message: 'ID is required.' });

    return;
  }

  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const query = { objectId: id };

    logger.info(`GET /logs/${id} - Query: ${JSON.stringify(query)}`);

    const result = await collection.find(query).sort({ date: -1 }).toArray();

    if (!result.length) {
      logger.warn(`GET /logs/${id} - No logs found for objectId.`);
      res.status(404).json({ message: `No logs found for objectId: ${id}.` });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    logger.error(`GET /logs/${id} - Error: ${error}`);
    res.status(500).json({
      module: 'logs',
      procedure: 'fetchLogsById',
      message: 'Internal server error.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

const requiredLogFields: (keyof Logs)[] = ['objectId', 'operation', 'component', 'message'];

router.post('/', (async (req, res) => {
  const client = await connectToCluster();

  try {
    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const newDocument: Logs = req.body as Logs;

    newDocument.date = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const missingFields = requiredLogFields.filter((field) => !newDocument[field]);

    if (missingFields.length > 0) {
      logger.error(`POST /logs/ - Missing required fields in request body: ${JSON.stringify(newDocument)}`);
      res.status(400).json({
        message: `Missing required fields in request body: ${missingFields.join(', ')}`
      });

      return;
    }
    if (!VALID_COMPONENTS.includes(newDocument.component)) {
      logger.error(`POST /logs/ - Invalid component: ${newDocument.component}`);
      res.status(400).json({
        message: `Invalid component value: ${newDocument.component}. Valid components are: [${VALID_COMPONENTS.join(', ')}].`
      });

      return;
    }
    const results: InsertOneResult<Document> = await collection.insertOne(newDocument);

    if (!results.acknowledged) {
      logger.error(`POST /logs/ - Log not created. Data: ${JSON.stringify(newDocument)}`);
      res.status(500).json({ message: 'Failed to create log.' });

      return;
    }
    logger.info(`POST /logs/ - Log created. Data: ${JSON.stringify(newDocument)}`);
    res.status(201).json(newDocument);
  } catch (error) {
    logger.error(`POST /logs/ - Error: ${error}`);
    res.status(500).json({
      module: 'logs',
      procedure: 'createLog',
      message: 'Internal server error.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

router.delete('/:id', (async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };

  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection: Collection = db.collection(collectionName);

  const result = await collection.deleteOne(query);

  res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

router.delete('/', (async (req, res) => {
  const query = {};

  const client = await connectToCluster();

  const db: Db = connectToDb(client);

  const collection: Collection = db.collection(collectionName);

  const result = await collection.deleteMany(query);

  res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

export default router;

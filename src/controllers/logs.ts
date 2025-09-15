import { RequestHandler } from 'express';
import { format } from 'date-fns';
import { Collection, Db, Document, Filter, InsertOneResult, ObjectId } from 'mongodb';
import mongoSanitize from 'mongo-sanitize';
import { closeConnection, connectToCluster, connectToDb } from '../utils/db';
import getLogger from '../utils/logger';

const logger = getLogger('logs');

const proc = '[logs]';

export interface Logs {
  _id: ObjectId;
  objectId: string;
  date: string;
  operation: string;
  component: string;
  message: string;
}

const collectionName = 'logs';

const VALID_COMPONENTS = ['attributes', 'devices', 'floors', 'models', 'connections', 'users', 'attributesDictionary'];

const requiredLogFields: (keyof Logs)[] = ['objectId', 'operation', 'component', 'message'];

/**
 * Get all logs with sorting and limit
 */
export const getAllLogs: RequestHandler = async (_req, res) => {
  let client;

  try {
    client = await connectToCluster();

    const db: Db = connectToDb(client);

    const collection = db.collection(collectionName);

    const results: object[] = await collection.find({}).sort({ date: -1 }).limit(200).toArray();

    if (!results || results.length === 0) {
      logger.warn(`${proc} No logs found`);
      res.sendStatus(404);
    } else {
      logger.info(`${proc} Retrieved ${results.length} logs`);
      res.status(200).json(results);
    }
  } catch (error) {
    logger.error(`${proc} Error fetching logs: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'logs',
      procedure: 'getAllLogs',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    });
  } finally {
    if (client) {
      await closeConnection(client);
    }
  }
};

/**
 * Get logs by objectId
 */
export const getLogsByObjectId: RequestHandler = async (req, res) => {
  const { id } = req.params;

  let client;

  try {
    client = await connectToCluster();

    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const query = { objectId: id };

    logger.info(`${proc} Query: ${JSON.stringify(query)}`);

    const result = await collection.find(query).sort({ date: -1 }).toArray();

    if (!result.length) {
      logger.warn(`${proc} No logs found for objectId: ${id}`);
      res.status(404).json({ message: `No logs found for objectId: ${id}.` });
    } else {
      logger.info(`${proc} Retrieved ${result.length} logs for objectId: ${id}`);
      res.status(200).json(result);
    }
  } catch (error) {
    logger.error(`${proc} Error fetching logs for objectId ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'logs',
      procedure: 'getLogsByObjectId',
      message: 'Internal server error.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (client) {
      await closeConnection(client);
    }
  }
};

/**
 * Get logs by component with optional operation filter
 */
export const getLogsByComponent: RequestHandler = async (req, res) => {
  const component = req.params.component;

  const validComponentsString = VALID_COMPONENTS.join(', ');

  let client;

  try {
    if (!VALID_COMPONENTS.includes(component)) {
      logger.warn(`${proc} Invalid component: ${component}. Valid components are: [${validComponentsString}].`);
      res.status(400).json({
        message: `Invalid component: ${component}. Valid components are: [${validComponentsString}].`
      });

      return;
    }

    client = await connectToCluster();

    const db: Db = connectToDb(client);

    const collection: Collection<Document> = db.collection(collectionName);

    const operation = req.query.operation as string;

    const query: Filter<Document> = { component: component };

    if (operation) {
      query.operation = operation;
    }

    logger.info(`${proc} Query: ${JSON.stringify(query)}`);

    const result = await collection.find(query).sort({ date: -1 }).toArray();

    if (!result.length) {
      logger.warn(`${proc} No logs found for component: ${component}`);
      res.status(404).json({ message: `No logs found for component: ${component}.` });
    } else {
      logger.info(`${proc} Retrieved ${result.length} logs for component: ${component}`);
      res.status(200).json(result);
    }
  } catch (error) {
    logger.error(`${proc} Error fetching logs for component ${component}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'logs',
      procedure: 'getLogsByComponent',
      status: 'Internal server error.',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (client) {
      await closeConnection(client);
    }
  }
};

/**
 * Get logs by model ID
 */
export const getLogsByModelId: RequestHandler = async (req, res) => {
  const { id } = req.params;

  let client;

  try {
    client = await connectToCluster();

    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const query = { modelId: new ObjectId(id) };

    const result = await collection.find(query).sort({ date: -1 }).toArray();

    if (!result || result.length === 0) {
      logger.warn(`${proc} No logs found for model ${id}`);
      res.sendStatus(404);
    } else {
      logger.info(`${proc} Retrieved ${result.length} logs for model ${id}, query: ${JSON.stringify(query)}`);
      res.status(200).json(result);
    }
  } catch (error) {
    logger.error(`${proc} Error fetching logs for model ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'logs',
      procedure: 'getLogsByModelId',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    });
  } finally {
    if (client) {
      await closeConnection(client);
    }
  }
};

/**
 * Create new log entry
 */
export const createLog: RequestHandler = async (req, res) => {
  let client;

  try {
    client = await connectToCluster();

    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    // Sanitize input
    const sanitizedBody = mongoSanitize(req.body);

    const newDocument: Logs = sanitizedBody as Logs;

    newDocument.date = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const missingFields = requiredLogFields.filter((field) => !newDocument[field]);

    if (missingFields.length > 0) {
      logger.error(`${proc} Missing required fields in request body: ${JSON.stringify(newDocument)}`);
      res.status(400).json({
        message: `Missing required fields in request body: ${missingFields.join(', ')}`
      });

      return;
    }

    if (!VALID_COMPONENTS.includes(newDocument.component)) {
      logger.error(`${proc} Invalid component: ${newDocument.component}`);
      res.status(400).json({
        message: `Invalid component value: ${newDocument.component}. Valid components are: [${VALID_COMPONENTS.join(', ')}].`
      });

      return;
    }

    const results: InsertOneResult<Document> = await collection.insertOne(newDocument);

    if (!results.acknowledged) {
      logger.error(`${proc} Log not created. Data: ${JSON.stringify(newDocument)}`);
      res.status(500).json({ message: 'Failed to create log.' });

      return;
    }

    logger.info(`${proc} Log created. Data: ${JSON.stringify(newDocument)}`);
    res.status(201).json(newDocument);
  } catch (error) {
    logger.error(`${proc} Error creating log: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'logs',
      procedure: 'createLog',
      message: 'Internal server error.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (client) {
      await closeConnection(client);
    }
  }
};

/**
 * Delete log by ID
 */
export const deleteLog: RequestHandler = async (req, res) => {
  const { id } = req.params;

  let client;

  try {
    client = await connectToCluster();

    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const query = { _id: new ObjectId(id) };

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      logger.warn(`${proc} Log ${id} not found for deletion`);
      res.status(404).send('Log not found');
    } else {
      logger.info(`${proc} Deleted log ${id}`);
      res.status(200).json(result);
    }
  } catch (error) {
    logger.error(`${proc} Error deleting log ${id}: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'logs',
      procedure: 'deleteLog',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    });
  } finally {
    if (client) {
      await closeConnection(client);
    }
  }
};

/**
 * Delete all logs
 */
export const deleteAllLogs: RequestHandler = async (_req, res) => {
  let client;

  try {
    client = await connectToCluster();

    const db: Db = connectToDb(client);

    const collection: Collection = db.collection(collectionName);

    const query = {};

    const result = await collection.deleteMany(query);

    if (result.deletedCount === 0) {
      logger.warn(`${proc} No logs found to delete`);
      res.status(404).send('Not found logs to delete');
    } else {
      logger.info(`${proc} Deleted ${result.deletedCount} logs`);
      res.status(200).json(result);
    }
  } catch (error) {
    logger.error(`${proc} Error deleting all logs: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      module: 'logs',
      procedure: 'deleteAllLogs',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    });
  } finally {
    if (client) {
      await closeConnection(client);
    }
  }
};

export { VALID_COMPONENTS };

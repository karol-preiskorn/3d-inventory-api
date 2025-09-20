import { format } from 'date-fns'
import { RequestHandler } from 'express'
import mongoSanitize from 'mongo-sanitize'
import { Collection, Db, Document, Filter, InsertOneResult, DeleteResult, ObjectId } from 'mongodb'
import { closeConnection, connectToCluster, connectToDb } from '../utils/db'
import getLogger from '../utils/logger'

const logger = getLogger('logs')
const proc = '[logs]'

export interface Logs {
  _id?: ObjectId;
  objectId: string;
  date: string;
  operation: string;
  component: string;
  message: string;
}

const collectionName = 'logs'

export const VALID_COMPONENTS = ['attributes', 'devices', 'floors', 'models', 'connections', 'users', 'attributesDictionary'] as const

// Constants
const DEFAULT_LIMIT = 200
const MAX_LIMIT = 1000

/**
 * Get all logs with sorting and limit
 */
export const getAllLogs: RequestHandler = async (req, res) => {
  let client
  let limit = DEFAULT_LIMIT

  if (req.query.limit) {
    const parsed = parseInt(req.query.limit as string, 10)

    if (!isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, MAX_LIMIT)
    }
  }

  try {
    client = await connectToCluster()
    const db: Db = connectToDb(client)
    const collection = db.collection(collectionName)
    const results: Document[] = await collection.find({}).sort({ date: -1 }).limit(limit).toArray()

    if (!results || results.length === 0) {
      logger.info(`${proc} No logs found`)
      res.status(200).json({ message: 'No logs found', data: [] })
    } else {
      logger.info(`${proc} Retrieved ${results.length} logs`)
      res.status(200).json({ data: results, count: results.length })
    }
  } catch (error) {
    logger.error(`${proc} Error fetching logs: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'logs',
      procedure: 'getAllLogs',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Get logs by objectId
 */
export const getLogsByObjectId: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    client = await connectToCluster()
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { objectId: id }

    logger.info(`${proc} Query: ${JSON.stringify(query)}`)
    const result = await collection.find(query).sort({ date: -1 }).toArray()

    if (!result.length) {
      logger.info(`${proc} No logs found for objectId: ${id}`)
      res.status(200).json({ message: `No logs found for objectId: ${id}`, data: [] })
    } else {
      logger.info(`${proc} Retrieved ${result.length} logs for objectId: ${id}`)
      res.status(200).json({ data: result, count: result.length })
    }
  } catch (error) {
    logger.error(`${proc} Error fetching logs for objectId ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'logs',
      procedure: 'getLogsByObjectId',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Get logs by component with optional operation filter
 */
export const getLogsByComponent: RequestHandler = async (req, res) => {
  const component = req.params.component
  let client

  try {
    client = await connectToCluster()
    const db: Db = connectToDb(client)
    const collection: Collection<Document> = db.collection(collectionName)
    const operation = req.query.operation as string
    const query: Filter<Document> = { component: component }

    if (operation && typeof operation === 'string' && operation.trim().length > 0) {
      query.operation = operation.trim()
    }

    logger.info(`${proc} Query: ${JSON.stringify(query)}`)
    const result = await collection.find(query).sort({ date: -1 }).toArray()

    if (!result.length) {
      logger.info(`${proc} No logs found for component: ${component}`)
      res.status(200).json({ message: `No logs found for component: ${component}`, data: [] })
    } else {
      logger.info(`${proc} Retrieved ${result.length} logs for component: ${component}`)
      res.status(200).json({ data: result, count: result.length })
    }
  } catch (error) {
    logger.error(`${proc} Error fetching logs for component ${component}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'logs',
      procedure: 'getLogsByComponent',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Get logs by model ID
 */
export const getLogsByModelId: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    if (!ObjectId.isValid(id)) {
      logger.warn(`${proc} Invalid ObjectId: ${id}`)
      res.status(400).json({
        error: 'Invalid ID format',
        message: 'The provided ID is not a valid ObjectId'
      })

      return
    }

    client = await connectToCluster()
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    // Fixed: Use objectId field instead of modelId to match log structure
    const query = { objectId: id, component: 'models' }
    const result = await collection.find(query).sort({ date: -1 }).toArray()

    if (!result || result.length === 0) {
      logger.info(`${proc} No logs found for model ${id}`)
      res.status(200).json({ message: `No logs found for model: ${id}`, data: [] })
    } else {
      logger.info(`${proc} Retrieved ${result.length} logs for model ${id}`)
      res.status(200).json({ data: result, count: result.length })
    }
  } catch (error) {
    logger.error(`${proc} Error fetching logs for model ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'logs',
      procedure: 'getLogsByModelId',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Create new log entry
 */
export const createLog: RequestHandler = async (req, res) => {
  let client

  try {
    const { objectId, operation, component, message } = req.body
    // Sanitize input
    const sanitizedObjectId = mongoSanitize(objectId)?.toString().trim()
    const sanitizedOperation = mongoSanitize(operation)?.toString().trim()
    const sanitizedComponent = mongoSanitize(component)?.toString().trim()
    const sanitizedMessage = mongoSanitize(message)?.toString().trim()

    // Validate required fields
    if (!sanitizedObjectId || !sanitizedOperation || !sanitizedComponent || !sanitizedMessage) {
      const missingFields = []

      if (!sanitizedObjectId) missingFields.push('objectId')
      if (!sanitizedOperation) missingFields.push('operation')
      if (!sanitizedComponent) missingFields.push('component')
      if (!sanitizedMessage) missingFields.push('message')

      logger.warn(`${proc} Missing required fields: ${missingFields.join(', ')}`)
      res.status(400).json({
        error: 'Invalid input data',
        message: `Missing required fields: ${missingFields.join(', ')}`
      })

      return
    }

    // Validate component
    if (!VALID_COMPONENTS.includes(sanitizedComponent as typeof VALID_COMPONENTS[number])) {
      logger.warn(`${proc} Invalid component: ${sanitizedComponent}`)
      res.status(400).json({
        error: 'Invalid input data',
        message: `Invalid component: ${sanitizedComponent}. Valid components are: [${VALID_COMPONENTS.join(', ')}]`
      })

      return
    }

    const newDocument: Logs = {
      objectId: sanitizedObjectId,
      operation: sanitizedOperation,
      component: sanitizedComponent,
      message: sanitizedMessage,
      date: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    }

    client = await connectToCluster()
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const result: InsertOneResult<Document> = await collection.insertOne(newDocument)

    if (!result.acknowledged) {
      logger.error(`${proc} Log not created. Data: ${JSON.stringify(newDocument)}`)
      res.status(500).json({ message: 'Failed to create log' })

      return
    }

    const insertedLog = { _id: result.insertedId, ...newDocument }

    logger.info(`${proc} Log created with ID: ${result.insertedId}`)
    res.status(201).json(insertedLog)
  } catch (error) {
    logger.error(`${proc} Error creating log: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'logs',
      procedure: 'createLog',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Delete log by ID
 */
export const deleteLog: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    if (!ObjectId.isValid(id)) {
      logger.warn(`${proc} Invalid ObjectId: ${id}`)
      res.status(400).json({
        error: 'Invalid ID format',
        message: 'The provided ID is not a valid ObjectId'
      })

      return
    }

    client = await connectToCluster()
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { _id: new ObjectId(id) }
    const result: DeleteResult = await collection.deleteOne(query)

    if (result.deletedCount === 0) {
      logger.warn(`${proc} Log ${id} not found for deletion`)
      res.status(404).json({ message: 'Log not found' })
    } else {
      logger.info(`${proc} Deleted log ${id}`)
      res.status(200).json({
        message: 'Log deleted successfully',
        deletedCount: result.deletedCount
      })
    }
  } catch (error) {
    logger.error(`${proc} Error deleting log ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'logs',
      procedure: 'deleteLog',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Delete all logs
 */
export const deleteAllLogs: RequestHandler = async (req, res) => {
  let client

  try {
    // Production safety check
    if (process.env.NODE_ENV === 'production') {
      logger.warn(`${proc} Attempt to delete all logs in production environment`)
      res.status(403).json({
        error: 'Forbidden in production environment',
        message: 'This operation is not allowed in production'
      })

      return
    }

    if (req.query.confirm !== 'true') {
      logger.warn(`${proc} Missing confirmation for delete all logs`)
      res.status(400).json({
        error: 'Confirmation required',
        message: 'Add ?confirm=true to proceed with deleting all logs'
      })

      return
    }

    client = await connectToCluster()
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const result: DeleteResult = await collection.deleteMany({})

    if (result.deletedCount === 0) {
      logger.info(`${proc} No logs found to delete`)
      res.status(200).json({ message: 'No logs found to delete', deletedCount: 0 })
    } else {
      logger.warn(`${proc} Deleted ${result.deletedCount} logs`)
      res.status(200).json({
        message: 'All logs deleted successfully',
        deletedCount: result.deletedCount
      })
    }
  } catch (error) {
    logger.error(`${proc} Error deleting all logs: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'logs',
      procedure: 'deleteAllLogs',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

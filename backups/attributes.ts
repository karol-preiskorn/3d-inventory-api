import { RequestHandler } from 'express'
import mongoSanitize from 'mongo-sanitize'
import { Collection, Db, ObjectId } from 'mongodb'
import { closeConnection, connectToCluster, connectToDb } from '../utils/db'
import getLogger from '../utils/logger'

const logger = getLogger('attributes')
const proc = '[attributes]'

export interface Attributes {
  _id: ObjectId
  attributeDictionaryId: ObjectId | null
  connectionId: ObjectId | null
  deviceId: ObjectId | null
  modelId: ObjectId | null
  value: string
}

const collectionName = 'attributes'

/**
 * Get all attributes with optional limit
 */
export const getAllAttributes: RequestHandler = async (_req, res) => {
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const results: object[] = await collection.find({}).limit(100).toArray()

    if (!results || results.length === 0) {
      logger.warn(`${proc} No attributes found`)
      res.status(404).send('Not found any attributes')
    } else {
      logger.info(`${proc} Retrieved ${results.length} attributes`)
      res.status(200).json(results)
    }
  } catch (error) {
    logger.error(`${proc} Error fetching attributes: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributes',
      procedure: 'getAllAttributes',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Get attribute by ID
 */
export const getAttributeById: RequestHandler = async (req, res) => {
  // Sanitize and validate id param
  const id = mongoSanitize(req.params.id)

  if (!ObjectId.isValid(id)) {
    logger.warn(`${proc} Invalid attribute id: ${id}`)

    return res.status(400).json({ error: 'Invalid attribute id' })
  }

  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const result = await collection.findOne({ _id: new ObjectId(id) })

    if (!result) {
      logger.warn(`${proc} Attribute with id ${id} not found`)
      res.sendStatus(404)
    } else {
      logger.info(`${proc} Retrieved attribute with id ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error fetching attribute ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributes',
      procedure: 'getAttributeById',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Get attributes by model ID
 */
export const getAttributesByModelId: RequestHandler = async (req, res) => {
  // Sanitize and validate id param
  const id = mongoSanitize(req.params.id)

  if (!ObjectId.isValid(id)) {
    logger.warn(`${proc} Invalid model id: ${id}`)

    return res.status(400).json({ error: 'Invalid model id' })
  }

  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { modelId: new ObjectId(id) }
    const result = await collection.find(query).toArray()

    if (!result || result.length === 0) {
      logger.warn(`${proc} No attributes found for model ${id}`)
      res.sendStatus(404)
    } else {
      logger.info(`${proc} Retrieved ${result.length} attributes for model ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error fetching attributes for model ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributes',
      procedure: 'getAttributesByModelId',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Get attributes by device ID
 */
export const getAttributesByDeviceId: RequestHandler = async (req, res) => {
  // Sanitize and validate id param
  const id = mongoSanitize(req.params.id)

  if (!ObjectId.isValid(id)) {
    logger.warn(`${proc} Invalid device id: ${id}`)

    return res.status(400).json({ error: 'Invalid device id' })
  }

  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { deviceId: new ObjectId(id) }
    const result = await collection.find(query).toArray()

    if (!result || result.length === 0) {
      logger.warn(`${proc} No attributes found for device ${id}`)
      res.sendStatus(404)
    } else {
      logger.info(`${proc} Retrieved ${result.length} attributes for device ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error fetching attributes for device ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributes',
      procedure: 'getAttributesByDeviceId',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Get attributes by connection ID
 */
export const getAttributesByConnectionId: RequestHandler = async (req, res) => {
  // Sanitize and validate id param
  const id = mongoSanitize(req.params.id)

  if (!ObjectId.isValid(id)) {
    logger.warn(`${proc} Invalid connection id: ${id}`)

    return res.status(400).json({ error: 'Invalid connection id' })
  }

  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { connectionId: new ObjectId(id) }
    const result = await collection.find(query).toArray()

    if (!result || result.length === 0) {
      logger.warn(`${proc} No attributes found for connection ${id}`)
      res.sendStatus(404)
    } else {
      logger.info(`${proc} Retrieved ${result.length} attributes for connection ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error fetching attributes for connection ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributes',
      procedure: 'getAttributesByConnectionId',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Create new attribute
 */
export const createAttribute: RequestHandler = async (req, res) => {
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    // Sanitize input
    const sanitizedBody = mongoSanitize(req.body)
    const { attributeDictionaryId, connectionId, deviceId, modelId, value } = sanitizedBody

    if (
      !value ||
      typeof value !== 'string' ||
      !attributeDictionaryId ||
      typeof attributeDictionaryId !== 'string' ||
      (!connectionId && !deviceId && !modelId)
    ) {
      return res.status(400).json({
        error: 'Missing or invalid "value", "attributeDictionaryId", or at least one of "connectionId", "deviceId", "modelId" must be provided'
      })
    }

    if (!ObjectId.isValid(attributeDictionaryId)) {
      return res.status(400).json({ error: '"attributeDictionaryId" must be a valid ObjectId string' })
    }

    // Helper to validate and convert ObjectId fields
    function toObjectIdOrNull(id: unknown): ObjectId | null {
      return typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : null
    }

    const newAttribute: Omit<Attributes, '_id'> = {
      attributeDictionaryId: new ObjectId(attributeDictionaryId),
      connectionId: toObjectIdOrNull(connectionId),
      deviceId: toObjectIdOrNull(deviceId),
      modelId: toObjectIdOrNull(modelId),
      value
    }
    const result = await collection.insertOne(newAttribute)
    const createdAttribute = { _id: result.insertedId, ...newAttribute }

    if (result.acknowledged) {
      logger.info(`${proc} Created attribute with id ${result.insertedId}`)
      res.status(201).json(createdAttribute)
    } else {
      logger.error(`${proc} Failed to create attribute - not acknowledged`)
      res.status(500).send('Failed to create attribute')
    }
  } catch (error) {
    logger.error(`${proc} Error creating attribute: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributes',
      procedure: 'createAttribute',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Update attribute by ID
 */
export const updateAttribute: RequestHandler = async (req, res) => {
  // Sanitize and validate id param
  const id = mongoSanitize(req.params.id)

  if (!ObjectId.isValid(id)) {
    logger.warn(`${proc} Invalid attribute id: ${id}`)

    return res.status(400).json({ error: 'Invalid attribute id' })
  }

  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    // Sanitize input
    const sanitizedBody = mongoSanitize(req.body)
    // Remove _id from sanitizedBody if present
    const updateBody = { ...sanitizedBody }

    if ('_id' in updateBody) {
      delete updateBody._id
    }

    const updates = {
      $set: {
        attributeDictionaryId: updateBody.attributeDictionaryId || null,
        connectionId: updateBody.connectionId || null,
        deviceId: updateBody.deviceId || null,
        modelId: updateBody.modelId || null,
        value: updateBody.value
      }
    }
    const query = { _id: new ObjectId(id) }
    const result = await collection.updateOne(query, updates)

    if (result.matchedCount === 0) {
      logger.warn(`${proc} Attribute ${id} not found for update`)

      return res.status(404).type('text/plain').send(`Attribute ${id} not found`)
    }

    logger.info(`${proc} Updated attribute ${id}, modified count: ${result.modifiedCount}`)
    res.status(200).json({ updatedCount: result.modifiedCount })
  } catch (error) {
    logger.error(`${proc} Error updating attribute ${id}: ${error instanceof Error ? error.message : String(error)}`)
    const errorMessage = error instanceof Error ? error.message : String(error)

    res.status(500).json({
      module: 'attributes',
      procedure: 'updateAttribute',
      status: 'Internal Server Error',
      message: errorMessage
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Delete attribute by ID
 */
export const deleteAttribute: RequestHandler = async (req, res) => {
  // Sanitize and validate id param
  const id = mongoSanitize(req.params.id)

  if (!ObjectId.isValid(id)) {
    logger.warn(`${proc} Invalid attribute id: ${id}`)

    return res.status(400).json({ error: 'Invalid attribute id' })
  }

  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { _id: new ObjectId(id) }
    const result = await collection.deleteOne(query)

    if (result.deletedCount === 0) {
      logger.warn(`${proc} Attribute ${id} not found for deletion`)
      res.status(404).send('Attribute not found')
    } else {
      logger.info(`${proc} Deleted attribute ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error deleting attribute ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributes',
      procedure: 'deleteAttribute',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Delete all attributes
 */
export const deleteAllAttributes: RequestHandler = async (_req, res) => {
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = {}
    const result = await collection.deleteMany(query)

    if (result.deletedCount === 0) {
      logger.warn(`${proc} No attributes found to delete`)
      res.status(404).send('Not found attributes to delete')
    } else {
      logger.info(`${proc} Deleted ${result.deletedCount} attributes`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error deleting all attributes: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributes',
      procedure: 'deleteAllAttributes',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Delete attributes by model ID
 */
export const deleteAttributesByModelId: RequestHandler = async (req, res) => {
  // Sanitize and validate id param
  const id = mongoSanitize(req.params.id)

  if (!ObjectId.isValid(id)) {
    logger.warn(`${proc} Invalid model id: ${id}`)

    return res.status(400).json({ error: 'Invalid model id' })
  }

  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { modelId: new ObjectId(id) }
    const result = await collection.deleteMany(query)

    if (result.deletedCount === 0) {
      logger.warn(`${proc} No attributes found to delete for model ${id}`)
      res.status(404).send('Not found attributes to delete')
    } else {
      logger.info(`${proc} Deleted ${result.deletedCount} attributes for model ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error deleting attributes for model ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributes',
      procedure: 'deleteAttributesByModelId',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

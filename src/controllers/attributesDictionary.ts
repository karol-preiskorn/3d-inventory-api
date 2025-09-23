import { RequestHandler } from 'express'
import mongoSanitize from 'mongo-sanitize'
import { Collection, Db, Document, Filter, ObjectId, WithoutId } from 'mongodb'
import { closeConnection, connectToCluster, connectToDb } from '../utils/db'
import getLogger from '../utils/logger'

const logger = getLogger('attributesDictionary')
const proc = '[attributesDictionary]'

export interface AttributesDictionary {
  _id: ObjectId | null
  componentName: string
  name: string
  type: string
  unit: string
}

const collectionName = 'attributesDictionary'

/**
 * Get all attributes dictionary entries
 */
export const getAllAttributesDictionary: RequestHandler = async (_req, res) => {
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const results: object[] = await collection.find({}).limit(1000).toArray()

    if (!results || results.length === 0) {
      logger.warn(`${proc} No attributes dictionary entries found`)
      res.status(404).send('Not found')
    } else {
      logger.info(`${proc} Retrieved ${results.length} attributes dictionary entries`)
      res.status(200).json(results)
    }
  } catch (error) {
    logger.error(`${proc} Error fetching attributes dictionary: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributesDictionary',
      procedure: 'getAllAttributesDictionary',
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
 * Get attributes dictionary entry by ID
 */
export const getAttributesDictionaryById: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { _id: new ObjectId(id) }
    const result = await collection.findOne(query)

    if (!result) {
      logger.warn(`${proc} Attributes dictionary entry with id ${id} not found`)
      res.status(404).json({ message: 'Not found' })
    } else {
      logger.info(`${proc} Retrieved attributes dictionary entry with id ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error fetching attributes dictionary ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributesDictionary',
      procedure: 'getAttributesDictionaryById',
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
 * Get attributes dictionary entry by model ID
 */
export const getAttributesDictionaryByModelId: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { modelId: new ObjectId(id) }
    const result = await collection.findOne(query)

    if (!result) {
      logger.warn(`${proc} Attributes dictionary entry with model id ${id} not found`)
      res.status(404).json({ message: 'Not found' })
    } else {
      logger.info(`${proc} Retrieved attributes dictionary entry with model id ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error fetching attributes dictionary by model ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributesDictionary',
      procedure: 'getAttributesDictionaryByModelId',
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
 * Create new attributes dictionary entry
 */
export const createAttributesDictionary: RequestHandler = async (req, res) => {
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    // Sanitize input
    const sanitizedBody = mongoSanitize(req.body)
    const newDocument = sanitizedBody as WithoutId<AttributesDictionary>
    const results = await collection.insertOne(newDocument)

    if (results.acknowledged) {
      logger.info(`${proc} Created attributes dictionary entry with id ${results.insertedId}`)
      res.status(201).json({ _id: results.insertedId })
    } else {
      logger.error(`${proc} Failed to create attributes dictionary entry - not acknowledged`)
      res.status(500).json({ message: 'Failed to create attributes dictionary entry' })
    }
  } catch (error) {
    logger.error(`${proc} Error creating attributes dictionary: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributesDictionary',
      procedure: 'createAttributesDictionary',
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
 * Update attributes dictionary entry by ID
 */
export const updateAttributesDictionary: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    // Sanitize input
    const sanitizedBody = mongoSanitize(req.body)
    const filter: Filter<Document> = { _id: new ObjectId(id) }
    const { componentName, type, name, unit } = sanitizedBody as Partial<AttributesDictionary>
    // Only update provided fields
    const updateFields: Partial<AttributesDictionary> = {}

    if (componentName !== undefined) updateFields.componentName = componentName
    if (type !== undefined) updateFields.type = type
    if (name !== undefined) updateFields.name = name
    if (unit !== undefined) updateFields.unit = unit

    if (Object.keys(updateFields).length === 0) {
      logger.warn(`${proc} No fields to update for attributes dictionary ${id}`)

      return res.status(400).json({ message: 'No fields to update' })
    }

    const updates = { $set: updateFields }
    const result = await collection.updateOne(filter, updates)

    if (result.matchedCount === 0) {
      logger.warn(`${proc} Attributes dictionary ${id} not found for update`)

      return res.status(404).json({ message: 'Not found' })
    }

    logger.info(`${proc} Updated attributes dictionary ${id}`)
    res.status(200).json(result)
  } catch (error) {
    logger.error(`${proc} Error updating attributes dictionary ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributesDictionary',
      procedure: 'updateAttributesDictionary',
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
 * Delete attributes dictionary entry by ID
 */
export const deleteAttributesDictionary: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { _id: new ObjectId(id) }
    const result = await collection.deleteOne(query)

    if (result.deletedCount === 0) {
      logger.warn(`${proc} Attributes dictionary ${id} not found for deletion`)
      res.status(404).json({ message: 'Attributes dictionary entry not found' })
    } else {
      logger.info(`${proc} Deleted attributes dictionary ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error deleting attributes dictionary ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributesDictionary',
      procedure: 'deleteAttributesDictionary',
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
 * Delete all attributes dictionary entries
 */
export const deleteAllAttributesDictionary: RequestHandler = async (_req, res) => {
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = {}
    const result = await collection.deleteMany(query)

    if (result.deletedCount === 0) {
      logger.warn(`${proc} No attributes dictionary entries found to delete`)
      res.status(404).send('Not found attributes dictionary entries to delete')
    } else {
      logger.info(`${proc} Deleted ${result.deletedCount} attributes dictionary entries`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error deleting all attributes dictionary: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributesDictionary',
      procedure: 'deleteAllAttributesDictionary',
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
 * Delete attributes dictionary entries by model ID
 */
export const deleteAttributesDictionaryByModelId: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { modelId: new ObjectId(id) }
    const result = await collection.deleteMany(query)

    if (result.deletedCount === 0) {
      logger.warn(`${proc} No attributes dictionary entries found to delete for model ${id}`)
      res.status(404).send('Not found attributes dictionary entries to delete')
    } else {
      logger.info(`${proc} Deleted ${result.deletedCount} attributes dictionary entries for model ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error deleting attributes dictionary for model ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'attributesDictionary',
      procedure: 'deleteAttributesDictionaryByModelId',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

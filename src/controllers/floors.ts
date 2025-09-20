import { RequestHandler } from 'express'
import { Collection, Db, ObjectId, UpdateFilter, Document } from 'mongodb'
import mongoSanitize from 'mongo-sanitize'
import sanitize from 'sanitize-html'
import { closeConnection, connectToCluster, connectToDb } from '../utils/db'
import getLogger from '../utils/logger'

const logger = getLogger('floors')
const proc = '[floors]'

export interface Floor {
  _id: ObjectId;
  name: string;
  address: Address;
  dimension: Dimension[];
}

export type NewFloor = Omit<Floor, '_id'>;

export interface Address {
  street: string;
  city: string;
  country: string;
  postcode: string;
}

export interface Dimension {
  description: string;
  x: number;
  y: number;
  h: number;
  xPos: number;
  yPos: number;
  hPos: number;
}

const collectionName = 'floors'

/**
 * Get all floors with sanitization
 */
export const getAllFloors: RequestHandler = async (_req, res) => {
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const results: object[] = await collection.find({}).limit(10).toArray()

    if (!results || results.length === 0) {
      logger.warn(`${proc} No floors found`)
      res.status(404).send('Not found')
    } else {
      const sanitizedResults = results.map((result) => {
        const floor = result as Floor

        return {
          ...floor,
          name: sanitize(floor.name),
          address: {
            ...floor.address,
            street: sanitize(floor.address.street),
            city: sanitize(floor.address.city),
            country: sanitize(floor.address.country),
            postcode: sanitize(floor.address.postcode)
          },
          dimension: floor.dimension.map((dim: Dimension) => ({
            ...dim,
            description: sanitize(dim.description)
          }))
        }
      })

      logger.info(`${proc} Retrieved ${results.length} floors`)
      res.status(200).json(sanitizedResults)
    }
  } catch (error) {
    logger.error(`${proc} Error fetching floors: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'floors',
      procedure: 'getAllFloors',
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
 * Get floor by ID
 */
export const getFloorById: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { _id: new ObjectId(id) }
    const result = await collection.findOne(query)

    if (!result) {
      logger.warn(`${proc} Floor with id ${id} not found`)
      res.status(404).json({ message: 'Not found' })
    } else {
      logger.info(`${proc} Retrieved floor with id ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error fetching floor ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'floors',
      procedure: 'getFloorById',
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
 * Get floor by model ID
 */
export const getFloorByModelId: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const sanitizedModelId = sanitize(id)
    const query = { modelId: new ObjectId(sanitizedModelId) }
    const result = await collection.findOne(query)

    if (!result) {
      logger.warn(`${proc} Floor with model id ${id} not found`)
      res.status(404).json({ message: 'Not found' })
    } else {
      logger.info(`${proc} Retrieved floor with model id ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error fetching floor by model ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'floors',
      procedure: 'getFloorByModelId',
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
 * Create new floor
 */
export const createFloor: RequestHandler = async (req, res) => {
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    // Sanitize input
    const sanitizedBody = mongoSanitize(req.body)
    const { name, address, dimension } = sanitizedBody
    const sanitizedDocument: NewFloor = {
      name: sanitize(name),
      address: {
        street: sanitize(address.street),
        city: sanitize(address.city),
        country: sanitize(address.country),
        postcode: sanitize(address.postcode)
      },
      dimension: dimension.map((dim: Dimension) => ({
        description: sanitize(dim.description),
        x: dim.x,
        y: dim.y,
        h: dim.h,
        xPos: dim.xPos,
        yPos: dim.yPos,
        hPos: dim.hPos
      }))
    }
    const result = await collection.insertOne(sanitizedDocument)

    if (!result.acknowledged) {
      logger.error(`${proc} Failed to insert floor document`)
      res.status(500).json({ message: 'Failed to insert document' })

      return
    }

    const insertedDocument = { _id: result.insertedId, ...sanitizedDocument }

    logger.info(`${proc} Inserted floor document with ID: ${result.insertedId}`)
    res.status(201).json(insertedDocument)
  } catch (error) {
    logger.error(`${proc} Error creating floor: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'floors',
      procedure: 'createFloor',
      message: 'Error inserting document',
      error: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Update floor by ID
 */
export const updateFloor: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    // Sanitize input
    const sanitizedBody = mongoSanitize(req.body)
    const query = { _id: new ObjectId(id) }
    const sanitizedDocument: NewFloor = {
      name: sanitize(sanitizedBody.name),
      address: {
        street: sanitize(sanitizedBody.address.street),
        city: sanitize(sanitizedBody.address.city),
        country: sanitize(sanitizedBody.address.country),
        postcode: sanitize(sanitizedBody.address.postcode)
      },
      dimension: sanitizedBody.dimension.map((dim: Dimension) => ({
        description: sanitize(dim.description),
        x: dim.x,
        y: dim.y,
        h: dim.h,
        xPos: dim.xPos,
        yPos: dim.yPos,
        hPos: dim.hPos
      }))
    }
    const updates: UpdateFilter<Document>[] = [{ $set: sanitizedDocument }]
    const result = await collection.updateOne(query, updates)

    if (result.modifiedCount === 0) {
      logger.warn(`${proc} Floor ${id} not found or no changes made`)
      res.status(404).json({ message: 'Document not found or no changes made' })
    } else {
      logger.info(`${proc} Updated floor ${id}`)
      res.status(200).json({ message: 'Document updated successfully', result })
    }
  } catch (error) {
    logger.error(`${proc} Error updating floor ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'floors',
      procedure: 'updateFloor',
      message: 'Error updating document',
      error: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Add dimension to floor
 */
export const addFloorDimension: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { _id: new ObjectId(id) }
    const updates = { $push: { dimension: req.body } }
    const result = await collection.updateOne(query, updates)

    if (result.modifiedCount === 0) {
      logger.warn(`${proc} Floor ${id} not found for dimension update`)
      res.status(404).json({ message: 'Floor not found' })
    } else {
      logger.info(`${proc} Added dimension to floor ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error adding dimension to floor ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'floors',
      procedure: 'addFloorDimension',
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
 * Delete floor by ID
 */
export const deleteFloor: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { _id: new ObjectId(id) }
    const result = await collection.deleteOne(query)

    if (result.deletedCount === 0) {
      logger.warn(`${proc} Floor ${id} not found for deletion`)
      res.status(404).json({ message: 'Document not found' })
    } else {
      logger.info(`${proc} Deleted floor ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error deleting floor ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'floors',
      procedure: 'deleteFloor',
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
 * Delete all floors (with confirmation)
 */
export const deleteAllFloors: RequestHandler = async (req, res) => {
  if (req.query.confirm !== 'true') {
    res.status(400).json({ message: 'Confirmation required. Add ?confirm=true to proceed.' })

    return
  }

  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const result = await collection.deleteMany({})

    if (result.deletedCount === 0) {
      logger.warn(`${proc} No floors found to delete`)
      res.status(404).send('Not found floors to delete')
    } else {
      logger.info(`${proc} Deleted ${result.deletedCount} floors`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error deleting all floors: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'floors',
      procedure: 'deleteAllFloors',
      message: 'Error deleting documents',
      error: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

/**
 * Delete floors by model ID
 */
export const deleteFloorsByModelId: RequestHandler = async (req, res) => {
  const { id } = req.params
  let client

  try {
    client = await connectToCluster()

    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const query = { modelId: new ObjectId(id) }
    const result = await collection.deleteMany(query)

    if (result.deletedCount === 0) {
      logger.warn(`${proc} No floors found to delete for model ${id}`)
      res.status(404).send('Not found floors to delete')
    } else {
      logger.info(`${proc} Deleted ${result.deletedCount} floors for model ${id}`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`${proc} Error deleting floors for model ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'floors',
      procedure: 'deleteFloorsByModelId',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }
}

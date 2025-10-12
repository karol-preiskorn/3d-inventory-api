import { NextFunction, Request, Response } from 'express'
import { ObjectId as MongoObjectId, type Collection, type Db, type Document, type InsertOneResult, type OptionalId, type UpdateFilter } from 'mongodb'
import { CreateLog } from '../services/logs'
import { getDatabase } from '../utils/db'
import { DatabaseError, NotFoundError, successResponse } from '../utils/errors'
import getLogger from '../utils/logger'

const logger = getLogger('devices')
const collectionName = 'devices'

export interface Device {
  _id: string
  name: string
  modelId: string
  position: {
    x: number
    y: number
    h: number
  }
  attributes: Attribute[]
}

export interface Attribute {
  key: string
  value: string
}

export interface Position {
  x: number
  y: number
  h: number
}

// Get all devices
export async function getAllDevices(_req: Request, res: Response, next: NextFunction) {
  try {
    const db: Db = await getDatabase()
    const collection: Collection = db.collection(collectionName)
    const results: object[] = await collection.find({}).limit(1000).toArray()

    if (results.length === 0) {
      logger.warn('GET /devices - no devices found')
      const response = successResponse([], { version: 'v1' })

      res.status(200).json(response)
    } else {
      logger.info(`GET /devices - returning ${results.length} devices`)
      const response = successResponse(results, { version: 'v1' })

      res.status(200).json(response)
    }
  } catch (error) {
    logger.error(`GET /devices - database error: ${String(error)}`)
    const dbError = new DatabaseError('Failed to retrieve devices from database')

    next(dbError)
  }
}

// Get device by ID
export async function getDeviceById(req: Request, res: Response, next: NextFunction) {
  try {
    const db: Db = await getDatabase()
    const collection: Collection = db.collection(collectionName)
    const query = { _id: new MongoObjectId(req.params.id) }
    const result = await collection.findOne(query)

    if (!result) {
      logger.warn(`GET /devices/${req.params.id} - device not found`)
      const notFoundError = new NotFoundError(`Device with ID ${req.params.id} not found`)

      next(notFoundError)
    } else {
      logger.info(`GET /devices/${req.params.id} - device found`)
      const response = successResponse(result, { version: 'v1' })

      res.status(200).json(response)
    }
  } catch (error) {
    logger.error(`GET /devices/${req.params.id} - database error: ${String(error)}`)
    const dbError = new DatabaseError('Failed to retrieve device from database')

    next(dbError)
  }
}

// Update device by ID
export async function updateDevice(req: Request, res: Response) {
  const query = { _id: new MongoObjectId(req.params.id) }
  const updates: UpdateFilter<Document>[] = [
    {
      $set: {
        name: (req.body as { name: string }).name,
        modelId: (req.body as { modelId: string }).modelId,
        position: (req.body as { position: Position }).position,
        attributes: (req.body as { attributes: Attribute[] }).attributes
      }
    }
  ]

  try {
    const db: Db = await getDatabase()
    const collection: Collection = db.collection(collectionName)
    const deviceBefore = await collection.findOne(query)

    if (!deviceBefore) {
      logger.error(`PUT /devices/${req.params.id} - device not found`)
      res.status(404).send('Device not found')

      return
    }

    const result = await collection.updateOne(query, updates)

    if (result.modifiedCount === 0) {
      logger.error(`PUT /devices/${req.params.id} - not found devices to update`)
      res.status(404).send('Not found devices to update')
    } else {
      const updatedDevice = await collection.findOne(query)
      const changes: Record<string, { before: unknown; after: unknown }> = {}
      const requestBody = req.body as {
        name: string
        modelId: string
        position: Position
        attributes: Attribute[]
      }

      // Track name changes
      if (deviceBefore.name !== requestBody.name) {
        changes.name = {
          before: deviceBefore.name,
          after: requestBody.name
        }
      }

      // Track modelId changes
      if (deviceBefore.modelId !== requestBody.modelId) {
        changes.modelId = {
          before: deviceBefore.modelId,
          after: requestBody.modelId
        }
      }

      // Track position changes
      if (
        deviceBefore.position.x !== requestBody.position.x ||
        deviceBefore.position.y !== requestBody.position.y ||
        deviceBefore.position.h !== requestBody.position.h
      ) {
        changes.position = {
          before: {
            x: deviceBefore.position.x,
            y: deviceBefore.position.y,
            h: deviceBefore.position.h
          },
          after: {
            x: requestBody.position.x,
            y: requestBody.position.y,
            h: requestBody.position.h
          }
        }
      }

      // Track attribute changes
      const attributesBefore = JSON.stringify(deviceBefore.attributes || [])
      const attributesAfter = JSON.stringify(requestBody.attributes || [])

      if (attributesBefore !== attributesAfter) {
        changes.attributes = {
          before: deviceBefore.attributes || [],
          after: requestBody.attributes || []
        }
      }

      // Create log with detailed change information
      const logMessage = {
        deviceId: req.params.id,
        deviceName: requestBody.name,
        changes: changes,
        updatedFields: Object.keys(changes),
        changeCount: Object.keys(changes).length
      }
      const userId = (req as { user?: { id: string } }).user?.id
      const username = (req as { user?: { username: string } }).user?.username

      CreateLog(
        req.params.id,
        logMessage,
        'update',
        'device',
        userId,
        username
      )

      logger.info(`PUT /devices/${req.params.id} - updated ${result.modifiedCount} devices with ${Object.keys(changes).length} field changes`)
      res.status(200).json(updatedDevice)
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.error(`PUT /devices/${req.params.id} - error updating device: ${errorMessage}`)
    res.status(500).json({
      module: 'devices',
      procedure: 'updateDevice',
      status: 'Internal Server Error',
      message: errorMessage
    })
  }
}

// Create new device
export async function createDevice(req: Request, res: Response) {
  try {
    const db: Db = await getDatabase()
    const collection: Collection = db.collection(collectionName)

    logger.error(`POST /devices - body: ${JSON.stringify(req.body)}`)

    if (!req.body || Object.keys(req.body).length === 0) {
      logger.error('POST /devices - No data provided')
      res.status(400).send('POST /devices - No data provided')

      return
    }

    const newDocument: OptionalId<Document> & { date: Date } = req.body as OptionalId<Document> & { date: Date }

    newDocument.date = new Date()
    const result: InsertOneResult<Document> = await collection.insertOne(newDocument)

    if (!result?.insertedId) {
      logger.error(`POST /devices - Device not created with id: ${JSON.stringify(newDocument)}`)
      await CreateLog('', newDocument, 'Create', 'Device')
      res.status(500).send('POST /devices - Device not created')

      return
    } else {
      logger.info(`POST /devices - device created successfully with id: ${result.insertedId.toString()}, ${JSON.stringify(newDocument)}`)

      // Create log entry (fire and forget - don't block response)
      CreateLog(
        result.insertedId.toString(),
        newDocument,
        'Create',
        'Device',
        req.user?.id,
        req.user?.username
      ).catch((error: Error) => {
        logger.error(`Failed to create log for device ${result.insertedId}: ${String(error)}`)
      })

      // Return consistent response structure matching GET endpoints
      res.status(200).json({
        success: true,
        data: {
          insertedId: result.insertedId.toString(),
          _id: result.insertedId.toString(),
          ...newDocument
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      })
    }
  } catch (error) {
    logger.error(`Error creating device: ${String(error)}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get devices by model ID
export async function getDevicesByModel(req: Request, res: Response) {
  try {
    const db: Db = await getDatabase()
    const collection: Collection = db.collection(collectionName)
    const query = { modelId: req.params.id }
    const result = await collection.find(query).toArray()

    res.status(200).json(result)
  } catch (error) {
    logger.error(`Error getting devices by model: ${String(error)}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Update device position
export async function updateDevicePosition(req: Request, res: Response) {
  const query = { _id: new MongoObjectId(req.params.id) }
  const newPosition = req.body as Position
  const updates: UpdateFilter<Document>[] = [
    {
      $set: { position: newPosition }
    }
  ]

  try {
    const db: Db = await getDatabase()
    const collection: Collection = db.collection(collectionName)
    const deviceBefore = await collection.findOne(query)

    if (!deviceBefore) {
      logger.error(`PATCH /devices/position/${req.params.id} - device not found`)
      res.status(404).send('Device not found')

      return
    }

    const result = await collection.updateOne(query, updates)

    if (!result || result.modifiedCount === 0) {
      logger.error(`PATCH /devices/position/${req.params.id} - no position updated`)
      res.status(404).send('No position updated')
    } else {
      const logMessage = {
        deviceId: req.params.id,
        deviceName: deviceBefore.name,
        changes: {
          position: {
            before: {
              x: deviceBefore.position.x,
              y: deviceBefore.position.y,
              h: deviceBefore.position.h
            },
            after: {
              x: newPosition.x,
              y: newPosition.y,
              h: newPosition.h
            }
          }
        },
        updatedFields: ['position'],
        changeCount: 1
      }
      const userId = (req as { user?: { id: string } }).user?.id
      const username = (req as { user?: { username: string } }).user?.username

      CreateLog(
        req.params.id,
        logMessage,
        'update',
        'device',
        userId,
        username
      )

      logger.info(`PATCH /devices/position/${req.params.id} - position updated successfully`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`PATCH /devices/position/${req.params.id} - error updating position: ${(error as Error).message}`)
    res.status(500).json({
      module: 'devices',
      procedure: 'updateDevicePosition',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Delete device by ID
export async function deleteDevice(req: Request, res: Response) {
  const query = { _id: new MongoObjectId(req.params.id) }

  try {
    const db: Db = await getDatabase()
    const collection: Collection = db.collection(collectionName)
    const result = await collection.deleteOne(query)

    if (!result) {
      logger.error(`DELETE /devices/${req.params.id} - Device not deleted`)
      res.status(500).json({ error: `DELETE /devices/${req.params.id} - Device not deleted` })
    } else {
      logger.info(`DELETE /devices/${req.params.id} - device deleted successfully.`)
      res.status(200).json(result)
    }
  } catch (error) {
    logger.error(`Error deleting device: ${String(error)}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Delete all devices (requires auth)
export async function deleteAllDevices(_req: Request, res: Response) {
  try {
    const db: Db = await getDatabase()
    const collection: Collection = db.collection(collectionName)
    const result = await collection.deleteMany({})

    res.status(200).json(result)
  } catch (error) {
    logger.error(`Error deleting all devices: ${String(error)}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Delete devices by model ID
export async function deleteDevicesByModel(req: Request, res: Response) {
  const query = { modelId: req.params.id }

  try {
    const db: Db = await getDatabase()
    const collection: Collection = db.collection(collectionName)
    const result = await collection.deleteMany(query)

    res.status(200).json(result)
  } catch (error) {
    logger.error(`Error deleting devices by model: ${String(error)}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}

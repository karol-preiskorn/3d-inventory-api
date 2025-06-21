/**
 * @description This file contains the router for handling model-related API endpoints. It defines GET, PUT, POST, PATCH, and DELETE routes for interacting with models in the database.
 * @module routers
 * @version 2023-12-29  C2RLO - Initial
 **/

import express, { RequestHandler } from 'express'
import { Collection, Db, DeleteResult, InsertOneResult, ObjectId, OptionalId, UpdateFilter } from 'mongodb'

import { closeConnection, connectToCluster, connectToDb } from '../utils/db'
import log from '../utils/logger'

const logger = log('models')

export interface Dimension {
  width: number
  height: number
  depth: number
}
export interface Texture {
  front: string
  back: string
  side: string
  top: string
  bottom: string
}
export interface Model {
  name: string
  dimension: Dimension
  texture: Texture
}

const collectionName = 'models'
const router: express.Router = express.Router()

router.get('/', (async (req, res) => {
  let client
  try {
    client = await connectToCluster()
  } catch (error) {
    logger.error('Error connecting to the database:', error)
    res.status(500).send('Internal Server Error')
    return
  }
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const results: object[] = await collection.find({}).limit(100).toArray()
  if (!results) {
    logger.warn('GET /models - not found')
    res.status(404).send('Not found')
  } else {
    logger.info('GET /models - oki return ' + results.length + ' models')
    res.status(200).json(results)
  }
  if (client) {
    try {
      await closeConnection(client)
    } catch (error) {
      logger.error('Error closing the database connection:', error)
    }
  }
}) as RequestHandler)

/**
 * @description Retrieves a model from the database by its ID.
 * @param {string} id - The ID of the model to retrieve.
 * @returns {object} - The retrieved model object.
 * @throws {Error} - If the ID is invalid or if the model is not found.
 *
 * @risk This route will expose sensitive information about a specific model in the database.
 * Ensure that this operation is only performed in a controlled environment, such as during development or testing.
 * In production, this route should be used with caution to prevent unauthorized access to sensitive data.
 */
router.get('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
    return
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).end()
  else res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

/**
 * @description Updates a model in the database by its ID.
 * @param {string} id - The ID of the model to update.
 * @param {Model} model - The updated model data.
 * @returns {object} - The result of the update operation.
 * @throws {Error} - If the ID is invalid or if the update fails.
 *
 * @risk This route will modify an existing model in the database.
 * Ensure that this operation is only performed in a controlled environment, such as during development or testing.
 * In production, this route should be used with caution to prevent accidental data loss.
 */
router.put('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).send('Not correct id')
  }
  const query = { _id: new ObjectId(req.params.id) }
  console.log('models.router.put: ' + JSON.stringify(req.body))
  const b: Model = req.body as Model
  const updates = {
    $set: {
      name: b.name,
      dimension: {
        width: b.dimension.width,
        height: b.dimension.height,
        depth: b.dimension.depth
      },
      texture: {
        front: b.texture.front,
        back: b.texture.back,
        side: b.texture.side,
        top: b.texture.top,
        bottom: b.texture.bottom
      }
    }
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  if (!result) res.status(404).send('Not found models to update')
  res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

router.post('/', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const newDocument: OptionalId<Document> = req.body as OptionalId<Document>
  const results: InsertOneResult<Document> = await collection.insertOne(newDocument)
  res.status(200).json(results)
  await closeConnection(client)
}) as RequestHandler)

router.patch('/dimension/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
    return
  }
  const query = { _id: new ObjectId(req.params.id) }
  const updates: UpdateFilter<Document>[] = [{ $push: { dimension: req.body as Dimension } }]
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

/**
 * @description Updates the texture of a model in the database.
 * @param {string} id - The ID of the model to update.
 * @param {Texture} texture - The new texture data to set.
 * @returns {object} - The result of the update operation.
 * @throws {Error} - If the ID is invalid or if the update fails.
 *
 * @risk This route will modify the texture of a model in the database.
 * Ensure that this operation is only performed in a controlled environment, such as during development or testing.
 * In production, this route should be used with caution to prevent accidental data loss.
 */
router.patch('/texture/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new ObjectId(req.params.id) }
  const updates: UpdateFilter<Document>[] = [{ $push: { texture: req.body as Texture } }]
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

/**
 * @description Deletes a document from the 'models' collection by its ID.
 * @param {string} id - The ID of the document to delete.
 * @returns {object} - The result of the deletion operation.
 * @throws {Error} - If the ID is invalid or if the deletion fails.
 *
 * @risk This route will permanently delete a document from the 'models' collection.
 * Ensure that this operation is only performed in a controlled environment, such as during development or testing.
 * In production, this route should be used with caution to prevent accidental data loss.
 */
router.delete('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    logger.warn(`DELETE /models/:id - Invalid ID: ${req.params.id}`)
    res.sendStatus(404)
    return
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const query = { _id: new ObjectId(req.params.id) }
  let result: DeleteResult
  try {
    result = await collection.deleteOne(query)
    if (!result) {
      res.status(500).send('Failed to delete the document')
    } else if (result.deletedCount === 0) {
      res.status(404).send('No document found to delete')
    } else {
      logger.info(`DELETE /models/:id - oki deleted model with ID: ${req.params.id}`)
      res.status(200).json(result)
    }
  } finally {
    if (client) {
      try {
        await closeConnection(client)
      } catch (error) {
        logger.error('Error closing the database connection:', error)
      }
    }
  }
}) as RequestHandler)

/**
 * @description Deletes all documents in the 'models' collection.
 * @warning This operation is irreversible and will remove all data from the collection.
 * Use with caution, especially in production environments.
 *
 * @risk This route will permanently delete all documents in the 'models' collection.
 * Ensure that this operation is only performed in a controlled environment, such as during development or testing.
 * In production, this route is forbidden to prevent accidental data loss.
 * Always double-check the confirmation query parameter before proceeding.
 */
router.delete('/', (async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    logger.warn('DELETE /models - Attempt to delete all documents in production environment')
    res.status(403).send('Forbidden in production environment')
    return
  }

  if (req.query.confirm !== 'true') {
    logger.warn('DELETE /models - Missing confirmation query parameter')
    res.status(400).send('Confirmation query parameter "confirm=true" is required')
    return
  }

  const query = {}
  const client = await connectToCluster()
  const db = connectToDb(client)
  const collection = db.collection(collectionName) // TypeScript infers the type automatically
  try {
    const result: DeleteResult = await collection.deleteMany(query)
    res.status(200).json(result)
  } catch (error) {
    logger.error('DELETE /models - Error deleting documents:', error)
    res.status(500).send('Internal Server Error')
  } finally {
    await closeConnection(client)
  }
}) as RequestHandler)

export default router

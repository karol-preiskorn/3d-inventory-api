/**
 * @file /routers/attributesDictionary.js
 * @module routers
 * @description attributesDictionary router
 **/

import express, { RequestHandler } from 'express'
import { Collection, Db, Document, Filter, ObjectId, WithoutId } from 'mongodb'

import { closeConnection, connectToCluster, connectToDb } from '../utils/db'
import log from '../utils/logger'

const logger = log('attributesDictionary')

export interface AttributesDictionary {
  _id: ObjectId | null
  componentName: string
  name: string
  type: string
  unit: string
}

const collectionName = 'attributesDictionary'

const router: express.Router = express.Router()

router.get('/', (async (req, res) => {
  const client = await connectToCluster()

  const db: Db = connectToDb(client)

  const collection: Collection = db.collection(collectionName)

  const results: object[] = await collection.find({}).limit(1000).toArray()

  if (!results) {
    res.status(404).send('Not found')
  } else {
    res.status(200).json(results)
  }
  await closeConnection(client)
}) as RequestHandler)

router.get('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)

    return
  }
  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)

    const collection: Collection = db.collection(collectionName)

    const query = { _id: new ObjectId(req.params.id) }

    const result = await collection.findOne(query)

    if (!result) {
      res.status(404).json({ message: 'Not found' })
    } else {
      res.status(200).json(result)
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.error(`GET /${collectionName}/${req.params.id} - error: ${errorMessage}`)
    res.status(500).json({
      module: 'attributesDictionary',
      procedure: 'getAttributesDictionary',
      status: 'Internal Server Error',
      message: errorMessage
    })
  } finally {
    await closeConnection(client)
  }
}) as RequestHandler)

router.get('/model/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()

  const db: Db = connectToDb(client)

  const collection: Collection = db.collection(collectionName)

  const query = { modelId: new ObjectId(req.params.id) }

  const result = await collection.findOne(query)

  if (!result) res.status(404).json({ message: 'Not found' })
  else res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

router.post('/', (async (req, res) => {
  const client = await connectToCluster()

  const db: Db = connectToDb(client)

  const collection: Collection = db.collection(collectionName)

  const newDocument = req.body as WithoutId<AttributesDictionary>

  const results = await collection.insertOne(newDocument)

  res.status(201).json({ _id: results.insertedId })
  await closeConnection(client)
}) as RequestHandler)

router.put('/:id', (async (req, res) => {
  const { id } = req.params

  if (!ObjectId.isValid(id)) {
    logger.error(`PUT /${collectionName}/${id} - invalid _id`)

    return res.sendStatus(400)
  }

  const filter: Filter<Document> = { _id: new ObjectId(id) }

  const { componentName, type, name, unit } = req.body as Partial<AttributesDictionary>

  // Only update provided fields
  const updateFields: Partial<AttributesDictionary> = {}

  if (componentName !== undefined) updateFields.componentName = componentName
  if (type !== undefined) updateFields.type = type
  if (name !== undefined) updateFields.name = name
  if (unit !== undefined) updateFields.unit = unit

  if (Object.keys(updateFields).length === 0) {
    logger.warn(`PUT /${collectionName}/${id} - no fields to update`)

    return res.status(400).json({ message: 'No fields to update' })
  }

  const updates = { $set: updateFields }

  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)

    const collection: Collection = db.collection(collectionName)

    const result = await collection.updateOne(filter, updates)

    if (result.matchedCount === 0) {
      logger.warn(`PUT /${collectionName}/${id} - not found`)

      return res.status(404).json({ message: 'Not found' })
    }

    logger.info(`PUT /${collectionName}/${id} - updated`)
    res.status(200).json(result)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.error(`PUT /${collectionName}/${id} - error: ${errorMessage}`)
    res.status(500).json({
      module: 'attributesDictionary',
      procedure: 'updateAttributesDictionary',
      status: 'Internal Server Error',
      message: errorMessage
    })
  } finally {
    await closeConnection(client)
  }
}) as RequestHandler)

router.delete('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new ObjectId(req.params.id) }

  const client = await connectToCluster()

  const db: Db = connectToDb(client)

  const collection: Collection = db.collection(collectionName)

  const result = await collection.deleteOne(query)

  res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

router.delete('/', (async (req, res) => {
  const query = {}

  const client = await connectToCluster()

  const db: Db = connectToDb(client)

  const collection: Collection = db.collection(collectionName)

  const result = await collection.deleteMany(query)

  res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

router.delete('/model/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { modelId: new ObjectId(req.params.id) }

  const client = await connectToCluster()

  const db: Db = connectToDb(client)

  const collection: Collection = db.collection(collectionName)

  const result = await collection.deleteMany(query)

  res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

export default router

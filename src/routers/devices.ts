/**
 * @file: devices.ts
 * @todo: Add the wraping with function for better documentation
 * @description: Routers for devices CRUD operations.
 * @module: /routers/devices
 * @public
 **/

import '../utils/loadEnvironment';

import { format } from 'date-fns';
import express, { RequestHandler } from 'express';
import {
    Collection, Db, InsertOneResult, ObjectId, OptionalId, UpdateFilter, WithId
} from 'mongodb';

import { connectionClose, connectToCluster, connectToDb } from '../db/conn';
import { CreateLog } from '../services/logs';
import { logger } from '../utils/logger';
import { Logs } from './logs';

type position = {
  x: number
  y: number
  h: number
}

const router = express.Router()

const collectionName: string = 'devices'

/**
 * Get Devise array from database.
 * @function GET /devices
 * @returns {Promise<object[]>} A promise that resolves to an array of objects.
 * @throws {Error} If the database is not available.
 * @throws {Error} If the collection is not available.
 * @throws {Error} If the collection is empty.
 */
router.get('/', (async (_req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  /**
   * Retrieves a list of objects from the collection.
   *
   * @returns {Promise<object[]>} A promise that resolves to an array of objects.
   */
  const results: object[] = await collection.find({}).limit(10).toArray()
  if (!results) {
    logger.warn('GET /devices - not found')
    res.status(404).send('Not found')
  } else {
    logger.info(`GET /devices - oki return ${results.length} devices ${JSON.stringify(results)}`)
    res.status(200).send(results)
  }
  await connectionClose(client)
}) as RequestHandler)

router.get('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    logger.error(`GET /devices/${req.params.id} - wrong id`)
    res.sendStatus(500)
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const query = { _id: req.params.id } as unknown as Promise<WithId<Document>>
  const result = await collection.findOne(query)
  if (!result) {
    logger.warn(`GET /devices/${req.params.id} - not found device`)
    res.status(404).send(`Device ${req.params.id} not found`)
  } else {
    logger.info(`GET /devices/${req.params.id} - oki, device: ${JSON.stringify(result)}`)
    res.status(200).send(result)
  }
  await connectionClose(client)
}) as RequestHandler)

router.put('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    logger.error(`PUT /devices/${req.params.id} - wrong id`)
    res.sendStatus(404)
  }
  const query = { _id: new ObjectId(req.params.id) }
  /**
   * Updates object for modifying device properties.
   * @typedef {Object} Updates
   * @property {$set} $set - The $set operator for specifying the fields to update.
   * @property {string} name - The new name of the device.
   * @property {string} modelId - The new model ID of the device.
   * @property {string} position - The new position of the device.
   */
  const updates = {
    $set: {
      name: req.body.name,
      modelId: req.body.modelId,
      position: req.body.position,
    },
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  if (!result) {
    logger.error(`PUT /devices/${req.params.id} - not found devices to update`)
    res.status(404).send('Not found devices to update')
  } else {
    logger.info(`PUT /devices/${req.params.id} - oki updated ${result.modifiedCount} devices`)
    res.status(200).send(result)
  }
  await connectionClose(client)
}) as RequestHandler)

router.get('/model/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    logger.error(`GET /devices/model/${req.params.id} - wrong id`)
    res.sendStatus(500)
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  /**
   * Represents a collection in the database.
   * @type {Collection}
   */
  const collection: Collection = db.collection(collectionName)
  const query = { modelId: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found')
  else res.status(200).send(result)
  await connectionClose(client)
}) as RequestHandler)

router.post('/', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  let resultLog = {}
  const collection: Collection = db.collection(collectionName)
  const newDocument: OptionalId<Document> & { date: Date } = req.body as OptionalId<Document> & { date: Date }
  newDocument.date = new Date()
  const result: InsertOneResult<Document> = await collection.insertOne(newDocument)
  if (!result || !result.insertedId) {
    logger.error('POST /devices - Device not created with id:', JSON.stringify(newDocument))
    resultLog = await CreateLog('', newDocument, 'Create', 'Device')
    res.status(500).send('POST /devices - Device not created')
  } else {
    logger.info(`POST /devices - device created successfully with id: ${result.insertedId}, ${JSON.stringify(newDocument)}`)
    resultLog = await CreateLog(result.insertedId.toString(), newDocument, 'Create', 'Device')
    res.status(200).send(result)
  }
  await connectionClose(client)
}) as RequestHandler)

router.patch('/position/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    logger.error(`PATCH /devices/position/${req.params.id} - wrong id`)
    res.sendStatus(404)
  }
  const query = { _id: new ObjectId(req.params.id) }
  const updates: UpdateFilter<Document>[] = [
    {
      $push: { position: req.body as position },
    },
  ]
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  res.status(200).send(result)
  await connectionClose(client)
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
  if (!result) {
    logger.error(`POST /devices/${req.params.id} - Device not created`)
    res.status(500).send(`POST /devices/${req.params.id} - Device not created`)
  } else {
    logger.info(`POST /devices/${req.params.id} - device created successfully.`)
    res.status(200).send(result)
  }
  await connectionClose(client)
}) as RequestHandler)

router.delete('/', (async (req, res) => {
  const query = {}
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).send(result)
  await connectionClose(client)
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
  res.status(200).send(result)
  await connectionClose(client)
}) as RequestHandler)

export default router

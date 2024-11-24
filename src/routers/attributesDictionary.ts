/**
 * @file /routers/attributesDictionary.js
 * @module routers
 * @description attributesDictionary router
 **/

import '../utils/loadEnvironment';

import express, { RequestHandler } from 'express';
import { Collection, Db, ObjectId, WithoutId } from 'mongodb';

import { connectionClose, connectToCluster, connectToDb } from '../db/dbUtils';
import { CreateLog } from '../services/logs';
import { logger } from '../utils/logger';

export interface AttributesDictionary {
  _id: ObjectId | null
  category: string
  component: string
  name: string
  type: string
}

const collectionName = 'attributesDictionary'
const router: express.Router = express.Router()

router.get('/', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const results: object[] = await collection.find({}).limit(10).toArray()
  if (!results) {
    res.status(404).send('Not found')
  } else {
    res.status(200).json(results)
  }
  await connectionClose(client)
}) as RequestHandler)

router.get('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) {
    res.status(404).json({ message: 'Not found' })
  } else res.status(200).json(result)
  await connectionClose(client)
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
  await connectionClose(client)
}) as RequestHandler)

router.post('/', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const newDocument = req.body as WithoutId<AttributesDictionary>
  const results = await collection.insertOne(newDocument)
  res.status(201).json({ _id: results.insertedId })
  await connectionClose(client)
}) as RequestHandler)


router.put('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    logger.error(`PUT /${collectionName} '${req.params.id}' - wrong _id`)
    res.sendStatus(404)
    return
  }

  const query = { _id: new ObjectId(req.params.id) }

  const updates = {
    $set: {
      component: (req.body as { component: string }).component,
      type: (req.body as { type: string }).type,
      name: (req.body as { name: string }).name,
      units: (req.body as { units: string }).units,
    },
  }

  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  let result

  try {
    result = await collection.updateOne(query, updates)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error(
      `PUT /${collectionName}/${req.params.id} - query: ${JSON.stringify(query)}, body: ${JSON.stringify(req.body)} - error updating: ${errorMessage}`,
    )
    res.status(500).send('Internal Server Error')
    return
  }
  if (result.modifiedCount === 0) {
    logger.error(`PUT /${collectionName}/${req.params.id} - query: ${JSON.stringify(query)} not found _id to update.`)
    res.status(404).send(`Not found ${collectionName} in ${collectionName} to update`)
  } else {
    const updatedDevice = await collection.findOne(query)
    logger.info(`PUT /${collectionName}/${req.params.id} - oki updated ${result.modifiedCount}.`)
    res.status(200).json(updatedDevice)
  }
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
  res.status(200).json(result)
  await connectionClose(client)
}) as RequestHandler)

router.delete('/', (async (req, res) => {
  const query = {}
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).json(result)
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
  res.status(200).json(result)
  await connectionClose(client)
}) as RequestHandler)

export default router

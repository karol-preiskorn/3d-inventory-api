/**
 * @description This file contains the router for handling model-related API endpoints. It defines GET, PUT, POST, PATCH, and DELETE routes for interacting with models in the database.
 * @module routers
 * @version 2023-12-29  C2RLO - Initial
 **/

import '../utils/loadEnvironment';

import express, { RequestHandler } from 'express';
import {
    Collection, Db, DeleteResult, InsertOneResult, ObjectId, OptionalId, UpdateFilter
} from 'mongodb';

import { connectionClose, connectToCluster, connectToDb } from '../db/dbUtils.js';
import { logger } from '../utils/logger.js';

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
  botom: string
}
export interface Model {
  name: string
  dimension: Dimension
  texture: Texture
}

const collectionName = 'models'
const router: express.Router = express.Router()

router.get('/', (async (req, res) => {
  const client = await connectToCluster()
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
  if (!result) res.status(404).end()
  else res.status(200).json(result)
  await connectionClose(client)
}) as RequestHandler)

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
        depth: b.dimension.depth,
      },
      texture: {
        front: b.texture.front,
        back: b.texture.back,
        side: b.texture.side,
        top: b.texture.top,
        botom: b.texture.botom,
      },
    },
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  if (!result) res.status(404).send('Not found models to update')
  res.status(200).json(result)
  await connectionClose(client)
}) as RequestHandler)

router.post('/', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const newDocument: OptionalId<Document> = req.body as OptionalId<Document>
  const results: InsertOneResult<Document> = await collection.insertOne(newDocument)
  res.status(200).json(results)
  await connectionClose(client)
}) as RequestHandler)

router.patch('/dimension/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new ObjectId(req.params.id) }
  const updates: UpdateFilter<Document>[] = [{ $push: { dimension: req.body as Dimension } }]
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  res.status(200).json(result)
  await connectionClose(client)
}) as RequestHandler)

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

router.delete('/', (async (_req, res) => {
  const query = {}
  const client = await connectToCluster()
  const db = connectToDb(client)
  const collection: Collection = db.collection(collectionName) // Remove the explicit type annotation for 'collection'
  const result: DeleteResult = await collection.deleteMany(query)
  res.status(200).json(result)
  await connectionClose(client)
}) as RequestHandler)

export default router

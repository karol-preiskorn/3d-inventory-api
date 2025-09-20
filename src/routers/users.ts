/**
 * @file /routers/users.ts
 * @description This file contains the router for handling user-related API endpoints. It defines GET, POST, and DELETE routes for interacting with users in the database.
 * @module routers
 */

import express, { RequestHandler } from 'express'
import sanitize from 'mongo-sanitize'
import { Collection, Db, InsertOneResult, ObjectId, Document } from 'mongodb'
import { validateObjectId } from '../middlewares'
import { closeConnection, connectToCluster, connectToDb } from '../utils/db'

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  token: string;
  permissions: string[]; // Fix: Replace Array<Object> with Array<object>
}

export type Users = User[];

const collectionName = 'attributes'
const router: express.Router = express.Router()

router.get('/', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const results: object[] = await collection.find({}).limit(10).toArray()

  if (!results) {
    res.status(404).send('Not found')
  } else {
    const sanitizedResults = sanitize(results)

    res.status(200).json(sanitizedResults)
  }
  await closeConnection(client)
}) as RequestHandler)

router.get('/:id', validateObjectId, (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)

  if (!result) res.sendStatus(404)
  else res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

router.get('/model/:id', validateObjectId, (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const query = { modelId: new ObjectId(req.params.id) }
  const result = await collection.find(query).toArray()

  if (!result) {
    res.sendStatus(404)
    const sanitizedResult = sanitize(result)

    res.status(200).json(sanitizedResult)
    res.status(200).json(result)
  }
  await closeConnection(client)
}) as RequestHandler)

router.get('/user/:id', validateObjectId, (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.find(query).toArray()

  if (!result) {
    res.sendStatus(404)
  } else {
    res.status(200).json(result)
  }
  await closeConnection(client)
}) as RequestHandler)

router.get('/rights/:name', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const query = { rights: [req.params.name] }
  const result = await collection.find(query).toArray()

  if (!result) {
    res.sendStatus(404)
  } else {
    res.status(200).json(result)
  }
  await closeConnection(client)
}) as RequestHandler)

router.post('/', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const newDocument: Users = req.body as Users // Fix: Explicitly define the type of newDocument
  const results: InsertOneResult<Document> = await collection.insertOne(newDocument)

  if (!results) res.sendStatus(404)
  else res.status(200).json(results)
  await closeConnection(client)
}) as RequestHandler)

router.delete('/:id', validateObjectId, (async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.deleteOne(query)

  if (!result) {
    res.status(404).send('Not found models to delete')
  } else {
    res.status(200).json(result)
  }
  await closeConnection(client)
}) as RequestHandler)

router.delete('/', (async (req, res) => {
  const query = {}
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)

  if (!result) {
    res.status(404).send('Not found models to delete')
  } else {
    res.status(200).json(result)
  }
  await closeConnection(client)
}) as RequestHandler)

router.delete('/user/:id/right/:name', validateObjectId, (async (req, res) => {
  const query = { modelId: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)

  if (!result) {
    res.status(404).send('Not found models to delete')
  } else {
    res.status(200).json(result)
  }
  await closeConnection(client)
}) as RequestHandler)

export default router

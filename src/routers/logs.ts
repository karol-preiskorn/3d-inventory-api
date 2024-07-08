/**
 * @file /routers/logs.js
 * @module /routers
 * @description This file contains the router for handling log-related API endpoints.
 * @version 2024-01-27 C2RLO - Initial
 */

import '../utils/loadEnvironment'

import { format } from 'date-fns'
import express, { RequestHandler } from 'express'
import { Collection, Db, InsertOneResult, ObjectId } from 'mongodb'

import { connectionClose, connectToCluster, connectToDb } from '../db/conn'
import { logger } from '../utils/logger'
import { capitalize } from '../utils/strings'

export type Logs = {
  _id: ObjectId
  objectId: string
  date: string
  operation: string
  component: string
  message: string
}

const collectionName = 'logs'
const router = express.Router()

router.get('/', (async (req: express.Request, res: express.Response): Promise<void> => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection = db.collection(collectionName)
  const results: object[] = await collection.find({}).sort({ date: -1 }).limit(200).toArray()
  if (!results) {
    res.sendStatus(404)
  } else {
    res.status(200).send(results)
  }
  await connectionClose(client)
}) as RequestHandler)

router.get('/:id', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(400)
    return
  }
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found ' + JSON.stringify(query))
  else res.status(200).send(result)
  await connectionClose(client)
}) as RequestHandler)

router.get('/component/:component', async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)

  const componentsResult: { component: string }[] = []
  if (req.params.component.length === 0) {
    res.status(400).send('Not provide component name')
    return
  }
  const query: { component: string } = { component: capitalize(req.params.component) }
  logger.info(`GET /logs/component/${req.params.component} - query: ${JSON.stringify(query)}`)
  const result = await collection.find(query).sort({ date: -1 }).toArray()
  if (result.length === 0) {
    res.status(404).send(`Not found any logs for component ${req.params.component}`)
  } else {
    res.status(200).send(result)
  }
  await connectionClose(client)
})

router.get('/model/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).send('Invalid ID')
    return
  }
  const query = { modelId: new ObjectId(req.params.id) }
  const result = await collection.find(query).sort({ date: -1 }).toArray()
  if (!result) res.sendStatus(404)
  else res.status(200).send(result)
  await connectionClose(client)
}) as RequestHandler)

router.get('/object/:id', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  if (!ObjectId.isValid(req.params.id)) {
    logger.info(`get /object/${req.params.id} Invalid Id`)
    res.status(400).send('Invalid ID')
    return
  }
  const query = { objectId: req.params.id }
  const result = await collection.find(query).sort({ date: -1 }).toArray()
  if (result.length === 0) {
    logger.warn(`get /object/${req.params.id}, query: ${JSON.stringify(query)} - 404 not found any logs for this objectId`)
    res.status(404).send(result)
  } else {
    res.status(200).send(result)
  }
  await connectionClose(client)
}) as RequestHandler)

router.post('/', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const newDocument: Logs = req.body as Logs
  newDocument.date = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
  const results: InsertOneResult<Document> = await collection.insertOne(newDocument)
  if (!results) {
    res.status(404).send('Not create log')
  } else {
    res.status(200).send(results)
  }
  await connectionClose(client)
}) as RequestHandler)

router.delete('/:id', (async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.deleteOne(query)
  res.status(200).send(result)
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

export default router

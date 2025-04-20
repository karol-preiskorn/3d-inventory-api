/**
 * @description This file contains the router for handling log-related API endpoints.
 * @module routers
 * @description This file contains the router for handling log-related API endpoints.
 * @version 2024-01-27 C2RLO - Initial
 */

import { format } from 'date-fns';
import express, { RequestHandler } from 'express';
import { Collection, Db, Document, Filter, InsertOneResult, ObjectId, WithId } from 'mongodb';

import { connectionClose, connectToCluster, connectToDb } from '../utils/db.js';
import log from '../utils/logger.js';

const logger = log('logs')

export interface Logs {
  _id: ObjectId
  objectId: string
  date: string
  operation: string
  component: string
  message: string
}

const collectionName = 'logs'
const router: express.Router = express.Router()

router.get('/', (async (req: express.Request, res: express.Response): Promise<void> => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection = db.collection(collectionName)
  const results: object[] = await collection.find({}).sort({ date: -1 }).limit(200).toArray()
  if (!results) {
    res.sendStatus(404)
  }
  else {
    res.status(200).json(results)
  }
  await connectionClose(client)
}) as RequestHandler)

router.get('/:id', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection<Document> = db.collection(collectionName)
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(400)
    return
  }
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found')
  else res.status(200).json(result)
  await connectionClose(client)
}) as RequestHandler)

router.get('/component/:component', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection<Document> = db.collection(collectionName)
  let component
  if (req.params.component.length === 0) {
    res.status(400).send(`Not provide component name: ${component} not in [ Device | Model | Connection | User | Attribute Dictionary ].`)
    return
  }
  else {
    component = req.params.component
    logger.info(`GET /logs/component/${req.params.component} - component: ${component}`)
    if (component !== 'Device' && component !== 'Model' && component !== 'Connection' && component !== 'User' && component !== 'Attribute Dictionary') {
      res.status(400).json({ message: `Not provide available component name: ${component} not in [ Device | Model | Connection | User | Attribute Dictionary ].` })
      return
    }
  }

  const query: Filter<Document> = { component: component } as Filter<Document>

  logger.info(`GET /logs/component/${req.params.component} - Get all log for component. Query: ${JSON.stringify(query)}`)

  const result: WithId<Document>[] = await collection.find(query).sort({ date: -1 }).toArray()

  if (result.length === 0) {
    res.status(404).json({ message: `GET /logs/component/${req.params.component} - Not found any logs for component.` })
    logger.warn(`GET /logs/component/${req.params.component}, query: ${JSON.stringify(query)} - 404 not found any component for objectId.`)
  }
  else {
    res.status(200).json(result)
    logger.info(`GET /logs/component/${req.params.component}, query: ${JSON.stringify(query)}`)
  }
  await connectionClose(client)
}) as RequestHandler)

router.get('/model/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  if (!ObjectId.isValid(req.params.id)) {
    logger.error(`GET /logs/model/${req.params.id} Invalid Id`)
    res.status(400).send('Invalid ID')
    return
  }
  const query = { modelId: new ObjectId(req.params.id) }
  const result = await collection.find(query).sort({ date: -1 }).toArray()
  if (!result) {
    res.sendStatus(404)
    logger.warn(`GET /logs/model/${req.params.id}, query: ${JSON.stringify(query)} - 404 not found any model for objectId.`)
  }
  else {
    res.status(200).json(result)
    logger.info(`GET /logs/model/${req.params.id}, query: ${JSON.stringify(query)}`)
  }
  await connectionClose(client)
}) as RequestHandler)

router.get('/object/:id', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  if (!ObjectId.isValid(req.params.id)) {
    logger.error(`GET /logs/object/${req.params.id} Invalid Id`)
    res.status(400).send('Invalid ID')
    return
  }
  const query = { objectId: req.params.id }
  const result = await collection.find(query).sort({ date: -1 }).toArray()
  if (result.length === 0) {
    logger.warn(`GET /logs/object/${req.params.id}, query: ${JSON.stringify(query)} - 404 not found any logs for objectId.`)
    res.status(404).json(result)
  }
  else {
    res.status(200).json(result)
    logger.info(`GET /logs/object/${req.params.id}, query: ${JSON.stringify(query)}`)
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
    logger.warn(`POST /logs/, query: ${JSON.stringify(newDocument)} not created.`)
  }
  else {
    const insertedDocument = await collection.findOne({ _id: results.insertedId })
    res.status(200).json(insertedDocument)
    logger.info(`POST /logs/, query: ${JSON.stringify(newDocument)} created.`)
  }
  await connectionClose(client)
}) as RequestHandler)

router.delete('/:id', (async (req, res) => {
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

export default router

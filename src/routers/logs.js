/**
 * @file /routers/logs.js
 * @module /routers
 * @description This file contains the router for handling log-related API endpoints.
 * @version 2024-01-27 C2RLO - Initial
 */

import express from 'express'
import { ObjectId } from 'mongodb'
import { format } from 'date-fns'
import '../utils/loadEnvironment.js'
import { connectToCluster, connectToDb, connectionClose } from '../db/conn.js'
import { logger } from '../utils/logger.js'

const collectionName = 'logs'
const router = express.Router()

router.get('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const results = await collection
    .find({})
    .sort({ date: -1 })
    .limit(200)
    .toArray()
  if (!results) res.sendStatus(404)
  else {
    res.sendStatus(200)
  }
  connectionClose(client)
})

router.get('/:id', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(400)
    return
  }
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found ' + JSON.stringify(query))
  else res.status(200).send(result)
  connectionClose(client)
})

// Get all logs for a specific component
router.get('/component/:component', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const components = db.collection('components')
  if (req.params.component.length === 0) {
    res.status(400).send('Not provide component name')
    return
  }
  const componentsResult = await components
    .find({ collection: req.params.component })
    .sort({ date: -1 })
    .toArray()
  logger.info(
    `componentsResult(${req.params.component}): ${JSON.stringify(componentsResult)}`,
  )
  if (componentsResult.length === 0) {
    res.status(404).send('Invalid component name')
    return
  }
  // find all logs for this component
  const collection = db.collection(collectionName)
  const query = { component: componentsResult[0].component }
  logger.info(`query: ${JSON.stringify(query)}`)
  const result = await collection.find(query).sort({ date: -1 }).toArray()
  if (!result) res.status(404).send('Not found any logs for this component')
  else res.status(200).send(result)
  connectionClose(client)
})

// Get all logs for a specific model
router.get('/model/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).send('Invalid ID')
    return
  }
  const query = { modelId: new ObjectId(req.params.id) }
  const result = await collection.find(query).sort({ date: -1 }).toArray()
  if (!result) res.sendStatus(404)
  else res.status(200).send(result)
  connectionClose(client)
})

router.get('/object/:id', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  if (!ObjectId.isValid(req.params.id)) {
    logger.info(`get /object/${req.params.id} Invalid Id`)
    res.status(400).send('Invalid ID')
    return
  }
  const query = { objectId: req.params.id }
  const result = await collection.find(query).sort({ date: -1 }).toArray()
  if (result.length === 0) {
    logger.warn(
      `get /object/${req.params.id}, query: ${JSON.stringify(query)} - 404 not fout any logs for this objectId`,
    )
    res.sendStatus(404)
  } else {
    res.status(200).send(result)
  }
  connectionClose(client)
})

// Create
router.post('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const newDocument = req.body
  newDocument.date = format(new Date(), 'yyyy-MM-dd hh:mm:ss')
  const results = await collection.insertOne(newDocument)
  if (!results) {
    res.status(404).send('Not create log')
  } else {
    res.status(200).send(results)
  }
  connectionClose(client)
})

// Update the device's :id position
router.patch('/position/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new ObjectId(req.params.id) }
  const updates = {
    $push: { position: req.body },
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  res.send(result).send(result)
  connectionClose(client)
})

// Delete an entry
router.delete('/:id', async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteOne(query)
  res.status(200).send(result)
  connectionClose(client)
})

// delete all devices
router.delete('/', async (req, res) => {
  const query = {}
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).send(result)
  connectionClose(client)
})

// delete all devices with specific :id model
router.delete('/model/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { modelId: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).send(result)
  connectionClose(client)
})

export default router

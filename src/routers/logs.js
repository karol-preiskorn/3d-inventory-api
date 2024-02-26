/**
 * @file /routers/logs.js
 * @module /routers
 * @description This file contains the router for handling log-related API endpoints.
 * @version 2024-01-27 C2RLO - Initial
 */


import express from 'express'
import { ObjectId } from 'mongodb'
import '../utils/loadEnvironment.js'
import { connectToCluster, connectToDb, connectionClose } from '../db/conn.js'
import { logger } from '../utils/logger.js'

const collectionName = 'logs'
const router = express.Router()

// Get all
router.get('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const results = await collection.find({}).limit(10).toArray()
  if (!results) res.status(404).send('Not found')
  else { res.status(200).send(results) }
  connectionClose(client)
})

// Get a single post
router.get('/:id', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  // console.log('req.params.id: ' + req.params.id)
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).send('Invalid ID')
    return
  }
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found')
  else res.status(200).send(result)
  connectionClose(client)
})

router.get('/component/:component', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const components = db.collection('components')
  if (req.params.component.length === 0) {
    res.status(400).send('Not provide component name')
    return
  }
  const componentsResult = await components.find({ collection: req.params.component }).toArray()
  logger.info(`componentsResult(${req.params.component}): ${JSON.stringify(componentsResult)}`)
  if (componentsResult.length === 0) {
    res.status(400).send('Invalid component name')
    return
  }
  // find all logs for this component
  const collection = db.collection(collectionName)
  const query = { component: componentsResult[0].component }
  logger.info(`query: ${JSON.stringify(query)}`)
  const result = await collection.find(query).toArray()
  if (!result) res.status(404).send('Not found any logs for this component')
  else res.status(200).send(result)
  connectionClose(client)
})


// Get all logs for a specific model
router.get('/model/:id', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).send('Invalid ID')
    return
  }
  const query = { modelId: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.send('Not found').status(404)
  else res.send(result).status(200)
  connectionClose(client)
})


// Create
router.post('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const newDocument = req.body
  newDocument.date = new Date()
  const results = await collection.insertOne(newDocument)
  res.send(results).status(204)
  connectionClose(client)
})

// Update the device's :id position
router.patch('/position/:id', async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) }
  const updates = {
    $push: { position: req.body }
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  res.send(result).status(200)
  connectionClose(client)
})

// Delete an entry
router.delete('/:id', async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteOne(query)
  res.send(result).status(200)
  connectionClose(client)
})

// delete all devices
router.delete('/', async (req, res) => {
  const query = {}
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.send(result).status(200)
  connectionClose(client)
})

// delete all devices with specific :id model
router.delete('/model/:id', async (req, res) => {
  const query = { modelId: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.send(result).status(200)
  connectionClose(client)
})

export default router

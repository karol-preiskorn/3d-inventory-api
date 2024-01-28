/**
 * @file /routers/logs.js
 * @module /routers
 * @description
 * @version 2024-01-27 C2RLO - Initial
**/

import express from 'express'
import { ObjectId } from 'mongodb'
import '../utils/loadEnvironment.js'
import { connectToCluster, connectToDb, connectionClose } from '../db/conn.js'

const collectionName = 'logs'
const router = express.Router()

// Get all
router.get('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const results = await collection.find({}).limit(10).toArray()
  if (!results) res.send('Not found').status(404)
  else res.send(results).status(200)
  connectionClose(client)
})

// Get a single post
router.get('/:id', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const query = { _id: ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.send('Not found').status(404)
  else res.send(result).status(200)
  connectionClose(client)
})

// Get a log for specific model
router.get('/model/:id', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const query = { modelId: ObjectId(req.params.id) }
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
  const query = { _id: ObjectId(req.params.id) }
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
  const query = { _id: ObjectId(req.params.id) }
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
  const query = { modelId: ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.send(result).status(200)
  connectionClose(client)
})

export default router

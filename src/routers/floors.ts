/**
 * @file /routers/floors.js
 * @module /routers
 * @description floors router
 * @version 2024-02-13 C2RLO - init
 */

import express from 'express'
import { ObjectId } from 'mongodb'
import '../utils/loadEnvironment.js'
import { connectToCluster, connectToDb, connectionClose } from '../db/conn.js'

const collectionName = 'floors'
const router = express.Router()

// Get all
router.get('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const results = await collection.find({}).limit(10).toArray()
  if (!results) res.status(404).send('Not found')
  else res.status(200).send(results)
  connectionClose(client)
})

// Get a single post
router.get('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found')
  else res.status(200).send(result)
  connectionClose(client)
})

// Get a single post
router.get('/model/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const query = { modelId: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found')
  else res.status(200).send(result)
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
  res.status(200).send(results)
  connectionClose(client)
})

// Update the device's :id position
router.patch('/position/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new ObjectId(req.params.id) }
  const updates = {
    $push: { position: req.body }
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  res.status(200).send(result)
  connectionClose(client)
})

// Delete an entry
router.delete('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
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

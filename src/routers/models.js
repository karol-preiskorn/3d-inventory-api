/**
 * @file:        /routers/models.js
 * @description: This file contains the router for handling model-related API endpoints.
 * @version: 2023-12-29  C2RLO  Initial
 */

import express from 'express'
import { ObjectId } from 'mongodb'
import '../utils/loadEnvironment.js'
import { connectToCluster, connectToDb, connectionClose } from '../db/conn.js'

const router = express.Router()

// Get all
router.get('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const results = await collection.find({}).limit(50).toArray()
  res.status(200).send(results)
  connectionClose(client)
})

// Get a single post
router.get('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.sendStatus('Not found').status(404)
  else res.status(200).send(result)
  connectionClose(client)
})

// Create
router.post('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const newDocument = req.body
  // newDocument.date = new Date()
  const results = await collection.insertOne(newDocument)
  res.status(204).sendStatus(results)
  connectionClose(client)
})

// Update the device's :id position
router.patch('/position/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: ObjectId(req.params.id) }
  const updates = {
    $push: { position: req.body },
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const result = await collection.updateOne(query, updates)
  res.status(200).send(result)
  connectionClose(client)
})

// Delete an entry
router.delete('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const result = await collection.deleteOne(query)
  res.status(200).send(result)
  connectionClose(client)
})

// Delete all
router.delete('/', async (req, res) => {
  const query = {}
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const result = await collection.deleteMany(query)
  res.status(200).send(result)
  connectionClose(client)
})

export default router

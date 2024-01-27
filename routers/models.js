/**
 * File:        /routers/models.js
 * Description:
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-12-29  C2RLO  Initial
 **/

import express from 'express'
import { ObjectId } from 'mongodb'
import '../utils/loadEnvironment'
import { connectToCluster, connectToDb, connectionClose } from '../db/conn.js'

const router = express.Router()

// Get all
router.get('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const results = await collection.find({}).limit(50).toArray()
  res.send(results).status(200)
  connectionClose(client)
})

// Get a single post
router.get('/:id', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const query = { _id: ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.send('Not found').status(404)
  else res.send(result).status(200)
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
  const collection = db.collection('models')
  const result = await collection.updateOne(query, updates)
  res.send(result).status(200)
  connectionClose(client)
})

// Delete an entry
router.delete('/:id', async (req, res) => {
  const query = { _id: ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const result = await collection.deleteOne(query)
  res.send(result).status(200)
  connectionClose(client)
})

// Delete all
router.delete('/', async (req, res) => {
  const query = { }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const result = await collection.deleteMany(query)
  res.send(result).status(200)
  connectionClose(client)
})

export default router

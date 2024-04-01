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

router.get('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const results = await collection.find({}).limit(50).toArray()
  res.status(200).send(results)
  connectionClose(client)
})

router.get('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found')
  else res.status(200).send(result)
  connectionClose(client)
})

router.put('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).send('Not correct id')
  }
  const query = { _id: new ObjectId(req.params.id) }
  console.log('models.router.put: ' + JSON.stringify(req.body))
  const updates = {
    $set: {
      name: req.body.name,
      'dimension.width': req.body.dimension.width,
      'dimension.height': req.body.dimension.height,
      'dimension.depth': req.body.dimension.depth,
      'texture.front': req.body.texture.front,
      'texture.back': req.body.texture.back,
      'texture.side': req.body.texture.side,
      'texture.top': req.body.texture.top,
      'texture.botom': req.body.texture.botom,
      type: req.body.type,
      category: req.body.category
    }
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const result = await collection.updateOne(query, updates)
  if (!result) res.status(404).send('Not found models to update')
  res.status(200).send(result)
  connectionClose(client)
})

router.post('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const newDocument = req.body
  const results = await collection.insertOne(newDocument)
  res.status(200).send(results)
  connectionClose(client)
})

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
  const collection = db.collection('models')
  const result = await collection.updateOne(query, updates)
  res.status(200).send(result)
  connectionClose(client)
})

router.delete('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection('models')
  const result = await collection.deleteOne(query)
  res.status(200).send(result)
  connectionClose(client)
})

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

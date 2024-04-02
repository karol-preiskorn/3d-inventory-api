/**
 * @file /routers/connections.js
 * @module /routers
 * @description connections router for the API
 * @version 2024-01-25 C2RLO - add new way to connect to DB
 */

import express from 'express'
import { ObjectId } from 'mongodb'
import '../utils/loadEnvironment.js'
import { connectToCluster, connectToDb, connectionClose } from '../db/conn.js'

const collectionName = 'connections'
const router = express.Router()

try {
  router.get('/', async (_req, res) => {
    const client = await connectToCluster()
    const db = await connectToDb(client)
    const collection = db.collection(collectionName)
    const results = await collection.find({}).limit(256).toArray()
    if (!results) res.status(404).send('Not found any connection')
    else res.status(200).send(results)
    connectionClose(client)
  })
} catch (next) {
  console.error(next)
}


router.get('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).send('Not provide valid id')
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

router.put('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).send('Not provide valid id')
  }
  const query = { _id: new ObjectId(req.params.id) }
  const updates = {
    $set: {
      name: req.body.name,
      deviceIdFrom: req.body.deviceIdFrom,
      deviceIdTo: req.body.deviceIdFrom
    }
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  if (!result) res.status(404).send('Not found devices to update')
  res.status(200).send(result)
  connectionClose(client)
})

router.get('/from/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const query = { deviceIdFrom: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found')
  else res.status(200).send(result)
  connectionClose(client)
})

router.get('/to/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const query = { deviceIdTo: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found')
  else res.status(200).send(result)
  connectionClose(client)
})

router.get('/from/:idFrom/to/:idTo', async (req, res) => {
  if (
    !ObjectId.isValid(req.params.idFrom) ||
    !ObjectId.isValid(req.params.idTo)
  ) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const query = {
    deviceIdFrom: new ObjectId(req.params.idFrom),
    deviceIdTo: new ObjectId(req.params.idTo)
  }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found')
  else res.status(200).send(result)
  connectionClose(client)
})

router.post('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const newDocument: Object = req.body
  newDocument.date = new Date()
  const results = await collection.insertOne(newDocument)
  res.status(200).send(results)
  connectionClose(client)
})

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

router.delete('/', async (req, res) => {
  const query = {}
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).send(result)
  connectionClose(client)
})

router.delete('/from/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { deviceIdFrom: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).send(result)
  connectionClose(client)
})

router.delete('/to/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { deviceIdTo: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).send(result)
  connectionClose(client)
})

// delete all devices with specific :id model
router.delete('/from/:idFrom/to/:idTo', async (req, res) => {
  if (
    !ObjectId.isValid(req.params.idFrom) ||
    !ObjectId.isValid(req.params.idTo)
  ) {
    res.sendStatus(404)
  }
  const query = {
    deviceIdFrom: new ObjectId(req.params.idFrom),
    deviceIdTo: new ObjectId(req.params.idTo)
  }
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).send(result)
  connectionClose(client)
})

export default router

/**
 * @file /routers/attributesDictionary.js
 * @module /routers
 * @description attributesDictionary router
 * @version 2024-03-11 C2RLO - fix status/send problem
 * @version 2024-01-30 C2RLO - Initial
 */

import express from 'express'
import { ObjectId } from 'mongodb'
import '../utils/loadEnvironment.js'
import { connectToCluster, connectToDb, connectionClose } from '../db/conn.js'

export const attributesDictionarySchema = {
  name: 'attributesDictionary',
  properties: {
    _id: 'objectId',
    category: 'string?',
    component: 'string?',
    name: 'string?',
    type: 'string?'
  },
  primaryKey: '_id'
}

const collectionName = 'attributesDictionary'
const router = express.Router()

router.get('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const results = await collection.find({}).limit(10).toArray()
  if (!results) res.status(404).send('Not found')
  else {
    res.status(200).send(results)
  }
  connectionClose(client)
})

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

router.post('/', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  const newDocument = req.body
  newDocument.date = new Date()
  const results = await collection.insertOne(newDocument)
  res.status(204).send(results)
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
  const collection = db.collection(collectionName)
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

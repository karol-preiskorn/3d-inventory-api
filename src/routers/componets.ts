/**
 * @file /routers/components.js
 * @module /routers
 * @description This file contains the router for compaonent configurasions.
 * @version 2024-03-29 C2RLO - Initial
 */

import express from 'express'
import { ObjectId } from 'mongodb'
import '../utils/loadEnvironment.js'
import { connectToCluster, connectToDb, connectionClose } from '../db/conn.js'

const collectionName = 'components'
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

router.get('/collection/:collection', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  if (!req.params.collection) {
    res.sendStatus(400)
  }
  const query = { collection: new ObjectId(req.params.collection) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found ' + JSON.stringify(query))
  else res.status(200).send(result)
  connectionClose(client)
})

router.get('/component/:component', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  if (!ObjectId.isValid(req.params.component)) {
    res.sendStatus(400)
    return
  }
  const query = { component: new ObjectId(req.params.component) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found ' + JSON.stringify(query))
  else res.status(200).send(result)
  connectionClose(client)
})

router.get('/attributes/:has', async (req, res) => {
  const client = await connectToCluster()
  const db = await connectToDb(client)
  const collection = db.collection(collectionName)
  let query
  if (req.params.has === 'true' || req.params.has === 'false') {
    res.sendStatus(400)
    return
  }
  if (req.params.has === 'true') {
    query = { attributes: true }
  } else {
    query = { attributes: false }
  }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found ' + JSON.stringify(query))
  else res.status(200).send(result)
  connectionClose(client)
})

export default router

/**
 * @file /routers/floors.js
 * @module routers
 * @description floors router
 */

import express, { RequestHandler } from 'express'
import { Collection, Db, ObjectId, UpdateFilter } from 'mongodb'
import sanitize from 'sanitize-html'

import { closeConnection, connectToCluster, connectToDb } from '../utils/db.js'

interface Floor {
  _id: ObjectId
  name: string
  address: Address
  dimension: Dimension[]
}

interface Address {
  street: string
  city: string
  country: string
  postcode: string
}

interface Dimension {
  description: string
  x: number
  y: number
  h: number
  xPos: number
  yPos: number
  hPos: number
}

const collectionName = 'floors'
const router: express.Router = express.Router()

router.get('/', (async (req: express.Request, res: express.Response) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const results: object[] = await collection.find({}).limit(10).toArray()
  if (!results) res.status(404).send('Not found')
  else {
    const sanitizedResults = results.map((result) => {
      const floor = result as Floor
      return {
        ...floor,
        name: sanitize(floor.name),
        address: {
          ...floor.address,
          street: sanitize(floor.address.street),
          city: sanitize(floor.address.city),
          country: sanitize(floor.address.country),
          postcode: sanitize(floor.address.postcode)
        },
        dimension: floor.dimension.map((dim: Dimension) => ({
          ...dim,
          description: sanitize(dim.description)
        }))
      }
    })
    res.status(200).json(sanitizedResults)
  }
  await closeConnection(client)
}) as RequestHandler)

router.get('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
    return
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).json({ message: 'Not found' })
  else res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

router.get('/model/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
    return
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const sanitizedModelId = sanitize(req.params.id)
  const query = { modelId: new ObjectId(sanitizedModelId) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).json({ message: 'Not found' })
  else res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

router.post('/', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const newDocument: Floor = req.body as Floor
  const result = await collection.insertOne(newDocument)
  const insertedDocument = (await collection.findOne({ _id: result.insertedId })) as Floor
  if (!insertedDocument) {
    res.status(404).send('Inserted document not found')
    await closeConnection(client)
    return
  }

  const sanitizedResult = {
    ...insertedDocument,
    name: sanitize(typeof insertedDocument.name === 'string' ? insertedDocument.name : ''),
    address: {
      ...insertedDocument.address,
      street: sanitize(typeof insertedDocument.address.street === 'string' ? insertedDocument.address.street : ''),
      city: sanitize(typeof insertedDocument.address.city === 'string' ? insertedDocument.address.city : ''),
      country: sanitize(typeof insertedDocument.address.country === 'string' ? insertedDocument.address.country : ''),
      postcode: sanitize(typeof insertedDocument.address.postcode === 'string' ? insertedDocument.address.postcode : '')
    },
    dimension: insertedDocument.dimension.map((dim: Dimension) => ({
      ...dim,
      description: sanitize(typeof dim.description === 'string' ? dim.description : '')
    }))
  }
  res.status(200).json(sanitizedResult)
  await closeConnection(client)
}) as RequestHandler)

router.patch('/dimension/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new ObjectId(req.params.id) }
  const updates: UpdateFilter<Document>[] = [{ $push: { dimension: req.body as Dimension } }]
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

router.delete('/:id', (async (req, res) => {
  // Validate the provided ID to ensure it is a valid ObjectId
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404) // Respond with 404 if the ID is invalid
    return
  }

  // Create a query object to find the document by its ID
  const query = { _id: new ObjectId(req.params.id) }

  // Connect to the MongoDB cluster
  const client = await connectToCluster()
  const db: Db = connectToDb(client)

  // Access the collection and attempt to delete the document
  const collection: Collection = db.collection(collectionName)
  const result = await collection.deleteOne(query)

  // Check if a document was deleted and respond accordingly
  if (result.deletedCount === 0) {
    res.status(404).json({ message: 'Document not found' }) // No document found to delete
  } else {
    res.status(200).json(result) // Successfully deleted the document
  }

  // Close the database connection
  await closeConnection(client)
}) as RequestHandler)

router.delete('/', (async (req, res) => {
  if (req.query.confirm !== 'true') {
    res.status(400).json({ message: 'Confirmation required. Add ?confirm=true to proceed.' })
    return
  }

  let client: ReturnType<typeof connectToCluster> | null = null
  try {
    const client = await connectToCluster()
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const result = await collection.deleteMany({})
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ message: 'Error deleting documents', error: (error as Error).message })
  } finally {
    if (client) await closeConnection(client)
  }
}) as RequestHandler)

router.delete('/model/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { modelId: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).json(result)
  await closeConnection(client)
}) as RequestHandler)

export default router

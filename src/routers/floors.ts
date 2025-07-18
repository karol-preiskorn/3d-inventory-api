/**
 * @file /routers/floors.js
 * @module routers
 * @description floors router
 */

import express, { RequestHandler } from 'express';
import { Collection, Db, ObjectId, UpdateFilter, Document } from 'mongodb';
import sanitize from 'sanitize-html';

import { closeConnection, connectToCluster, connectToDb } from '../utils/db';

interface Floor {
  _id: ObjectId;
  name: string;
  address: Address;
  dimension: Dimension[];
}

type NewFloor = Omit<Floor, '_id'>;

interface Address {
  street: string;
  city: string;
  country: string;
  postcode: string;
}

interface Dimension {
  description: string;
  x: number;
  y: number;
  h: number;
  xPos: number;
  yPos: number;
  hPos: number;
}

const collectionName = 'floors';
const router: express.Router = express.Router();

router.get('/', (async (req: express.Request, res: express.Response) => {
  const client = await connectToCluster();
  const db: Db = connectToDb(client);
  const collection: Collection = db.collection(collectionName);
  const results: object[] = await collection.find({}).limit(10).toArray();
  if (!results) res.status(404).send('Not found');
  else {
    const sanitizedResults = results.map((result) => {
      const floor = result as Floor;
      return {
        ...floor,
        name: sanitize(floor.name),
        address: {
          ...floor.address,
          street: sanitize(floor.address.street),
          city: sanitize(floor.address.city),
          country: sanitize(floor.address.country),
          postcode: sanitize(floor.address.postcode),
        },
        dimension: floor.dimension.map((dim: Dimension) => ({
          ...dim,
          description: sanitize(dim.description),
        })),
      };
    });
    res.status(200).json(sanitizedResults);
  }
  await closeConnection(client);
}) as RequestHandler);

router.get('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404);
    return;
  }
  const client = await connectToCluster();
  const db: Db = connectToDb(client);
  const collection: Collection = db.collection(collectionName);
  const query = { _id: new ObjectId(req.params.id) };
  const result = await collection.findOne(query);
  if (!result) res.status(404).json({ message: 'Not found' });
  else res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

router.get('/model/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404);
    return;
  }
  const client = await connectToCluster();
  const db: Db = connectToDb(client);
  const collection: Collection = db.collection(collectionName);
  const sanitizedModelId = sanitize(req.params.id);
  const query = { modelId: new ObjectId(sanitizedModelId) };
  const result = await collection.findOne(query);
  if (!result) res.status(404).json({ message: 'Not found' });
  else res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

router.post('/', (async (req, res) => {
  const { name, address, dimension } = req.body;
  if (
    typeof name !== 'string' ||
    !address ||
    typeof address.street !== 'string' ||
    typeof address.city !== 'string' ||
    typeof address.country !== 'string' ||
    typeof address.postcode !== 'string' ||
    !Array.isArray(dimension) ||
    !dimension.every(
      (dim: Dimension) =>
        typeof dim.description === 'string' &&
        typeof dim.x === 'number' &&
        typeof dim.y === 'number' &&
        typeof dim.h === 'number' &&
        typeof dim.xPos === 'number' &&
        typeof dim.yPos === 'number' &&
        typeof dim.hPos === 'number',
    )
  ) {
    console.error({ message: 'Invalid input data' });
  }
  const sanitizedDocument: NewFloor = {
    name: sanitize(name),
    address: {
      street: sanitize(address.street),
      city: sanitize(address.city),
      country: sanitize(address.country),
      postcode: sanitize(address.postcode),
    },
    dimension: dimension.map((dim: Dimension) => ({
      description: sanitize(dim.description),
      x: dim.x,
      y: dim.y,
      h: dim.h,
      xPos: dim.xPos,
      yPos: dim.yPos,
      hPos: dim.hPos,
    })),
  };
  let client: import('mongodb').MongoClient | null = null;
  try {
    client = await connectToCluster();
    const db: Db = connectToDb(client);
    const collection: Collection = db.collection(collectionName);
    const result = await collection.insertOne(sanitizedDocument);
    if (!result.acknowledged) {
      res.status(500).json({ message: 'Failed to insert document' });
      return;
    }
    const insertedDocument = { _id: result.insertedId, ...sanitizedDocument };
    console.log(`Inserted document with ID: ${result.insertedId}`);
    console.log(`Inserted document: ${JSON.stringify(insertedDocument)}`);
    res.status(201).json(insertedDocument);
  } catch (error) {
    res.status(500).json({ message: 'Error inserting document', error: (error as Error).message });
  } finally {
    if (client) await closeConnection(client);
  }
}) as RequestHandler);

router.put('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404);
    return;
  }
  const query = { _id: new ObjectId(req.params.id) };
  const sanitizedDocument: NewFloor = {
    name: sanitize(req.body.name),
    address: {
      street: sanitize(req.body.address.street),
      city: sanitize(req.body.address.city),
      country: sanitize(req.body.address.country),
      postcode: sanitize(req.body.address.postcode),
    },
    dimension: req.body.dimension.map((dim: Dimension) => ({
      description: sanitize(dim.description),
      x: dim.x,
      y: dim.y,
      h: dim.h,
      xPos: dim.xPos,
      yPos: dim.yPos,
      hPos: dim.hPos,
    })),
  };
  const updates: UpdateFilter<Document>[] = [{ $set: sanitizedDocument }];
  const client = await connectToCluster();
  try {
    const db: Db = connectToDb(client);
    const collection: Collection = db.collection(collectionName);
    const result = await collection.updateOne(query, updates);
    if (result.modifiedCount === 0) {
      res.status(404).json({ message: 'Document not found or no changes made' });
    } else {
      res.status(200).json({ message: 'Document updated successfully', result });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating document', error: (error as Error).message });
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

router.patch('/dimension/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404);
    return;
  }
  const query = { _id: new ObjectId(req.params.id) };
  const updates = { $push: { dimension: req.body } };
  const client = await connectToCluster();
  try {
    const db: Db = connectToDb(client);
    const collection: Collection = db.collection(collectionName);
    const result = await collection.updateOne(query, updates);
    res.status(200).json(result);
  } finally {
    await closeConnection(client);
  }
}) as RequestHandler);

router.delete('/:id', (async (req, res) => {
  // Validate the provided ID to ensure it is a valid ObjectId
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404); // Respond with 404 if the ID is invalid
    return;
  }

  // Create a query object to find the document by its ID
  const query = { _id: new ObjectId(req.params.id) };

  // Connect to the MongoDB cluster
  const client = await connectToCluster();
  const db: Db = connectToDb(client);

  // Access the collection and attempt to delete the document
  const collection: Collection = db.collection(collectionName);
  const result = await collection.deleteOne(query);

  // Check if a document was deleted and respond accordingly
  if (result.deletedCount === 0) {
    res.status(404).json({ message: 'Document not found' }); // No document found to delete
  } else {
    res.status(200).json(result); // Successfully deleted the document
  }

  // Close the database connection
  await closeConnection(client);
}) as RequestHandler);

router.delete('/', (async (req, res) => {
  if (req.query.confirm !== 'true') {
    res.status(400).json({ message: 'Confirmation required. Add ?confirm=true to proceed.' });
    return;
  }

  let client: ReturnType<typeof connectToCluster> | null = null;
  try {
    const client = await connectToCluster();
    const db: Db = connectToDb(client);
    const collection: Collection = db.collection(collectionName);
    const result = await collection.deleteMany({});
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting documents', error: (error as Error).message });
  } finally {
    if (client) await closeConnection(client);
  }
}) as RequestHandler);

router.delete('/model/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404);
  }
  const query = { modelId: new ObjectId(req.params.id) };
  const client = await connectToCluster();
  const db: Db = connectToDb(client);
  const collection: Collection = db.collection(collectionName);
  const result = await collection.deleteMany(query);
  res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

export default router;

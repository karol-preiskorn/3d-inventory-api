/*
 * File:        index.js
 * Description: Connect to MongoDB 3d-inventory claster
 * Used by:     testing connect to Mongo Atlas
 * Dependency:  .env (not push to git)
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-11-20  C2RLO  Add logger
 * 2023-10-29  C2RLO  Init
 */

import "dotenv/config"
import logger from "../src/util/logger"
import { MongoClient, ServerApiVersion } from "mongodb"

const username = encodeURIComponent(process.env.username)
const password = encodeURIComponent(process.env.password)
const clusterUri = encodeURIComponent(process.env.clusterUri)

const uri = `mongodb+srv://${username}:${password}@${clusterUri}/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

async function run() {
  try {
    await client.connect()
    const dbName = process.env.dbName
    const collectionName = "devices"
    const database = client.db(dbName)
    const collection = database.collection(collectionName)

    await database.command({ ping: 1 })
    logger.info("Pinged your deployment. You successfully connected to MongoDB!")

    const findQuery = {}

    try {
      const cursor = await collection.find(findQuery).sort({ name: 1 }).forEach(device => {
        logger.info(`${device.name} has model ${device.modelId}, position: [${device.position.x}, ${device.position.y}, ${device.position.h}].`)
      })
    } catch (err) {
      console.error(`Something went wrong trying to find the documents: ${err}\n`)
    }
  } finally {
    logger.info("Close connection")
    await client.close()
  }
}

run().catch(console.dir)

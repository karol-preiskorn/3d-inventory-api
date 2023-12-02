/*
 * File:        /src/services/database.dervice.ts
 * Description: Connect and execute query to Mongo Atlas
 * Used by:
 * Dependency:
 *
 * Date        By       Comments
 * ----------  -------  ------------------------------
 * 2023-11-21  C2RLO    Initial
 */


import "dotenv/config"
import logger from "../util/logger"
import { Document, Filter, MongoClient, ServerApiVersion } from "mongodb"
//import environment from "src/environment"

const username = encodeURIComponent(process.env.USERNAME)
const password = encodeURIComponent(process.env.PASSWORD)
const clusterUri = encodeURIComponent(process.env.CLUSTERURI)

const uri = `mongodb+srv://${username}:${password}@${clusterUri}/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

export async function runQuery(p_collection: string, p_query: Filter<Document>) {
  try {
    await client.connect()
    const dbName = process.env.dbName
    const collectionName = p_collection
    const database = client.db(dbName)
    const collection = database.collection(collectionName)

    await database.command({ ping: 1 })
    //logger.info("Pinged your deployment. You successfully connected to MongoDB!")


    try {
      const cursor = await collection.find(p_query).sort({}).forEach(device => {
        logger.info(`${device.name} has model ${device.modelId}, position: [${device.position.x}, ${device.position.y}, ${device.position.h}].`)
      })
    } catch (err) {
      logger.error(`Something went wrong trying to find the documents: ${err}\n`)
    }
  } finally {
    //logger.info("Close connection")
    await client.close()
  }
}

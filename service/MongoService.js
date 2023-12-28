/**
 * File:        /service/mongoService.ts
 * Description:
 * Used by:
 * Dependency:
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-12-28  C2RLO  Initial
**/

"use strict"

const { MongoClient, ServerApiVersion } = require("mongodb")
const logger = require("../utils/logger.js")

require("dotenv").config()

const client = new MongoClient(process.env.URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

async function runQuery(pCollection, pQuery) {
  try {
    await client.connect()
    const dbName = process.env.dbName
    const collectionName = pCollection
    const database = client.db(dbName)
    const collection = database.collection(collectionName)
    try {
      await collection.find(pQuery).sort({}).forEach(device => {
        logger.info(`${device.name} has model ${device.modelId}, position: [${device.position.x}, ${device.position.y}, ${device.position.h}].`)
      })
    } catch (err) {
      logger.error(`Something went wrong trying to find the documents: ${err}\n`)
    }
  } finally {
    logger.info("Close connection")
    await client.close()
  }
}

module.exports = runQuery

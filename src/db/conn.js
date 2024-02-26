/**
 * @file conn.js Connect to Mongo Atlas DB
 * @module db/conn
 * @description This module exports a MongoDB client and a database connection.
 * @version 2024-01-27 C2RLO - add exit(1) on error
 * @version 2024-01-25 C2RLO - Add connectionClose()
 * @version 2024-01-13 C2RLO - Fix async error
 * @version 2023-12-29 C2RLO - Initial
 */

import { MongoClient } from 'mongodb'
import { logger } from '../utils/logger.js'

const uri = process.env.ATLAS_URI || ''

/**
 * Connects to the MongoDB Atlas cluster.
 * @returns {Promise<MongoClient>} The connected MongoDB client.
 */
export async function connectToCluster() {
  let client
  let connect
  try {
    client = new MongoClient(uri)
    // logger.info('Connecting to MongoDB Atlas cluster...')
    connect = await client.connect()
    logger.info('Successfully connected to Atlas cluster')
    return connect
  } catch (error) {
    logger.error(`Connection to Atlas cluster failed: ${error}`)
    process.exit(1)
  }
}

/**
 * Connects to the MongoDB Atlas database.
 * @param {MongoClient} client - The MongoDB client.
 * @returns {db} The connected database.
 */
export async function connectToDb(client) {
  let db
  try {
    // logger.info('Connecting to MongoDB Atlas db...')
    db = await client.db(process.env.DBNAME)
    logger.info(`Successfully connected to Atlas DB ${process.env.DBNAME}`)
    return db
  } catch (error) {
    logger.error(`Connection to Atlas DB failed ${process.env.DBNAME}: ${error}`)
    process.exit(1)
  }
}

/**
 * Closes the MongoDB connection.
 * @param {MongoClient} connection - The MongoDB connection.
 * @returns {void}
 */
export async function connectionClose(connection) {
  try {
    await connection.close()
    logger.info('Successfully closed the connection.')
  } catch (error) {
    logger.error('Failed to close the connection!', error)
  }
}

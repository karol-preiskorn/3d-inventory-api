/**
 * @resume Connect to Mongo Atlas DB.
 * @module db/conn
 * @description This module exports a MongoDB client and a database connection.
 * @version 2024-01-27 C2RLO - add exit(1) on error
 * @version 2024-01-25 C2RLO - Add connectionClose()
 * @version 2024-01-13 C2RLO - Fix async error
 * @version 2023-12-29 C2RLO - Initial
 */

import { MongoClient } from 'mongodb';

import { logger } from '../utils/logger';

const uri = process.env.ATLAS_URI ?? ''

/**
 * Connects to the MongoDB Atlas cluster.
 * @returns {Promise<MongoClient>} The connected MongoDB client.
 */
export async function connectToCluster(): Promise<MongoClient> {
  let client
  let connect
  try {
    client = new MongoClient(uri)
    connect = await client.connect()
    // logger.info('Successfully connected to Atlas cluster')
    return connect
  } catch (error) {
    logger.error(`Connection to Atlas cluster failed: ${error as string}`)
    process.exit(1)
  }
}

/**
 * Connects to the MongoDB Atlas db.
 * @param {MongoClient} client - The MongoDB client.
 * @returns {Promise<Db>} The connected database.
 */
export function connectToDb(client: MongoClient) {
  let db
  try {
    db = client.db(process.env.DBNAME)
    // logger.info(`Successfully connected to Atlas DB ${process.env.DBNAME}`)
    return db
  } catch (e) {
    logger.error(`Connection to Atlas DB failed ${process.env.DBNAME}: ${e as string}`)
    process.exit(1)
  }
}

/**
 * Closes the MongoDB connection.
 * @param {MongoClient} connection - The MongoDB connection.
 * @returns {void}
 */
export async function connectionClose(connection: MongoClient): Promise<void> {
  try {
    await connection.close()
    // logger.info('Successfully closed the connection.')
  } catch (error) {
    logger.error('Failed to close the connection!', error)
  }
}

/**
 * @resume Connect to Mongo Atlas DB.
 * @module db/conn
 * @description This module exports a MongoDB client and a database connection.
 */

import type { Db, MongoClientOptions } from 'mongodb';
import { MongoClient } from 'mongodb';
import config from '../utils/config';
import log from '../utils/logger';

const logger = log('db');

const uri = config.ATLAS_URI;

const mongoOptions: MongoClientOptions = {
  // SSL/TLS configuration
  tls: true,
  tlsAllowInvalidCertificates: true, // For development
  tlsInsecure: false,

  // Connection settings
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,

  // Retry settings
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 1
};

/**
 * Connects to the MongoDB Atlas cluster.
 * @returns {Promise<MongoClient>} The connected MongoDB client.
 */
export async function connectToCluster(): Promise<MongoClient> {
  let client;

  let connect;

  try {
    client = new MongoClient(uri, mongoOptions);
    connect = await client.connect();
    logger.info('Successfully connected to Atlas cluster');

    return connect;
  } catch (error) {
    logger.error(`Connection to Atlas cluster failed: ${error as string}`);
    process.exit(1);
  }
}

/**
 * Connects to the specified MongoDB database.
 * @param {MongoClient} client - The connected MongoDB client.
 * @returns {Db} The MongoDB database instance.
 */
export function connectToDb(client: MongoClient): Db {
  if (!config.DBNAME || typeof config.DBNAME !== 'string') {
    throw new Error('Invalid or undefined DBNAME in configuration.');
  }
  try {
    const db = client.db(config.DBNAME);

    logger.info(`Successfully connected to Atlas DB ${config.DBNAME}`);

    return db;
  } catch (error) {
    logger.error(`Connection to Atlas DB failed (${config.DBNAME}): ${error}`);
    process.exit(1);
  }
}
/**
 * Closes the MongoDB connection.
 * @param {MongoClient} connection - The MongoDB connection.
 * @returns {void}
 */
export async function closeConnection(client: MongoClient): Promise<void> {
  try {
    await client.close();
    logger.info('MongoDB connection closed successfully.');
  } catch (error) {
    logger.error(`Failed to close MongoDB connection: ${error}`);
    process.exit(1);
  }
}

import { MongoMemoryServer } from 'mongodb-memory-server';
/**
 * @file:   /tests/teardown.js
 * @module: /tests
 * @description: This file contains the global setup for Jest testing.
 * @version 2024-01-15 C2RLO - Initial
 */

/**
 * Global teardown function for Jest testing.
 * @param {object} globalConfig - The global Jest configuration object.
 * @param {object} projectConfig - The project-specific Jest configuration object.
 * @returns {Promise<void>} - A promise that resolves when the teardown is complete.
*/
export default async function (globalConfig: object, projectConfig: { cache: object }): Promise<void> {
  console.log((globalConfig as { testPathPattern: any }).testPathPattern);
  console.log(projectConfig.cache);

  const mongod: MongoMemoryServer = (globalThis as unknown as { __MONGOD__: MongoMemoryServer }).__MONGOD__;
  await mongod.stop();
  await (globalThis as unknown as { __MONGOD__: MongoMemoryServer }).__MONGOD__.stop();
}

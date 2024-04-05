/**
 * @file: /tests/setup.js
 * @module: /tests
 * @description: This file contains the global setup for Jest testing.
 * @version 2024-01-15 C2RLO - Initial
 */

/**
 * Global setup function for Jest testing.
 * @param {object} globalConfig - The global Jest configuration object.
 * @param {object} projectConfig - The project-specific Jest configuration object.
 * @returns {Promise<void>} - A promise that resolves when the setup is complete.
 */
module.exports = async function (globalConfig, projectConfig) {
  console.log(globalConfig.testPathPattern)
  console.log(projectConfig.cache)

  // Set reference to mongod in order to close the server during teardown.
  globalThis.__MONGOD__ = process.env.MONGO_URL
}

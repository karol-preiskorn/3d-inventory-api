/**
 * @file: /tests/setup.js
 * @module: /tests
 * @description:
 * @version 2024-01-15 C2RLO - Initial
**/


module.exports = async function (globalConfig, projectConfig) {
  console.log(globalConfig.testPathPattern)
  console.log(projectConfig.cache)

  // Set reference to mongod in order to close the server during teardown.
  globalThis.__MONGOD__ = mongod
}

/**
 * @file: /tests/teardown.js
 * @module: /tests
 * @description:
 * @version 2024-01-15 C2RLO - Initial
**/



module.exports = async function (globalConfig, projectConfig) {
  console.log(globalConfig.testPathPattern)
  console.log(projectConfig.cache)

  await globalThis.__MONGOD__.stop()
}

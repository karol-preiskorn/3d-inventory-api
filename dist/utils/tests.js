'use strict'
/**
 * @file /utils/tests.js
 * @module /utils
 * @description function to get error from async call
 * @version 2024-02-03 C2RLO - Initial
 */
Object.defineProperty(exports, '__esModule', { value: true })
exports.getError = exports.NoErrorThrownError = void 0
class NoErrorThrownError extends Error {}
exports.NoErrorThrownError = NoErrorThrownError
async function getError(call) {
  try {
    await call()
    throw new NoErrorThrownError()
  } catch (error) {
    return error
  }
}
exports.getError = getError
//# sourceMappingURL=tests.js.map

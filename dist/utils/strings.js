'use strict'
/**
 * @file /utils/strings.js
 * @module /utils
 * @description This file contains utility functions for working with strings.
 * @version 2024-02-01 C2RLO - Initial
 */
Object.defineProperty(exports, '__esModule', { value: true })
exports.capitalizeFirstLetter = void 0
/**
 * @description capitalize first letter of a string
 * @param {string} [first] string to capitalize
 * @returns {string} string with first letter capitalized
 */
function capitalizeFirstLetter([first = '', ...rest]) {
  return [first.toUpperCase(), ...rest].join('')
}
exports.capitalizeFirstLetter = capitalizeFirstLetter
//# sourceMappingURL=strings.js.map

/**
 * @file /utils/strings.js
 * @module /utils
 * @description
 * @version 2024-02-01 C2RLO - Initial
 */

/**
 * @description capitalize first letter of a string
 * @param {string} [first] string to capitalize
 * @returns {string} string with first letter capitalized
 */
export function capitalizeFirstLetter([first = '', ...rest]) {
  return [first.toUpperCase(), ...rest].join('')
}

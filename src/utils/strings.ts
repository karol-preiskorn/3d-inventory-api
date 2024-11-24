/**
 * @file /utils/strings.js
 * @module /utils
 * @description This file contains utility functions for working with strings.
 */

/**
 * @description capitalize first letter of a string
 * @param {string} [first] string to capitalize
 * @returns {string} string with first letter capitalized
 */
export function capitalizeFirstLetter(str: string): string {
  if (str.length === 0) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
/**
 * Capitalizes the first letter of a string and cut last letter
 *
 * @param s - The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalize(s: string): string {
  return s[0].toUpperCase().slice(0, 1) + s.slice(1, s.length - 1)
}

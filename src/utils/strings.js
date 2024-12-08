"use strict";
/**
 * @file /utils/strings.js
 * @module /utils
 * @description This file contains utility functions for working with strings.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.capitalize = capitalize;
/**
 * @description capitalize first letter of a string
 * @param {string} [first] string to capitalize
 * @returns {string} string with first letter capitalized
 */
function capitalizeFirstLetter(str) {
    if (str.length === 0)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * Capitalizes the first letter of a string and cut last letter
 *
 * @param s - The string to capitalize.
 * @returns The capitalized string.
 */
function capitalize(s) {
    return s[0].toUpperCase().slice(0, 1) + s.slice(1, s.length - 1);
}

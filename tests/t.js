/**
 * @file /tests/t.js
 * @module /tests
 * @description different method to filter an object
 * @version 2024-02-03 C2RLO - Initial
 */

import { valueAttributeType, valueAttributeCategory, components } from '../utils/types.js'

/**
 * Filtered components object.
 * @type {object}
 */
// const filteredComponents = Object.keys(components)
//   .filter(key => allowed.includes(key))
//   .reduce((obj, key) => {
//     obj[key] = components[key]
//     return obj
//   }, {})
// console.log(filteredComponents)


// select only the components that have the attribute true
const allowed = [true]
const filteredComponents = components.filter((item) => allowed.includes(item.attributes))
console.log(filteredComponents)

// select only the attributeCategory that have the attributes
const allowedAttributeCategory = [filteredComponents[0].component]
const filteredAttributeCategory = valueAttributeCategory.filter((item) => allowedAttributeCategory.includes(item.component))
console.log(filteredAttributeCategory)

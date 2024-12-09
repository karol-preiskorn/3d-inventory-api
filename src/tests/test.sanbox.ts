/**
 * @file /tests/t.js
 * @description different method to filter an object
 * @version 2024-02-03 C2RLO - Initial
 */

import { components, valueAttributeCategory } from '../utils/types.js'

/**
 * Filtered components object.
 * @type {object}
 */

const allowed: boolean[] = [true]
const filteredComponents = components.filter((item: { component: string, collection: string, attributes: boolean }) => allowed.includes(item.attributes))
console.log(filteredComponents)

// select only the attributeCategory that have the attributes
const allowedAttributeCategory = [filteredComponents[0].component]
const filteredAttributeCategory = valueAttributeCategory.filter((item: { component: string }) => allowedAttributeCategory.includes(item.component))
console.log(filteredAttributeCategory)

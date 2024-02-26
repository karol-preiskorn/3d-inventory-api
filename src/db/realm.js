/**
 * @file /db/realm.js
 * @module /db
 * @description Realm database
 * @version 2024-01-30 C2RLO - Initial
**/

import Realm from 'realm'
import '../utils/loadEnvironment.js'

const app = new Realm.App({ id: process.env.REALM_APP_ID })
const credentials = Realm.Credentials.anonymous()

export const attributeSchema = {
  name: 'attribute',
  properties: {
    _id: 'objectId',
    attributesDictionaryId: 'string?',
    connectionId: 'string?',
    deviceId: 'string?',
    modelId: 'string?',
    value: 'string?',
  },
  primaryKey: '_id',
}
export const attributesDictionarySchema = {
  name: 'attributesDictionary',
  properties: {
    _id: 'objectId',
    category: 'string?',
    component: 'string?',
    name: 'string?',
    type: 'string?',
  },
  primaryKey: '_id',
}

try {
  const user = await app.logIn(credentials)
} catch (err) {
  console.error("Failed to log in", err)
}

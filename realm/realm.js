'use strict'
/**
 * @file /db/realm.js
 * @module /db
 * @description Realm database
 * @version 2024-01-30 C2RLO - Initial
 */
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.attributesDictionarySchema = exports.attributeSchema = void 0
const realm_1 = __importDefault(require('realm'))
require('../src/utils/loadEnvironment.js')
const realm_js_1 = require('./realm.js')
realm_js_1.app = new realm_1.default.App({ id: process.env.REALM_APP_ID })
const credentials = realm_1.default.Credentials.anonymous()
exports.attributeSchema = {
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
exports.attributesDictionarySchema = {
  name: 'attributesDictionary',
  properties: {
    _id: 'objectId',
    category: 'string?',
    component: 'string?',
    name: 'string?',
    type: 'string?',
  },
  primaryKey: '_id',
}(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      yield realm_js_1.app.logIn(credentials)
    } catch (err) {
      console.error('Failed to log in', err)
    }
  }),
)()
//# sourceMappingURL=realm.js.map

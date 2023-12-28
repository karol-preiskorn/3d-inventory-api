/**
 * File:        /api/json2openapi.js
 * Description: Convert MongoDB JSON schema definition to YAML OpenAPI definition
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-12-26  C2RLO  Initial
 **/

import OASNormalize from "oas-normalize"
import toOpenApi from "json-schema-to-openapi-schema"

const attributeSchema = {
  properties: {
    _id: {
      bsonType: "objectId",
    },
    attributeDictionaryId: {
      bsonType: "string",
    },
    connectionId: {
      bsonType: "string",
    },
    deviceId: {
      bsonType: "string",
    },
    modelId: {
      bsonType: "string",
    },
    value: {
      bsonType: "string",
    },
  }
}

const convertedSchema = toOpenApi(attributeSchema)
console.log(convertedSchema)

const oas = new OASNormalize(
  convertedSchema
  // ...or a string, path, JSON blob, whatever you've got.
)

oas
  .then(definition => {
    // Definition will always be JSON, and valid.
    console.log(definition)
  })
  .catch(err => {
    console.log(err)
  })

"use strict"


/**
 * Get model
 * Dictionary models of device.
 *
 * id UUID ID of attribute-dictionary to fetch logs
 * returns Floors
 **/
exports.modelGet = function(id) {
  return new Promise(function(resolve, reject) {
    const examples = {}
    examples["application/json"] = [ {
  "_id" : "653e120577c067b6abbe5d26",
  "name" : "Konopelski - Walter - incentivize global 2222",
  "adress" : {
    "street" : "Zion Valleys 86789",
    "city" : "Paradise",
    "country" : "Papua New Guinea",
    "postcode" : "05649-8267"
  },
  "dimension" : {
    "description" : "Koss, Powlowski and Sipes - leverage out-of-the-box schemas dasd",
    "x" : "54",
    "y" : "58",
    "h" : "6",
    "x_pos" : "76",
    "y_pos" : "70",
    "h_pos" : "23"
  }
}, {
  "_id" : "653e120577c067b6abbe5d26",
  "name" : "Konopelski - Walter - incentivize global 2222",
  "adress" : {
    "street" : "Zion Valleys 86789",
    "city" : "Paradise",
    "country" : "Papua New Guinea",
    "postcode" : "05649-8267"
  },
  "dimension" : {
    "description" : "Koss, Powlowski and Sipes - leverage out-of-the-box schemas dasd",
    "x" : "54",
    "y" : "58",
    "h" : "6",
    "x_pos" : "76",
    "y_pos" : "70",
    "h_pos" : "23"
  }
} ]
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]])
    } else {
      resolve()
    }
  })
}


/**
 * Delete all models
 * Delete all models
 *
 * no response value expected for this operation
 **/
exports.modelsDelete = function() {
  return new Promise(function(resolve, reject) {
    resolve()
  })
}


/**
 * Devices models
 * Dictionary models of device.
 *
 * returns Models
 **/
exports.modelsGet = function() {
  return new Promise(function(resolve, reject) {
    const examples = {}
    examples["application/json"] = {
  "type" : "array",
  "items" : {
    "$ref" : "#/components/schemas/Model/example"
  }
}
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]])
    } else {
      resolve()
    }
  })
}


/**
 * Create devices attributes types.
 * Create dictionary models of device.
 *
 * body Model
 * no response value expected for this operation
 **/
exports.modelsPost = function(body) {
  return new Promise(function(resolve, reject) {
    resolve()
  })
}


/**
 * Update model
 * Update single model
 *
 * body Model
 * no response value expected for this operation
 **/
exports.modelsPut = function(body) {
  return new Promise(function(resolve, reject) {
    resolve()
  })
}

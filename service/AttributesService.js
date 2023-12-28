'use strict';


/**
 * Update new Atributtes beetween two devices
 * Create Atributtes beetween two devices. Two id and attributes from attributes.
 *
 * no response value expected for this operation
 **/
exports.attributesDelete = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Get all atributtes for device
 * 3d-inventory attributes from dictionary atributes
 *
 * id UUID ID of attribute-dictionary to fetch logs
 * no response value expected for this operation
 **/
exports.attributesDeviceGet = function(id) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Get all atributtes
 * 3d-inventory attributes from dictionary atributes
 *
 * returns Attributes
 **/
exports.attributesGET = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "_id" : "653e10ecd6025afb66017c65",
  "deviceId" : "be5bb617-a614-435f-bf66-8768d0aba0c8",
  "modelId" : "",
  "connectionId" : "",
  "attributeDictionaryId" : "b324c94f-58a7-4e2e-a566-207024cb3485",
  "value" : "2"
}, {
  "_id" : "1234erdsfdasdasdasd17c65",
  "deviceId" : "be5basd7-a614-435f-bf66-8768d0aba0c8",
  "modelId" : "be5basd7-a614-435f-bfas-8768d0asdasd",
  "connectionId" : "",
  "attributeDictionaryId" : "",
  "value" : "2"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get all atributtes for model id
 * 3d-inventory attributes from dictionary atributes
 *
 * id UUID ID of attribute-dictionary to fetch logs
 * no response value expected for this operation
 **/
exports.attributesModelGet = function(id) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Create new Atributtes
 * 3d-inventory attributes from dictionary atributes
 *
 * body Attribute 
 * no response value expected for this operation
 **/
exports.attributesPOST = function(body) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Update new Atributtes beetween two devices
 * Create Atributtes beetween two devices. Two id and attributes from attributes.
 *
 * body Attribute 
 * no response value expected for this operation
 **/
exports.attributesPut = function(body) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


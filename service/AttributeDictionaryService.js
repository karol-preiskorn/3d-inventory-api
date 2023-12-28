'use strict';


/**
 * Get information about devices attributes for connection.
 * Dictionary attributes dictionary for connection.
 *
 * no response value expected for this operation
 **/
exports.attributeDictionaryConnectionGet = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Get information about devices attributes for connections.
 * Dictionary attributes dictionary for connections.
 *
 * no response value expected for this operation
 **/
exports.attributeDictionaryConnectionsGet = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Delete all attributeDictionary
 * Create Atributtes beetween two devices. Two id and attributes from attributes.
 *
 * no response value expected for this operation
 **/
exports.attributeDictionaryDelete = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Get information about devices attributes for models.
 * Dictionary attributes dictionary for models.
 *
 * no response value expected for this operation
 **/
exports.attributeDictionaryDevicesGet = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Get information about devices attributes types.
 * Dictionary attributes types for device and models. Store information about extra parmaeters.
 *
 * returns AttributeDictionaries
 **/
exports.attributeDictionaryGet = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "_id" : "653e10ecd6025afb66017c65",
  "name" : "MaxAmount",
  "type" : "",
  "category" : "",
  "component" : "b324c94f-58a7-4e2e-a566-207024cb3485"
}, {
  "_id" : "653e10ecd6025afb66017c65",
  "name" : "MaxAmount",
  "type" : "",
  "category" : "",
  "component" : "b324c94f-58a7-4e2e-a566-207024cb3485"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get information about devices attributes for models.
 * Dictionary attributes dictionary for models.
 *
 * no response value expected for this operation
 **/
exports.attributeDictionaryModelsGet = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Create devices attributes types.
 * 3d-inventory attributes from dictionary atributes
 *
 * body AttributeDictionary 
 * no response value expected for this operation
 **/
exports.attributeDictionaryPost = function(body) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Update new atributte-dictionary
 * Create attribute-dictionary beetween two devices. Two id and attributes from attributes.
 *
 * body AttributeDictionary 
 * no response value expected for this operation
 **/
exports.attributeDictionaryPut = function(body) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


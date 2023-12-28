'use strict';


/**
 * Delete all attribute-dictionary
 * Create Atributtes beetween two devices. Two id and attributes from attributes.
 *
 * no response value expected for this operation
 **/
exports.floorDelete = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Get the single floor 
 * Get single foor
 *
 * id UUID ID of foor to fetch
 * returns Floor
 **/
exports.floorIdGet = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
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
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Create devices attributes types.
 * 3d-inventory attributes from dictionary atributes
 *
 * body Floor 
 * no response value expected for this operation
 **/
exports.floorPost = function(body) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Update new atributte-dictionary
 * Create attribute-dictionary beetween two devices. Two id and attributes from attributes.
 *
 * body Floor 
 * no response value expected for this operation
 **/
exports.floorPut = function(body) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Floors 
 * Floors data and atributes
 *
 * no response value expected for this operation
 **/
exports.floorsGet = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


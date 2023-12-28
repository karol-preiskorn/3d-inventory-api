'use strict';

var utils = require('../utils/writer.js');
var Floors = require('../service/FloorsService');

module.exports.floorDelete = function floorDelete (req, res, next) {
  Floors.floorDelete()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.floorIdGet = function floorIdGet (req, res, next, id) {
  Floors.floorIdGet(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.floorPost = function floorPost (req, res, next, body) {
  Floors.floorPost(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.floorPut = function floorPut (req, res, next, body) {
  Floors.floorPut(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.floorsGet = function floorsGet (req, res, next) {
  Floors.floorsGet()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

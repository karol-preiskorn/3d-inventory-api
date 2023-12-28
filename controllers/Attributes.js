'use strict';

var utils = require('../utils/writer.js');
var Attributes = require('../service/AttributesService');

module.exports.attributesDelete = function attributesDelete (req, res, next) {
  Attributes.attributesDelete()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.attributesDeviceGet = function attributesDeviceGet (req, res, next, id) {
  Attributes.attributesDeviceGet(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.attributesGET = function attributesGET (req, res, next) {
  Attributes.attributesGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.attributesModelGet = function attributesModelGet (req, res, next, id) {
  Attributes.attributesModelGet(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.attributesPOST = function attributesPOST (req, res, next, body) {
  Attributes.attributesPOST(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.attributesPut = function attributesPut (req, res, next, body) {
  Attributes.attributesPut(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

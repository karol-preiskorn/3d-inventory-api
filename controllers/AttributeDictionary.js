'use strict';

var utils = require('../utils/writer.js');
var AttributeDictionary = require('../service/AttributeDictionaryService');

module.exports.attributeDictionaryConnectionGet = function attributeDictionaryConnectionGet (req, res, next) {
  AttributeDictionary.attributeDictionaryConnectionGet()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.attributeDictionaryConnectionsGet = function attributeDictionaryConnectionsGet (req, res, next) {
  AttributeDictionary.attributeDictionaryConnectionsGet()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.attributeDictionaryDelete = function attributeDictionaryDelete (req, res, next) {
  AttributeDictionary.attributeDictionaryDelete()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.attributeDictionaryDevicesGet = function attributeDictionaryDevicesGet (req, res, next) {
  AttributeDictionary.attributeDictionaryDevicesGet()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.attributeDictionaryGet = function attributeDictionaryGet (req, res, next) {
  AttributeDictionary.attributeDictionaryGet()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.attributeDictionaryModelsGet = function attributeDictionaryModelsGet (req, res, next) {
  AttributeDictionary.attributeDictionaryModelsGet()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.attributeDictionaryPost = function attributeDictionaryPost (req, res, next, body) {
  AttributeDictionary.attributeDictionaryPost(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.attributeDictionaryPut = function attributeDictionaryPut (req, res, next, body) {
  AttributeDictionary.attributeDictionaryPut(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

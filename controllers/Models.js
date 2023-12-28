'use strict';

var utils = require('../utils/writer.js');
var Models = require('../service/ModelsService');

module.exports.modelGet = function modelGet (req, res, next, id) {
  Models.modelGet(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.modelsDelete = function modelsDelete (req, res, next) {
  Models.modelsDelete()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.modelsGet = function modelsGet (req, res, next) {
  Models.modelsGet()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.modelsPost = function modelsPost (req, res, next, body) {
  Models.modelsPost(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.modelsPut = function modelsPut (req, res, next, body) {
  Models.modelsPut(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

'use strict';

var utils = require('../utils/writer.js');
var Connections = require('../service/ConnectionsService');

module.exports.connectionDELETE = function connectionDELETE (req, res, next) {
  Connections.connectionDELETE()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.connectionDelete = function connectionDelete (req, res, next, id) {
  Connections.connectionDelete(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.connectionGet = function connectionGet (req, res, next, id) {
  Connections.connectionGet(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.connectionPOST = function connectionPOST (req, res, next, body) {
  Connections.connectionPOST(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.connectionPUT = function connectionPUT (req, res, next, body) {
  Connections.connectionPUT(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.connectionsDeviceGet = function connectionsDeviceGet (req, res, next, id) {
  Connections.connectionsDeviceGet(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.connectionsGet = function connectionsGet (req, res, next) {
  Connections.connectionsGet()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

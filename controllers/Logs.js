'use strict';

var utils = require('../utils/writer.js');
var Logs = require('../service/LogsService');

module.exports.logAllDelete = function logAllDelete (req, res, next) {
  Logs.logAllDelete()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logAttributeDictionaryDelete = function logAttributeDictionaryDelete (req, res, next, id) {
  Logs.logAttributeDictionaryDelete(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logAttributeDictionaryGet = function logAttributeDictionaryGet (req, res, next, id) {
  Logs.logAttributeDictionaryGet(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logAttributesDelete = function logAttributesDelete (req, res, next, id) {
  Logs.logAttributesDelete(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logAttributesGet = function logAttributesGet (req, res, next, id) {
  Logs.logAttributesGet(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logConnectionDelete = function logConnectionDelete (req, res, next, id) {
  Logs.logConnectionDelete(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logConnectionGet = function logConnectionGet (req, res, next, id) {
  Logs.logConnectionGet(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logDeviceDelete = function logDeviceDelete (req, res, next, id) {
  Logs.logDeviceDelete(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logDeviceGet = function logDeviceGet (req, res, next, id) {
  Logs.logDeviceGet(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logPOST = function logPOST (req, res, next, body) {
  Logs.logPOST(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logPUT = function logPUT (req, res, next) {
  Logs.logPUT()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logSingleDelete = function logSingleDelete (req, res, next, id) {
  Logs.logSingleDelete(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logSingleGet = function logSingleGet (req, res, next, id) {
  Logs.logSingleGet(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logsGET = function logsGET (req, res, next) {
  Logs.logsGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

"use strict"


/**
 * Delete log
 * Delete all or specific id log.
 *
 * no response value expected for this operation
 **/
exports.logAllDelete = function () {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Delete attribute-dictionary logs
 * Delete specific attribute-dictionary logs.
 *
 * id UUID ID of logs to fetch
 * no response value expected for this operation
 **/
exports.logAttributeDictionaryDelete = function (id) {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Get attribute-dictionary logs
 * Get specific attribute-dictionary logs.
 *
 * id UUID ID of attribute-dictionary to fetch logs
 * no response value expected for this operation
 **/
exports.logAttributeDictionaryGet = function (id) {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Delete attributes logs
 * Delete specific device logs.
 *
 * id UUID ID of logs to fetch
 * no response value expected for this operation
 **/
exports.logAttributesDelete = function (id) {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Get attributes logs
 * Get specific attribute logs.
 *
 * id UUID ID of attribute to fetch logs
 * no response value expected for this operation
 **/
exports.logAttributesGet = function (id) {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Delete devices logs
 * Delete specific device logs.
 *
 * id UUID ID of logs to fetch
 * no response value expected for this operation
 **/
exports.logConnectionDelete = function (id) {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Get connection logs
 * Get specific connection logs.
 *
 * id UUID ID of connection to fetch logs
 * no response value expected for this operation
 **/
exports.logConnectionGet = function (id) {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Delete devices log
 * Delete specific device log.
 *
 * id UUID ID of pet to fetch
 * no response value expected for this operation
 **/
exports.logDeviceDelete = function (id) {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Get device log
 * Get specific device log.
 *
 * id UUID ID of pet to fetch
 * no response value expected for this operation
 **/
exports.logDeviceGet = function (id) {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Insert new log
 * Create log.
 *
 * body Log
 * returns Log
 **/
exports.logPOST = function (body) {
  return new Promise(function (resolve, reject) {
    const examples = {}
    examples["application/json"] = {
      "_id": "102",
      "date": "2023/06/17 15:37:58.44",
      "object": "dfc93d99-72ca-411e-a4e5-b38d5034b1c5",
      "operation": "Update",
      "component": "Device",
      "message": "Message in log"
    }
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]])
    } else {
      resolve()
    }
  })
}


/**
 * Update new log
 * Update log record.
 *
 * returns Log
 **/
exports.logPUT = function () {
  return new Promise(function (resolve, reject) {
    const examples = {}
    examples["application/json"] = {
      "_id": "102",
      "date": "2023/06/17 15:37:58.44",
      "object": "dfc93d99-72ca-411e-a4e5-b38d5034b1c5",
      "operation": "Update",
      "component": "Device",
      "message": "Message in log"
    }
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]])
    } else {
      resolve()
    }
  })
}


/**
 * Delete single log
 * Delete specific id log.
 *
 * id UUID ID of pet to fetch
 * no response value expected for this operation
 **/
exports.logSingleDelete = function (id) {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Get single log id
 * Get specific id log.
 *
 * id Long ID of pet to fetch
 * no response value expected for this operation
 **/
exports.logSingleGet = function (id) {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Get logs from database
 * Get all logs.
 *
 * returns Logs
 **/
exports.logsGET = function () {
  return new Promise(function (resolve, reject) {
    const examples = {}
    examples["application/json"] = [{
      "_id": "102",
      "date": "2023/06/17 15:37:58.44",
      "object": "dfc93d99-72ca-411e-a4e5-b38d5034b1c5",
      "operation": "Update",
      "component": "Device",
      "message": "Message in log"
    }, {
      "_id": "103",
      "date": "2023/02/27 10:37:58.44",
      "object": "dfc93d99-72ca-411e-a4e5-b38d5034b1c6",
      "operation": "Update",
      "component": "Device",
      "message": "Message in log"
    }, {
      "_id": "104",
      "date": "2022/01/17 11:37:58.44",
      "object": "dfc93d99-72ca-411e-a4e5-b38d5034b1c8",
      "operation": "Update",
      "component": "Device",
      "message": "Message in log"
    }]
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]])
    } else {
      resolve()
    }
  })
}

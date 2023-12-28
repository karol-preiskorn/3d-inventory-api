"use strict"
const { MongoClient } = require("mongodb")
require("dotenv").config()


/**
 * Delete all devices
 * Delete device.
 *
 * no response value expected for this operation
 **/
exports.deviceDELETE = function () {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Delete selected devices
 * Delete one device.
 *
 * id Long ID of pet to fetch
 * no response value expected for this operation
 **/
exports.deviceDeleteOne = function (id) {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}


/**
 * Get all devices
 * List all devices.
 *
 * returns Devices
 **/
exports.deviceGET = function () {
  return new Promise(function (resolve, reject) {

    const examples = {}
    examples["application/json"] = [{
      "_id": "653d6b95a75c2fa12566815c",
      "name": "Device 2 (new2)",
      "position": {
        "x": "4",
        "y": "3",
        "h": "0"
      },
      "modelId": "653e1059d6025afb66017c63"
    }, {
      "_id": "653d6b95a75c2fa12566815c",
      "name": "Device 2 (new2)",
      "position": {
        "x": "4",
        "y": "3",
        "h": "0"
      },
      "modelId": "653e1059d6025afb66017c63"
      }]

    let connection
    let db

    beforeAll(async () => {
      connection = await MongoClient.connect(process.env.URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      db = await connection.db(globalThis.process.env.DBNAME)
    })

    afterAll(async () => {
      await connection.close()
    })

    const devices = db.collection("devices")
    const allDevices = devices.findOne({})

    if (Object.keys(allDevices).length > 0) {
      resolve(allDevices[Object.keys(allDevices)[0]])
    } else {
      resolve()
    }
  })
}


/**
 * Get devices
 * Get one devices.
 *
 * id UUID ID of pet to fetch
 * returns Device
 **/
exports.deviceGetOne = function (id) {
  return new Promise(function (resolve, reject) {
    const examples = {}
    examples["application/json"] = {
      "_id": "653d6b95a75c2fa12566815c",
      "name": "Device 2 (new2)",
      "position": {
        "x": "4",
        "y": "3",
        "h": "0"
      },
      "modelId": "653e1059d6025afb66017c63"
    }
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]])
    } else {
      resolve()
    }
  })
}


/**
 * Create new device
 * Insert new device.
 *
 * body Device  (optional)
 * returns inline_response_200
 **/
exports.devicePOST = function (body) {
  return new Promise(function (resolve, reject) {
    const examples = {}
    examples["application/json"] = {
      "id": "046b6c7f-0b8a-43b9-b35d-6489e6daee91"
    }
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]])
    } else {
      resolve()
    }
  })
}


/**
 * Update device
 * Update existing device.
 *
 * body Device  (optional)
 * returns Device
 **/
exports.devicePUT = function (body) {
  return new Promise(function (resolve, reject) {
    const examples = {}
    examples["application/json"] = {
      "_id": "653d6b95a75c2fa12566815c",
      "name": "Device 2 (new2)",
      "position": {
        "x": "4",
        "y": "3",
        "h": "0"
      },
      "modelId": "653e1059d6025afb66017c63"
    }
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]])
    } else {
      resolve()
    }
  })
}

"use strict"

const utils = require("../utils/writer.js")
const Devices = require("../service/DevicesService")

module.exports.deviceDELETE = function deviceDELETE(req, res, next) {
  Devices.deviceDELETE()
    .then(function (response) {
      utils.writeJson(res, response)
    })
    .catch(function (response) {
      utils.writeJson(res, response)
    })
}

module.exports.deviceDeleteOne = function deviceDeleteOne(req, res, next, id) {
  Devices.deviceDeleteOne(id)
    .then(function (response) {
      utils.writeJson(res, response)
    })
    .catch(function (response) {
      utils.writeJson(res, response)
    })
}

module.exports.deviceGET = function deviceGET(req, res, next) {
  Devices.deviceGET()
    .then(function (response) {
      utils.writeJson(res, response)
    })
    .catch(function (response) {
      utils.writeJson(res, response)
    })
}

module.exports.deviceGetOne = function deviceGetOne(req, res, next, id) {
  Devices.deviceGetOne(id)
    .then(function (response) {
      utils.writeJson(res, response)
    })
    .catch(function (response) {
      utils.writeJson(res, response)
    })
}

module.exports.devicePOST = function devicePOST(req, res, next, body) {
  Devices.devicePOST(body)
    .then(function (response) {
      utils.writeJson(res, response)
    })
    .catch(function (response) {
      utils.writeJson(res, response)
    })
}

module.exports.devicePUT = function devicePUT(req, res, next, body) {
  Devices.devicePUT(body)
    .then(function (response) {
      utils.writeJson(res, response)
    })
    .catch(function (response) {
      utils.writeJson(res, response)
    })
}

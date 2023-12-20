"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.userSchema = exports.logSchema = exports.floorSchema = exports.floorDimensionSchema = exports.floorAdressSchema = exports.deviceSchema = exports.devicePositionSchema = exports.attributeDictionarySchema = void 0
exports.attributeDictionarySchema = {
    name: "attribute-dictionary",
    properties: {
        _id: "objectId",
        category: "string",
        component: "string",
        name: "string?",
        type: "string?",
    },
    primaryKey: "_id",
}
exports.devicePositionSchema = {
    name: "device_position",
    embedded: true,
    properties: {
        h: "string?",
        x: "string?",
        y: "string?",
    },
}
exports.deviceSchema = {
    name: "device",
    properties: {
        _id: "objectId?",
        modelId: "objectId?",
        name: "string?",
        position: "device_position",
    },
    primaryKey: "_id",
}
exports.floorAdressSchema = {
    name: "floor_adress",
    embedded: true,
    properties: {
        city: "string?",
        country: "string?",
        postcode: "string?",
        street: "string?",
    },
}
exports.floorDimensionSchema = {
    name: "floorDimension",
    embedded: true,
    properties: {
        description: "string?",
        h: "string?",
        h_pos: "string?",
        x: "string?",
        x_pos: "string?",
        y: "string?",
        y_pos: "string?",
    },
}
exports.floorSchema = {
    name: "floor",
    properties: {
        _id: "objectId",
        adress: "floor_adress",
        dimension: "floorDimension[]",
        name: "string",
    },
    primaryKey: "_id",
}
exports.logSchema = {
    name: "log",
    properties: {
        _id: "objectId",
        component: "string?",
        date: "string",
        message: "string?",
        object: "string?",
        operation: "string?",
    },
    primaryKey: "_id",
}
exports.userSchema = {
    name: "user",
    properties: {
        _id: "objectId",
        email: "string?",
        name: "string?",
        password: "string?",
        rights: "string[]",
        token: "string?",
    },
    primaryKey: "_id",
}
exports.default = { userSchema: exports.userSchema }

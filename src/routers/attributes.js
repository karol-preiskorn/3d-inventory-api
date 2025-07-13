"use strict";
/**
 * @file /routers/logs copy.js
 * @description attributes.js, is a module that sets up routes for a server using the Express.js framework. It's designed to interact with a MongoDB database, specifically with a collection named 'attributes'.
 * @module routers
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mongodb_1 = require("mongodb");
var db_1 = require("../utils/db");
var collectionName = 'attributes';
var router = express_1.default.Router();
router.get('/', (function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, results, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, 4, 7]);
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.find({}).limit(100).toArray()];
            case 2:
                results = _a.sent();
                if (!results) {
                    res.status(404).send('Not found any attributes');
                }
                else {
                    res.status(200).json(results);
                }
                return [3 /*break*/, 7];
            case 3:
                error_1 = _a.sent();
                console.error('Error fetching attributes:', error_1);
                res.status(500).send('Internal server error while fetching attributes');
                return [3 /*break*/, 7];
            case 4:
                if (!client) return [3 /*break*/, 6];
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); }));
router.get('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, client, db, collection, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                if (!mongodb_1.ObjectId.isValid(id)) {
                    return [2 /*return*/, res.sendStatus(400)];
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.findOne({ _id: new mongodb_1.ObjectId(id) })];
            case 3:
                result = _a.sent();
                if (!result) {
                    res.sendStatus(404);
                }
                else {
                    res.status(200).json(result);
                }
                return [3 /*break*/, 7];
            case 4:
                error_2 = _a.sent();
                res.status(500).send('Internal server error' + (error_2 instanceof Error ? error_2.message : String(error_2)));
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); }));
router.get('/model/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, query, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.sendStatus(404);
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                query = { modelId: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, collection.find(query).toArray()];
            case 2:
                result = _a.sent();
                if (!result) {
                    res.sendStatus(404);
                }
                else {
                    res.status(200).json(result);
                }
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.get('/device/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, query, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.sendStatus(404);
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                query = { deviceId: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, collection.find(query).toArray()];
            case 2:
                result = _a.sent();
                if (!result) {
                    res.sendStatus(404);
                }
                else {
                    res.status(200).json(result);
                }
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.get('/connection/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, query, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.sendStatus(404);
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                query = { connectionId: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, collection.find(query).toArray()];
            case 2:
                result = _a.sent();
                if (!result) {
                    res.sendStatus(404);
                }
                else {
                    res.status(200).json(result);
                }
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.put('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, updateBody, updates, query, client, db, collection, result, error_3, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                if (!mongodb_1.ObjectId.isValid(id)) {
                    return [2 /*return*/, res.status(400).send('Invalid attribute ID')];
                }
                updateBody = __assign({}, req.body);
                if ('_id' in updateBody) {
                    delete updateBody._id;
                }
                updates = {
                    $set: {
                        attributeDictionaryId: req.body.attributeDictionaryId || null,
                        connectionId: req.body.connectionId || null,
                        deviceId: req.body.deviceId || null,
                        modelId: req.body.modelId || null,
                        value: req.body.value
                    }
                };
                query = { _id: new mongodb_1.ObjectId(id) };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, 5, 8]);
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 2:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.updateOne(query, updates)];
            case 3:
                result = _a.sent();
                if (result.matchedCount === 0) {
                    return [2 /*return*/, res.status(404).send("Attribute ".concat(id, " not found"))];
                }
                res.status(200).json({ updatedCount: result.modifiedCount });
                return [3 /*break*/, 8];
            case 4:
                error_3 = _a.sent();
                console.error('Error updating attribute:', error_3);
                errorMessage = error_3 instanceof Error ? error_3.message : String(error_3);
                res.status(500).send('Internal server error during update attributes: ' + errorMessage);
                return [3 /*break*/, 8];
            case 5:
                if (!client) return [3 /*break*/, 7];
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7: return [7 /*endfinally*/];
            case 8: return [2 /*return*/];
        }
    });
}); }));
router.post('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    // Helper to validate and convert ObjectId fields
    function toObjectIdOrNull(id) {
        return typeof id === 'string' && mongodb_1.ObjectId.isValid(id) ? new mongodb_1.ObjectId(id) : null;
    }
    var client, db, collection, _a, attributeDictionaryId, connectionId, deviceId, modelId, value, newAttribute, result, createdAttribute, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, 4, 7]);
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _b.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                _a = req.body, attributeDictionaryId = _a.attributeDictionaryId, connectionId = _a.connectionId, deviceId = _a.deviceId, modelId = _a.modelId, value = _a.value;
                if (!value ||
                    typeof value !== 'string' ||
                    !attributeDictionaryId ||
                    typeof attributeDictionaryId !== 'string' ||
                    (!connectionId && !deviceId && !modelId)) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ error: 'Missing or invalid "value", "attributeDictionaryId", or at least one of "connectionId", "deviceId", "modelId" must be provided' })];
                }
                if (!mongodb_1.ObjectId.isValid(attributeDictionaryId)) {
                    return [2 /*return*/, res.status(400).json({ error: '"attributeDictionaryId" must be a valid ObjectId string' })];
                }
                newAttribute = {
                    attributeDictionaryId: new mongodb_1.ObjectId(attributeDictionaryId),
                    connectionId: toObjectIdOrNull(connectionId),
                    deviceId: toObjectIdOrNull(deviceId),
                    modelId: toObjectIdOrNull(modelId),
                    value: value
                };
                return [4 /*yield*/, collection.insertOne(newAttribute)];
            case 2:
                result = _b.sent();
                createdAttribute = __assign({ _id: result.insertedId }, newAttribute);
                if (result.acknowledged) {
                    res.status(201).json(createdAttribute);
                }
                else {
                    res.status(500).send('Failed to create attribute');
                }
                return [3 /*break*/, 7];
            case 3:
                error_4 = _b.sent();
                console.error('Error creating attribute:', error_4);
                res.status(500).send('Internal server error during attribute creation');
                return [3 /*break*/, 7];
            case 4:
                if (!client) return [3 /*break*/, 6];
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6: return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); }));
router.delete('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.sendStatus(404);
                }
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteOne(query)];
            case 2:
                result = _a.sent();
                if (!result) {
                    res.status(404).send('Not found models to delete');
                }
                else {
                    res.status(200).json(result);
                }
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.delete('/', (function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = {};
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteMany(query)];
            case 2:
                result = _a.sent();
                if (!result) {
                    res.status(404).send('Not found models to delete');
                }
                else {
                    res.status(200).json(result);
                }
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.delete('/model/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.sendStatus(404);
                }
                query = { modelId: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteMany(query)];
            case 2:
                result = _a.sent();
                if (!result) {
                    res.status(404).send('Not found models to delete');
                }
                else {
                    res.status(200).json(result);
                }
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
exports.default = router;

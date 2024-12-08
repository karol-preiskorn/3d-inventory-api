"use strict";
/**
 * @file: devices.ts
 * @description: Routers for devices CRUD operations.
 * @module: routers
 * @public
 */
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
require("../utils/loadEnvironment");
var express_1 = require("express");
var mongodb_1 = require("mongodb");
var dbUtils_js_1 = require("../db/dbUtils.js");
var logs_js_1 = require("../services/logs.js");
var logger_js_1 = require("../utils/logger.js");
var router = express_1.default.Router();
var collectionName = 'devices';
/**
 * Get Devise array from database.
 * @function GET /devices
 * @returns {Promise<object[]>} A promise that resolves to an array of objects.
 * @throws {Error}
 */
router.get('/', (function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, dbUtils_js_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, dbUtils_js_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.find({}).limit(10).toArray()];
            case 2:
                results = _a.sent();
                if (!results) {
                    logger_js_1.logger.warn('GET /devices - not found');
                    res.status(404).send('Not found');
                }
                else {
                    logger_js_1.logger.info("GET /devices - oki return ".concat(results.length, " devices ").concat(JSON.stringify(results)));
                    res.status(200).json(results);
                }
                return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.get('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, query, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    logger_js_1.logger.error("GET /devices/".concat(req.params.id, " - wrong id"));
                    res.sendStatus(500);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, dbUtils_js_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, dbUtils_js_1.connectToDb)(client);
                collection = db.collection(collectionName) // Replace with your actual collection name
                ;
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, collection.findOne(query)];
            case 2:
                result = _a.sent();
                if (!result) {
                    logger_js_1.logger.warn("GET /devices/".concat(req.params.id, " - not found device"));
                    res.status(404).send('Not found');
                }
                else {
                    logger_js_1.logger.info("GET /devices/".concat(req.params.id, " - oki, device: ").concat(JSON.stringify(result)));
                    res.status(200).json(result);
                }
                return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.put('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, updates, client, db, collection, result, error_1, errorMessage, updatedDevice;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    logger_js_1.logger.error("PUT /devices/".concat(req.params.id, " - wrong id"));
                    res.sendStatus(404);
                    return [2 /*return*/];
                }
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                updates = {
                    $set: {
                        name: req.body.name,
                        modelId: req.body.modelId,
                        position: req.body.position,
                        attributes: req.body.attributes,
                    },
                };
                return [4 /*yield*/, (0, dbUtils_js_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, dbUtils_js_1.connectToDb)(client);
                collection = db.collection(collectionName);
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, collection.updateOne(query, updates)];
            case 3:
                result = _a.sent();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error';
                logger_js_1.logger.error("PUT /devices/".concat(req.params.id, " - error updating device: ").concat(errorMessage));
                res.status(500).send('Internal Server Error');
                return [2 /*return*/];
            case 5:
                if (!(result.modifiedCount === 0)) return [3 /*break*/, 6];
                logger_js_1.logger.error("PUT /devices/".concat(req.params.id, " - not found devices to update"));
                res.status(404).send('Not found devices to update');
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, collection.findOne(query)];
            case 7:
                updatedDevice = _a.sent();
                logger_js_1.logger.info("PUT /devices/".concat(req.params.id, " - oki updated ").concat(result.modifiedCount, " devices"));
                res.status(200).json(updatedDevice);
                _a.label = 8;
            case 8: return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 9:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.get('/model/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, query, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    logger_js_1.logger.error("GET /devices/model/".concat(req.params.id, " - wrong id"));
                    res.sendStatus(500);
                }
                return [4 /*yield*/, (0, dbUtils_js_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, dbUtils_js_1.connectToDb)(client);
                collection = db.collection(collectionName);
                query = { modelId: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, collection.findOne(query)];
            case 2:
                result = _a.sent();
                if (!result)
                    res.status(404).end();
                else
                    res.status(200).json(result);
                return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.post('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, resultLog, collection, newDocument, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, dbUtils_js_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, dbUtils_js_1.connectToDb)(client);
                resultLog = {};
                collection = db.collection(collectionName);
                newDocument = req.body;
                newDocument.date = new Date();
                return [4 /*yield*/, collection.insertOne(newDocument)];
            case 2:
                result = _a.sent();
                if (!!(result === null || result === void 0 ? void 0 : result.insertedId)) return [3 /*break*/, 4];
                logger_js_1.logger.error('POST /devices - Device not created with id:', JSON.stringify(newDocument));
                return [4 /*yield*/, (0, logs_js_1.CreateLog)('', newDocument, 'Create', 'Device')];
            case 3:
                _a.sent();
                res.status(500).send('POST /devices - Device not created');
                return [3 /*break*/, 6];
            case 4:
                logger_js_1.logger.info("POST /devices - device created successfully with id: ".concat(result.insertedId.toString(), ", ").concat(JSON.stringify(newDocument)));
                return [4 /*yield*/, (0, logs_js_1.CreateLog)(result.insertedId.toString(), newDocument, 'Create', 'Device')];
            case 5:
                resultLog = _a.sent();
                res.status(200).json(resultLog);
                _a.label = 6;
            case 6: return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 7:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.patch('/position/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, updates, client, db, collection, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    logger_js_1.logger.error("PATCH /devices/position/".concat(req.params.id, " - wrong id"));
                    res.sendStatus(404);
                }
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                updates = [
                    {
                        $push: { position: req.body },
                    },
                ];
                return [4 /*yield*/, (0, dbUtils_js_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, dbUtils_js_1.connectToDb)(client);
                collection = db.collection(collectionName);
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 6]);
                return [4 /*yield*/, collection.updateOne(query, updates)];
            case 3:
                result = _a.sent();
                return [3 /*break*/, 6];
            case 4:
                error_2 = _a.sent();
                logger_js_1.logger.error("PATCH /devices/position/".concat(req.params.id, " - error updating position: ").concat(error_2.message));
                res.status(500).send('Internal Server Error');
                return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 5:
                _a.sent();
                return [2 /*return*/];
            case 6:
                if (!result || result.modifiedCount === 0) {
                    logger_js_1.logger.error("PATCH /devices/position/".concat(req.params.id, " - no position updated"));
                    res.status(404).send('No position updated');
                }
                else {
                    logger_js_1.logger.info("PATCH /devices/position/".concat(req.params.id, " - position updated successfully"));
                    res.status(200).json(result);
                }
                return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 7:
                _a.sent();
                return [2 /*return*/];
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
                return [4 /*yield*/, (0, dbUtils_js_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, dbUtils_js_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteOne(query)];
            case 2:
                result = _a.sent();
                if (!result) {
                    logger_js_1.logger.error("POST /devices/".concat(req.params.id, " - Device not created"));
                    res.status(500).json({ error: "POST /devices/".concat(req.params.id, " - Device not created") });
                }
                else {
                    logger_js_1.logger.info("POST /devices/".concat(req.params.id, " - device created successfully."));
                    res.status(200).json(result);
                }
                return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.delete('/', (function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result, sanitizedResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = {};
                return [4 /*yield*/, (0, dbUtils_js_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, dbUtils_js_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteMany(query)];
            case 2:
                result = _a.sent();
                sanitizedResult = result;
                res.status(200).json(sanitizedResult);
                return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
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
                return [4 /*yield*/, (0, dbUtils_js_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, dbUtils_js_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteMany(query)];
            case 2:
                result = _a.sent();
                res.status(200).json(result);
                return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
exports.default = router;

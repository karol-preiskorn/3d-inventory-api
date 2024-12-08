"use strict";
/**
 * @file /routers/attributesDictionary.js
 * @module routers
 * @description attributesDictionary router
 **/
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
var logger_js_1 = require("../utils/logger.js");
var collectionName = 'attributesDictionary';
var router = express_1.default.Router();
router.get('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
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
                    res.status(404).send('Not found');
                }
                else {
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
                    res.sendStatus(404);
                }
                return [4 /*yield*/, (0, dbUtils_js_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, dbUtils_js_1.connectToDb)(client);
                collection = db.collection(collectionName);
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, collection.findOne(query)];
            case 2:
                result = _a.sent();
                if (!result) {
                    res.status(404).json({ message: 'Not found' });
                }
                else
                    res.status(200).json(result);
                return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 3:
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
                    res.sendStatus(404);
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
                    res.status(404).json({ message: 'Not found' });
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
    var client, db, collection, newDocument, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, dbUtils_js_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, dbUtils_js_1.connectToDb)(client);
                collection = db.collection(collectionName);
                newDocument = req.body;
                return [4 /*yield*/, collection.insertOne(newDocument)];
            case 2:
                results = _a.sent();
                res.status(201).json({ _id: results.insertedId });
                return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.put('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filter, updates, client, db, collection, result, error_1, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    logger_js_1.logger.error("PUT /".concat(collectionName, "/").concat(req.params.id, " - wrong _id"));
                    res.sendStatus(400);
                    return [2 /*return*/];
                }
                filter = { _id: new mongodb_1.ObjectId(req.params.id) };
                updates = {
                    $set: {
                        component: req.body.component,
                        type: req.body.type,
                        name: req.body.name,
                        units: req.body.units,
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
                return [4 /*yield*/, collection.updateOne(filter, updates)];
            case 3:
                result = _a.sent();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error';
                logger_js_1.logger.error("PUT /".concat(collectionName, "/").concat(req.params.id, " - query: ").concat(JSON.stringify(filter), ", body: ").concat(JSON.stringify(req.body), " - error updating: ").concat(errorMessage));
                res.status(500).send('Internal Server Error');
                return [2 /*return*/];
            case 5:
                if (result.modifiedCount === 0) {
                    logger_js_1.logger.warn("PUT /".concat(collectionName, "/").concat(req.params.id, " - query: ").concat(JSON.stringify(filter), " not found _id to update. Result ").concat(JSON.stringify(result)));
                    res.status(404).json({ message: "Not found ".concat(JSON.stringify(filter), " in ").concat(collectionName, " to update. Result ").concat(JSON.stringify(result), ".") });
                }
                else {
                    logger_js_1.logger.info("PUT /".concat(collectionName, "/").concat(req.params.id, " - oki updated result: ").concat(JSON.stringify(result), "."));
                    res.status(200).json(result);
                }
                return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 6:
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
                res.status(200).json(result);
                return [4 /*yield*/, (0, dbUtils_js_1.connectionClose)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.delete('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result;
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
                res.status(200).json(result);
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

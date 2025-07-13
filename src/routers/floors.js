"use strict";
/**
 * @file /routers/floors.js
 * @module routers
 * @description floors router
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
var sanitize_html_1 = require("sanitize-html");
var db_1 = require("../utils/db");
var collectionName = 'floors';
var router = express_1.default.Router();
router.get('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, results, sanitizedResults;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.find({}).limit(10).toArray()];
            case 2:
                results = _a.sent();
                if (!results)
                    res.status(404).send('Not found');
                else {
                    sanitizedResults = results.map(function (result) {
                        var floor = result;
                        return __assign(__assign({}, floor), { name: (0, sanitize_html_1.default)(floor.name), address: __assign(__assign({}, floor.address), { street: (0, sanitize_html_1.default)(floor.address.street), city: (0, sanitize_html_1.default)(floor.address.city), country: (0, sanitize_html_1.default)(floor.address.country), postcode: (0, sanitize_html_1.default)(floor.address.postcode) }), dimension: floor.dimension.map(function (dim) { return (__assign(__assign({}, dim), { description: (0, sanitize_html_1.default)(dim.description) })); }) });
                    });
                    res.status(200).json(sanitizedResults);
                }
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
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
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, collection.findOne(query)];
            case 2:
                result = _a.sent();
                if (!result)
                    res.status(404).json({ message: 'Not found' });
                else
                    res.status(200).json(result);
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.get('/model/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, sanitizedModelId, query, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.sendStatus(404);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                sanitizedModelId = (0, sanitize_html_1.default)(req.params.id);
                query = { modelId: new mongodb_1.ObjectId(sanitizedModelId) };
                return [4 /*yield*/, collection.findOne(query)];
            case 2:
                result = _a.sent();
                if (!result)
                    res.status(404).json({ message: 'Not found' });
                else
                    res.status(200).json(result);
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.post('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, address, dimension, sanitizedDocument, client, db, collection, result, insertedDocument, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, address = _a.address, dimension = _a.dimension;
                if (typeof name !== 'string' ||
                    !address ||
                    typeof address.street !== 'string' ||
                    typeof address.city !== 'string' ||
                    typeof address.country !== 'string' ||
                    typeof address.postcode !== 'string' ||
                    !Array.isArray(dimension) ||
                    !dimension.every(function (dim) {
                        return typeof dim.description === 'string' &&
                            typeof dim.x === 'number' &&
                            typeof dim.y === 'number' &&
                            typeof dim.h === 'number' &&
                            typeof dim.xPos === 'number' &&
                            typeof dim.yPos === 'number' &&
                            typeof dim.hPos === 'number';
                    })) {
                    console.error({ message: 'Invalid input data' });
                }
                sanitizedDocument = {
                    name: (0, sanitize_html_1.default)(name),
                    address: {
                        street: (0, sanitize_html_1.default)(address.street),
                        city: (0, sanitize_html_1.default)(address.city),
                        country: (0, sanitize_html_1.default)(address.country),
                        postcode: (0, sanitize_html_1.default)(address.postcode)
                    },
                    dimension: dimension.map(function (dim) { return ({
                        description: (0, sanitize_html_1.default)(dim.description),
                        x: dim.x,
                        y: dim.y,
                        h: dim.h,
                        xPos: dim.xPos,
                        yPos: dim.yPos,
                        hPos: dim.hPos
                    }); })
                };
                client = null;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, 5, 8]);
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 2:
                client = _b.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.insertOne(sanitizedDocument)];
            case 3:
                result = _b.sent();
                if (!result.acknowledged) {
                    res.status(500).json({ message: 'Failed to insert document' });
                    return [2 /*return*/];
                }
                insertedDocument = __assign({ _id: result.insertedId }, sanitizedDocument);
                console.log("Inserted document with ID: ".concat(result.insertedId));
                console.log("Inserted document: ".concat(JSON.stringify(insertedDocument)));
                res.status(201).json(insertedDocument);
                return [3 /*break*/, 8];
            case 4:
                error_1 = _b.sent();
                res.status(500).json({ message: 'Error inserting document', error: error_1.message });
                return [3 /*break*/, 8];
            case 5:
                if (!client) return [3 /*break*/, 7];
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7: return [7 /*endfinally*/];
            case 8: return [2 /*return*/];
        }
    });
}); }));
router.put('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, sanitizedDocument, updates, client, db, collection, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.sendStatus(404);
                    return [2 /*return*/];
                }
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                sanitizedDocument = {
                    name: (0, sanitize_html_1.default)(req.body.name),
                    address: {
                        street: (0, sanitize_html_1.default)(req.body.address.street),
                        city: (0, sanitize_html_1.default)(req.body.address.city),
                        country: (0, sanitize_html_1.default)(req.body.address.country),
                        postcode: (0, sanitize_html_1.default)(req.body.address.postcode)
                    },
                    dimension: req.body.dimension.map(function (dim) { return ({
                        description: (0, sanitize_html_1.default)(dim.description),
                        x: dim.x,
                        y: dim.y,
                        h: dim.h,
                        xPos: dim.xPos,
                        yPos: dim.yPos,
                        hPos: dim.hPos
                    }); })
                };
                updates = [{ $set: sanitizedDocument }];
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.updateOne(query, updates)];
            case 3:
                result = _a.sent();
                if (result.modifiedCount === 0) {
                    res.status(404).json({ message: 'Document not found or no changes made' });
                }
                else {
                    res.status(200).json({ message: 'Document updated successfully', result: result });
                }
                return [3 /*break*/, 7];
            case 4:
                error_2 = _a.sent();
                res.status(500).json({ message: 'Error updating document', error: error_2.message });
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); }));
router.patch('/dimension/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, updates, client, db, collection, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.sendStatus(404);
                    return [2 /*return*/];
                }
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                updates = [{ $push: { dimension: req.body } }];
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, , 4, 6]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.updateOne(query, updates)];
            case 3:
                result = _a.sent();
                res.status(200).json(result);
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 5:
                _a.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); }));
router.delete('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Validate the provided ID to ensure it is a valid ObjectId
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.sendStatus(404); // Respond with 404 if the ID is invalid
                    return [2 /*return*/];
                }
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteOne(query)
                    // Check if a document was deleted and respond accordingly
                ];
            case 2:
                result = _a.sent();
                // Check if a document was deleted and respond accordingly
                if (result.deletedCount === 0) {
                    res.status(404).json({ message: 'Document not found' }); // No document found to delete
                }
                else {
                    res.status(200).json(result); // Successfully deleted the document
                }
                // Close the database connection
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                // Close the database connection
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.delete('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, client_1, db, collection, result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (req.query.confirm !== 'true') {
                    res.status(400).json({ message: 'Confirmation required. Add ?confirm=true to proceed.' });
                    return [2 /*return*/];
                }
                client = null;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, 5, 8]);
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 2:
                client_1 = _a.sent();
                db = (0, db_1.connectToDb)(client_1);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteMany({})];
            case 3:
                result = _a.sent();
                res.status(200).json(result);
                return [3 /*break*/, 8];
            case 4:
                error_3 = _a.sent();
                res.status(500).json({ message: 'Error deleting documents', error: error_3.message });
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
                res.status(200).json(result);
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
exports.default = router;

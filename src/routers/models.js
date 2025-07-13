"use strict";
/**
 * @description This file contains the router for handling model-related API endpoints. It defines GET, PUT, POST, PATCH, and DELETE routes for interacting with models in the database.
 * @module routers
 * @version 2023-12-29  C2RLO - Initial
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
var express_1 = require("express");
var mongodb_1 = require("mongodb");
var db_1 = require("../utils/db");
var logger_1 = require("../utils/logger");
var logger = (0, logger_1.default)('models');
var collectionName = 'models';
var router = express_1.default.Router();
router.get('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, error_1, db, collection, results, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                logger.error('Error connecting to the database:', error_1);
                res.status(500).send('Internal Server Error');
                return [2 /*return*/];
            case 3:
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.find({}).limit(100).toArray()];
            case 4:
                results = _a.sent();
                if (!results) {
                    logger.warn('GET /models - not found');
                    res.status(404).send('Not found');
                }
                else {
                    logger.info('GET /models - oki return ' + results.length + ' models');
                    res.status(200).json(results);
                }
                if (!client) return [3 /*break*/, 8];
                _a.label = 5;
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                error_2 = _a.sent();
                logger.error('Error closing the database connection:', error_2);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); }));
/**
 * @description Retrieves a model from the database by its ID.
 * @param {string} id - The ID of the model to retrieve.
 * @returns {object} - The retrieved model object.
 * @throws {Error} - If the ID is invalid or if the model is not found.
 *
 * @risk This route will expose sensitive information about a specific model in the database.
 * Ensure that this operation is only performed in a controlled environment, such as during development or testing.
 * In production, this route should be used with caution to prevent unauthorized access to sensitive data.
 */
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
                    res.status(404).end();
                else
                    res.status(200).json(result);
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
/**
 * @description Updates a model in the database by its ID.
 * @param {string} id - The ID of the model to update.
 * @param {Model} model - The updated model data.
 * @returns {object} - The result of the update operation.
 * @throws {Error} - If the ID is invalid or if the update fails.
 *
 * @risk This route will modify an existing model in the database.
 * Ensure that this operation is only performed in a controlled environment, such as during development or testing.
 * In production, this route should be used with caution to prevent accidental data loss.
 */
router.put('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, b, updates, client, db, collection, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.status(404).send('Not correct id');
                }
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                console.log('models.router.put: ' + JSON.stringify(req.body));
                b = req.body;
                updates = {
                    $set: {
                        name: b.name,
                        dimension: {
                            width: b.dimension.width,
                            height: b.dimension.height,
                            depth: b.dimension.depth
                        },
                        texture: {
                            front: b.texture.front,
                            back: b.texture.back,
                            side: b.texture.side,
                            top: b.texture.top,
                            bottom: b.texture.bottom
                        }
                    }
                };
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.updateOne(query, updates)];
            case 2:
                result = _a.sent();
                if (!result)
                    res.status(404).send('Not found models to update');
                res.status(200).json(result);
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
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
            case 0: return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                newDocument = req.body;
                return [4 /*yield*/, collection.insertOne(newDocument)];
            case 2:
                results = _a.sent();
                res.status(200).json(results);
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
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
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.updateOne(query, updates)];
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
/**
 * @description Updates the texture of a model in the database.
 * @param {string} id - The ID of the model to update.
 * @param {Texture} texture - The new texture data to set.
 * @returns {object} - The result of the update operation.
 * @throws {Error} - If the ID is invalid or if the update fails.
 *
 * @risk This route will modify the texture of a model in the database.
 * Ensure that this operation is only performed in a controlled environment, such as during development or testing.
 * In production, this route should be used with caution to prevent accidental data loss.
 */
router.patch('/texture/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, updates, client, db, collection, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.sendStatus(404);
                }
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                updates = [{ $push: { texture: req.body } }];
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.updateOne(query, updates)];
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
/**
 * @description Deletes a document from the 'models' collection by its ID.
 * @param {string} id - The ID of the document to delete.
 * @returns {object} - The result of the deletion operation.
 * @throws {Error} - If the ID is invalid or if the deletion fails.
 *
 * @risk This route will permanently delete a document from the 'models' collection.
 * Ensure that this operation is only performed in a controlled environment, such as during development or testing.
 * In production, this route should be used with caution to prevent accidental data loss.
 */
router.delete('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, query, result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    logger.warn("DELETE /models/:id - Invalid ID: ".concat(req.params.id));
                    res.sendStatus(404);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                _a.label = 2;
            case 2:
                _a.trys.push([2, , 4, 9]);
                return [4 /*yield*/, collection.deleteOne(query)];
            case 3:
                result = _a.sent();
                if (!result) {
                    res.status(500).send('Failed to delete the document');
                }
                else if (result.deletedCount === 0) {
                    res.status(404).send('No document found to delete');
                }
                else {
                    logger.info("DELETE /models/:id - oki deleted model with ID: ".concat(req.params.id));
                    res.status(200).json(result);
                }
                return [3 /*break*/, 9];
            case 4:
                if (!client) return [3 /*break*/, 8];
                _a.label = 5;
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                error_3 = _a.sent();
                logger.error('Error closing the database connection:', error_3);
                return [3 /*break*/, 8];
            case 8: return [7 /*endfinally*/];
            case 9: return [2 /*return*/];
        }
    });
}); }));
/**
 * @description Deletes all documents in the 'models' collection.
 * @warning This operation is irreversible and will remove all data from the collection.
 * Use with caution, especially in production environments.
 *
 * @risk This route will permanently delete all documents in the 'models' collection.
 * Ensure that this operation is only performed in a controlled environment, such as during development or testing.
 * In production, this route is forbidden to prevent accidental data loss.
 * Always double-check the confirmation query parameter before proceeding.
 */
router.delete('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.NODE_ENV === 'production') {
                    logger.warn('DELETE /models - Attempt to delete all documents in production environment');
                    res.status(403).send('Forbidden in production environment');
                    return [2 /*return*/];
                }
                if (req.query.confirm !== 'true') {
                    logger.warn('DELETE /models - Missing confirmation query parameter');
                    res.status(400).send('Confirmation query parameter "confirm=true" is required');
                    return [2 /*return*/];
                }
                query = {};
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName) // TypeScript infers the type automatically
                ;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                return [4 /*yield*/, collection.deleteMany(query)];
            case 3:
                result = _a.sent();
                res.status(200).json(result);
                return [3 /*break*/, 7];
            case 4:
                error_4 = _a.sent();
                logger.error('DELETE /models - Error deleting documents:', error_4);
                res.status(500).send('Internal Server Error');
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); }));
exports.default = router;

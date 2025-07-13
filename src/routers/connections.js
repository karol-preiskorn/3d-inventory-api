"use strict";
/**
 * @file /routers/connections.js
 * @module routers
 * @description connections router for the API
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
var express_1 = require("express");
var mongo_sanitize_1 = require("mongo-sanitize");
var mongodb_1 = require("mongodb");
var db_1 = require("../utils/db");
var collectionName = 'connections';
var router = express_1.default.Router();
/**
 * @route GET /connections
 * @description Retrieve a list of all connections.
 * @query {number} [limit] - Optional. Limits the number of returned connections (default: 256, max: 1000).
 * @returns {200} Array of Connection objects on success.
 * @returns {404} If no connections are found.
 * @returns {500} On server error.
 */
router.get('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var DEFAULT_LIMIT, MAX_LIMIT, limit, parsed, client, db, collection, results, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                DEFAULT_LIMIT = 256;
                MAX_LIMIT = 1000;
                limit = DEFAULT_LIMIT;
                if (req.query.limit) {
                    parsed = parseInt(req.query.limit, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                        limit = Math.min(parsed, MAX_LIMIT);
                    }
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, , 4, 8]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.find({}).limit(limit).toArray()];
            case 3:
                results = _a.sent();
                res.set('Content-Type', 'application/json; charset=utf-8');
                if (!results)
                    res.status(404).send('Not found any connection');
                else
                    res.status(200).send(JSON.stringify(results));
                return [3 /*break*/, 8];
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                err_1 = _a.sent();
                return [3 /*break*/, 7];
            case 7: return [7 /*endfinally*/];
            case 8: return [2 /*return*/];
        }
    });
}); }));
/**
 * @route GET /connections/:id
 * @description Get a connection by its ObjectId.
 * @param {string} id - ObjectId string of the connection to retrieve.
 * @returns {200} {Connection} on success.
 * @returns {404} { error: string } if the connection is not found.
 * @returns {500} { error: string } on server error.
 */
router.get('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, connection;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.status(404).json({ error: 'Not found' });
                    return [2 /*return*/];
                }
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, , 4, 6]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.findOne(query)];
            case 3:
                connection = _a.sent();
                if (!connection) {
                    res.status(404).json({ error: 'Not found' });
                    return [2 /*return*/];
                }
                else {
                    res.status(200).json(connection);
                    return [2 /*return*/];
                }
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 5:
                _a.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); }));
router.put('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, _a, name, deviceIdFrom, deviceIdTo, sanitizedName, sanitizedDeviceIdFrom, sanitizedDeviceIdTo, updates, client, db, collection, result, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.status(404).json({ error: 'Not found' });
                    return [2 /*return*/];
                }
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                _a = req.body, name = _a.name, deviceIdFrom = _a.deviceIdFrom, deviceIdTo = _a.deviceIdTo;
                sanitizedName = (0, mongo_sanitize_1.default)(name);
                sanitizedDeviceIdFrom = (0, mongo_sanitize_1.default)(deviceIdFrom);
                sanitizedDeviceIdTo = (0, mongo_sanitize_1.default)(deviceIdTo);
                if (typeof sanitizedName !== 'string' ||
                    typeof sanitizedDeviceIdFrom !== 'string' ||
                    typeof sanitizedDeviceIdTo !== 'string' ||
                    !mongodb_1.ObjectId.isValid(sanitizedDeviceIdFrom) ||
                    !mongodb_1.ObjectId.isValid(sanitizedDeviceIdTo)) {
                    res.status(400).json({ error: 'Invalid input data: name must be a string, deviceIdFrom and deviceIdTo must be valid ObjectId strings.' });
                    return [2 /*return*/];
                }
                updates = {
                    $set: {
                        name: sanitizedName,
                        deviceIdFrom: new mongodb_1.ObjectId(sanitizedDeviceIdFrom),
                        deviceIdTo: new mongodb_1.ObjectId(sanitizedDeviceIdTo),
                    },
                };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, 5, 8]);
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 2:
                client = _b.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.updateOne(query, updates)];
            case 3:
                result = _b.sent();
                if (result.matchedCount === 0) {
                    res.status(404).json({ error: 'Not found' });
                }
                else {
                    res.status(200).json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
                }
                return [3 /*break*/, 8];
            case 4:
                err_2 = _b.sent();
                res.status(500).json({ error: 'Internal server error' });
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
router.get('/from/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, query, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.status(404).json({ error: 'Not found' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                query = { deviceIdFrom: new mongodb_1.ObjectId(req.params.id) };
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
router.get('/to/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, query, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.status(404).json({ error: 'Not found' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                query = { deviceIdTo: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, collection.findOne(query)];
            case 2:
                result = _a.sent();
                if (!result)
                    res.status(404).json({ error: 'Not found' });
                else
                    res.status(200).json(result);
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
// Add a route for getting a connection by deviceIdFrom and deviceIdTo
router.get('/from/:idFrom/to/:idTo', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, query, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.idFrom) || !mongodb_1.ObjectId.isValid(req.params.idTo)) {
                    res.status(404).json({ error: 'Not found' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                query = {
                    deviceIdFrom: new mongodb_1.ObjectId(req.params.idFrom),
                    deviceIdTo: new mongodb_1.ObjectId(req.params.idTo),
                };
                return [4 /*yield*/, collection.findOne(query)];
            case 2:
                result = _a.sent();
                if (!result)
                    res.status(404).json({ error: 'Not found' });
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
 * @route POST /connections
 * @description Create a new connection.
 * @body {string} name - Name of the connection.
 * @body {string} deviceIdFrom - ObjectId string of the source device.
 * @body {string} deviceIdTo - ObjectId string of the target device.
 * @returns {201} { insertedId: ObjectId } on success.
 * @returns {400} { error: string } if input data is invalid.
 * @returns {500} { error: string } on server error.
 */
router.post('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, _a, name_1, deviceIdFrom, deviceIdTo, sanitizedName, sanitizedDeviceIdFrom, sanitizedDeviceIdTo, newDocument, result, err_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, 5, 7]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                _a = req.body, name_1 = _a.name, deviceIdFrom = _a.deviceIdFrom, deviceIdTo = _a.deviceIdTo;
                sanitizedName = (0, mongo_sanitize_1.default)(name_1);
                sanitizedDeviceIdFrom = (0, mongo_sanitize_1.default)(deviceIdFrom);
                sanitizedDeviceIdTo = (0, mongo_sanitize_1.default)(deviceIdTo);
                // Validate input
                if (typeof sanitizedName !== 'string' ||
                    typeof sanitizedDeviceIdFrom !== 'string' ||
                    typeof sanitizedDeviceIdTo !== 'string' ||
                    !mongodb_1.ObjectId.isValid(sanitizedDeviceIdFrom) ||
                    !mongodb_1.ObjectId.isValid(sanitizedDeviceIdTo)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid input data: name must be a string, deviceIdFrom and deviceIdTo must be valid ObjectId strings.' })];
                }
                newDocument = {
                    name: sanitizedName,
                    deviceIdFrom: new mongodb_1.ObjectId(sanitizedDeviceIdFrom),
                    deviceIdTo: new mongodb_1.ObjectId(sanitizedDeviceIdTo),
                };
                return [4 /*yield*/, collection.insertOne(newDocument)];
            case 3:
                result = _b.sent();
                res.status(201).json({ insertedId: result.insertedId });
                return [3 /*break*/, 7];
            case 4:
                err_3 = _b.sent();
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 6:
                _b.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); }));
// delete all devices with specific :id model
router.delete('/from/:idFrom/to/:idTo', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.idFrom) || !mongodb_1.ObjectId.isValid(req.params.idTo)) {
                    res.status(404).json({ error: 'Not found' });
                    return [2 /*return*/];
                }
                query = {
                    deviceIdFrom: new mongodb_1.ObjectId(req.params.idFrom),
                    deviceIdTo: new mongodb_1.ObjectId(req.params.idTo),
                };
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteMany(query)];
            case 2:
                result = _a.sent();
                res.status(200).json({ deletedCount: result.deletedCount });
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.delete('/from/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.status(404).json({ error: 'Not found' });
                    return [2 /*return*/];
                }
                query = { deviceIdFrom: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, , 4, 6]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteMany(query)];
            case 3:
                result = _a.sent();
                res.status(200).json({ deletedCount: result.deletedCount });
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 5:
                _a.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); }));
router.delete('/to/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.status(404).json({ error: 'Not found' });
                    return [2 /*return*/];
                }
                query = { deviceIdTo: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, , 4, 6]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteMany(query)];
            case 3:
                result = _a.sent();
                res.status(200).json({ deletedCount: result.deletedCount });
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 5:
                _a.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); }));
/**
 * @route DELETE /connections/:id
 * @description Delete a connection by its ObjectId.
 * @param {string} id - ObjectId string of the connection to delete.
 * @returns {200} { deletedCount: number } on success.
 * @returns {404} { error: string } if the connection is not found or id is invalid.
 * @returns {500} { error: string } on server error.
 */
router.delete('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    res.status(404).json({ error: 'Not found' });
                    return [2 /*return*/];
                }
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteOne(query)];
            case 3:
                result = _a.sent();
                if (result.deletedCount === 0) {
                    res.status(404).json({ error: 'Not found' });
                }
                else {
                    res.status(200).json({ deletedCount: result.deletedCount });
                }
                return [3 /*break*/, 7];
            case 4:
                err_4 = _a.sent();
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); }));
/**
 * @route DELETE /connections/
 * @description Delete all connections from the collection. This is a destructive operation and requires authentication/authorization.
 * Note: The included authentication middleware is for demonstration purposes only and should be replaced with a secure implementation in production.
 * @security Requires authentication/authorization. The provided middleware is a placeholder and not suitable for production use.
 * @returns {200} { deletedCount: number } on success.
 */
// WARNING: This is a placeholder authentication middleware for demonstration purposes only.
var dummyRequireAuth = function (req, res, next) {
    // WARNING: This is insecure and for demonstration only.
    // Do NOT use hardcoded tokens in production. Replace with a secure authentication mechanism.
    // Example: check for an 'Authorization' header or session
    if (!req.headers.authorization || req.headers.authorization !== '3d-inventory-secret-token') {
        res.status(403).json({ error: 'Forbidden: Unauthorized access' });
        return;
    }
    next();
};
router.delete('/', dummyRequireAuth, (function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                query = {};
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, , 4, 6]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteMany(query)];
            case 3:
                result = _a.sent();
                res.status(200).json({ deletedCount: result.deletedCount });
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 5:
                _a.sent();
                return [7 /*endfinally*/];
            case 6: return [3 /*break*/, 8];
            case 7:
                err_5 = _a.sent();
                res.status(401).json({ error: 'Unauthorized or authentication error' });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); }));
exports.default = router;

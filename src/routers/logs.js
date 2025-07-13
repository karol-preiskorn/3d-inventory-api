"use strict";
/**
 * @description This file contains the router for handling log-related API endpoints.
 * @module routers
 * @description This file contains the router for handling log-related API endpoints.
 * @version 2024-01-27 C2RLO - Initial
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
var date_fns_1 = require("date-fns");
var express_1 = require("express");
var mongodb_1 = require("mongodb");
var db_1 = require("../utils/db");
var logger_1 = require("../utils/logger");
var logger = (0, logger_1.default)('logs');
var VALID_COMPONENTS = ['attributes', 'devices', 'floors', 'models', 'connections', 'users', 'attributesDictionary'];
var VALID_OPERATIONS = ['Create', 'Update', 'Delete', 'Fetch'];
var collectionName = 'logs';
var router = express_1.default.Router();
router.get('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.find({}).sort({ date: -1 }).limit(200).toArray()];
            case 2:
                results = _a.sent();
                if (!results) {
                    res.sendStatus(404);
                }
                else {
                    res.status(200).json(results);
                }
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.get('/component/:component', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var component, validComponentsString, validOperationsString, client, db, collection, query, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                component = req.params.component;
                validComponentsString = VALID_COMPONENTS.join(', ');
                validOperationsString = VALID_OPERATIONS.join(', ');
                if (!component) {
                    logger.error('GET /logs/component/ - No component name provided.');
                    res.status(400).json({
                        message: "Component name is required. Valid components are: [".concat(validComponentsString, "]."),
                    });
                    return [2 /*return*/];
                }
                if (!VALID_COMPONENTS.includes(component)) {
                    logger.warn("GET /logs/component/".concat(component, " - Invalid component: ").concat(component, ". Valid components are: [").concat(validComponentsString, "]."));
                    res.status(400).json({
                        message: "Invalid component: ".concat(component, ". Valid components are: [").concat(validComponentsString, "]."),
                    });
                    return [2 /*return*/];
                }
                if (!req.query.operation || !VALID_OPERATIONS.includes(req.query.operation)) {
                    logger.warn("GET /logs/component/".concat(component, " - Invalid or missing operation: ").concat(req.query.operation, ". Valid operations are: [").concat(validOperationsString, "]."));
                    res.status(400).json({
                        message: "Invalid or missing operation. Valid operations are: [".concat(validOperationsString, "]."),
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                query = { component: component };
                logger.info("GET /logs/component/".concat(component, " - Query: ").concat(JSON.stringify(query)));
                return [4 /*yield*/, collection.find(query).sort({ date: -1 }).toArray()];
            case 3:
                result = _a.sent();
                if (!result.length) {
                    logger.warn("GET /logs/component/".concat(component, " - No logs found."));
                    res.status(404).json({ message: "No logs found for component: ".concat(component, ".") });
                }
                else {
                    res.status(200).json(result);
                }
                return [3 /*break*/, 7];
            case 4:
                error_1 = _a.sent();
                logger.error("GET /logs/component/".concat(component, " - Error: ").concat(error_1));
                res.status(500).json({ message: 'Internal server error.' });
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
                if (!mongodb_1.ObjectId.isValid(req.params.id)) {
                    logger.error("GET /logs/model/".concat(req.params.id, " Invalid Id"));
                    res.status(400).send('Invalid ID');
                    return [2 /*return*/];
                }
                query = { modelId: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, collection.find(query).sort({ date: -1 }).toArray()];
            case 2:
                result = _a.sent();
                if (!result) {
                    res.sendStatus(404);
                    logger.warn("GET /logs/model/".concat(req.params.id, ", query: ").concat(JSON.stringify(query), " - 404 not found any model for objectId."));
                }
                else {
                    res.status(200).json(result);
                    logger.info("GET /logs/model/".concat(req.params.id, ", query: ").concat(JSON.stringify(query)));
                }
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
router.get('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, client, db, collection, query, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                if (!id) {
                    logger.error('GET /logs/:id - No ID provided.');
                    res.status(400).json({ message: 'ID is required.' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                query = { objectId: id };
                logger.info("GET /logs/".concat(id, " - Query: ").concat(JSON.stringify(query)));
                return [4 /*yield*/, collection.find(query).sort({ date: -1 }).toArray()];
            case 3:
                result = _a.sent();
                if (!result.length) {
                    logger.warn("GET /logs/".concat(id, " - No logs found for objectId."));
                    res.status(404).json({ message: "No logs found for objectId: ".concat(id, ".") });
                }
                else {
                    res.status(200).json(result);
                }
                return [3 /*break*/, 7];
            case 4:
                error_2 = _a.sent();
                logger.error("GET /logs/".concat(id, " - Error: ").concat(error_2));
                res.status(500).json({ message: 'Internal server error.' });
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); }));
var requiredLogFields = ['objectId', 'operation', 'component', 'message'];
router.post('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, db, collection, newDocument_1, missingFields, results, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                newDocument_1 = req.body;
                newDocument_1.date = (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd HH:mm:ss');
                missingFields = requiredLogFields.filter(function (field) { return !newDocument_1[field]; });
                if (missingFields.length > 0) {
                    logger.error("POST /logs/ - Missing required fields in request body: ".concat(JSON.stringify(newDocument_1)));
                    res.status(400).json({
                        message: "Missing required fields in request body: ".concat(missingFields.join(', ')),
                    });
                    return [2 /*return*/];
                }
                if (!VALID_COMPONENTS.includes(newDocument_1.component)) {
                    logger.error("POST /logs/ - Invalid component: ".concat(newDocument_1.component));
                    res.status(400).json({
                        message: "Invalid component value: ".concat(newDocument_1.component, ". Valid components are: [").concat(VALID_COMPONENTS.join(', '), "]."),
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, collection.insertOne(newDocument_1)];
            case 3:
                results = _a.sent();
                if (!results.acknowledged) {
                    logger.error("POST /logs/ - Log not created. Data: ".concat(JSON.stringify(newDocument_1)));
                    res.status(500).json({ message: 'Failed to create log.' });
                    return [2 /*return*/];
                }
                logger.info("POST /logs/ - Log created. Data: ".concat(JSON.stringify(newDocument_1)));
                res.status(201).json(newDocument_1);
                return [3 /*break*/, 7];
            case 4:
                error_3 = _a.sent();
                logger.error("POST /logs/ - Error: ".concat(error_3));
                res.status(500).json({ message: 'Internal server error.' });
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); }));
router.delete('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, client, db, collection, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = { _id: new mongodb_1.ObjectId(req.params.id) };
                return [4 /*yield*/, (0, db_1.connectToCluster)()];
            case 1:
                client = _a.sent();
                db = (0, db_1.connectToDb)(client);
                collection = db.collection(collectionName);
                return [4 /*yield*/, collection.deleteOne(query)];
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
router.delete('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
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
                res.status(200).json(result);
                return [4 /*yield*/, (0, db_1.closeConnection)(client)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
exports.default = router;

"use strict";
/*
 * File:        /src/services/database.dervice.ts
 * Description: Connect and execute query to Mongo Atlas
 * Used by:
 * Dependency:
 *
 * Date        By       Comments
 * ----------  -------  ------------------------------
 * 2023-11-21  C2RLO    Initial
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runQuery = void 0;
require("dotenv/config");
const logger_1 = __importDefault(require("../util/logger"));
const mongodb_1 = require("mongodb");
// import environment from "src/environment"
const username = encodeURIComponent(process.env.USERNAME);
const password = encodeURIComponent(process.env.PASSWORD);
const clusterUri = encodeURIComponent(process.env.CLUSTERURI);
const uri = `mongodb+srv://${username}:${password}@${clusterUri}/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
function runQuery(pCollection, pQuery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            const dbName = process.env.dbName;
            const collectionName = pCollection;
            const database = client.db(dbName);
            const collection = database.collection(collectionName);
            yield database.command({ ping: 1 });
            // logger.info("Pinged your deployment. You successfully connected to MongoDB!")
            try {
                yield collection.find(pQuery).sort({}).forEach(device => {
                    logger_1.default.info(`${device.name} has model ${device.modelId}, position: [${device.position.x}, ${device.position.y}, ${device.position.h}].`);
                });
            }
            catch (err) {
                logger_1.default.error(`Something went wrong trying to find the documents: ${err}\n`);
            }
        }
        finally {
            // logger.info("Close connection")
            yield client.close();
        }
    });
}
exports.runQuery = runQuery;

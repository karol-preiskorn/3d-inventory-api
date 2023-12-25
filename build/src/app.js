"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const express_flash_1 = __importDefault(require("express-flash"));
const mongodb_1 = require("mongodb");
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./utils/logger"));
// Controllers (route handlers)
const apiController = __importStar(require("./controllers/api"));
const deviceController = __importStar(require("./controllers/device"));
logger_1.default.info("Start app");
const username = encodeURIComponent(process.env.USERNAME);
const password = encodeURIComponent(process.env.PASSWORD);
const clusterUri = encodeURIComponent(process.env.CLUSTERURI);
const uri = `mongodb+srv://${username}:${password}@${clusterUri}/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});
const sessionSecret = encodeURIComponent(process.env.SESSION_SECRET);
// Create Express server
const app = (0, express_1.default)();
client.connect();
const database = client.db(process.env.DBNAME);
// const collectionName = "devices"
// const collection = database.collection(collectionName)
database.command({ ping: 1 });
//   logger.info("✅ You successfully connected to MongoDB!")
// } else {
//   logger.info("🐛 You do not connected to MongoDB!")
// }z
// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// app.use(session({
//   resave: true,
//   saveUninitialized: true,
//   secret: sessionSecret,
//   store: MongoStore.create({
//     mongoUrl: MONGODB_URI,
//     mongoOptions: { retryWrites: true }
//   })
// }))
app.use((0, express_flash_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public"), { maxAge: 31557600000 }));
/**
 *  app routes.
 */
app.get("/api/devices", deviceController.getDevices);
app.get("/api", apiController.getApi);
exports.default = app;

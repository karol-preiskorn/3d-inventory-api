"use strict"
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k
    var desc = Object.getOwnPropertyDescriptor(m, k)
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k] } }
    }
    Object.defineProperty(o, k2, desc)
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k
    o[k2] = m[k]
}))
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v })
}) : function(o, v) {
    o.default = v
})
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k)
    __setModuleDefault(result, mod)
    return result
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod }
}
Object.defineProperty(exports, "__esModule", { value: true })
const express_1 = __importDefault(require("express"))
const logger_1 = __importDefault(require("./utils/logger"))
const figlet_1 = __importDefault(require("figlet"))
const OpenApiValidator = __importStar(require("express-openapi-validator"))
const path_1 = __importDefault(require("path"))
require("dotenv/config")
const app = (0, express_1.default)()
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
app.use(express_1.default.json())
// 3. (optionally) Serve the OpenAPI spec
const spec = path_1.default.join(__dirname, "../../api/openapi.yaml")
app.use("/doc", express_1.default.static(spec))
app.use(OpenApiValidator.middleware({
    apiSpec: "../../api/openapi.yaml",
    validateRequests: true, // (default)
    validateResponses: true, // false by default
}))
app
    .listen(PORT, "localhost", function () {
    logger_1.default.info("\n" + figlet_1.default.textSync("3d-inv-mongo-api", {
        font: "Graffiti",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 255,
        whitespaceBreak: true,
    }))
    logger_1.default.info(`Server 3d-inventory-mongo-api is running at http://localhost:${PORT} in ${process.env.ENV} mode.`)
})
    .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        logger_1.default.info("Error: address already in use")
    }
    else {
        logger_1.default.error(err)
    }
})
exports.default = app

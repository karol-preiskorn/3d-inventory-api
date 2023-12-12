"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./util/logger"));
const figlet_1 = __importDefault(require("figlet"));
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
app
    .listen(PORT, "localhost", function () {
    logger_1.default.info("\n" + figlet_1.default.textSync("3d-inv-mongo-api", {
        font: "Graffiti",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 255,
        whitespaceBreak: true,
    }));
    logger_1.default.info("  Server 3d-inventory-mongo-api is running at http://localhost:%d in %s mode", app.get("port"), app.get("env"));
})
    .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        logger_1.default.info("Error: address already in use");
    }
    else {
        logger_1.default.error(err);
    }
});

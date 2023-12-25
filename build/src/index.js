"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./utils/logger"));
const figlet_1 = __importDefault(require("figlet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
logger_1.default.info("\n" + figlet_1.default.textSync("3d-inv-mongo-api", {
    font: "Graffiti",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 255,
    whitespaceBreak: true,
}));
app.use(express_1.default.json());
const yamlFilename = "./api/openapi.yaml";
fs_1.default.open(yamlFilename, "r", (err, fd) => {
    if (err) {
        if (err.code === "ENOENT") {
            logger_1.default.error("File Doesn't Exist");
            return;
        }
        if (err.code === "EACCES") {
            logger_1.default.error("No Permission");
            return;
        }
        logger_1.default.error("Unknown Error");
    }
    // logger.info(`Found yaml file: ${yamlFilename}`)
});
// try {
//   // const spec = path.join(__dirname, "/api/openapi.yaml")
//   app.use("/doc", express.static(yamlFilename))
//   logger.info(`Open api doc path: ${yamlFilename} url: http://localhost:${PORT}/yaml`)
// } catch (e) {
//   if (typeof e === "string") {
//     e.toUpperCase() // works, `e` narrowed to string
//   } else if (e instanceof Error) {
//     // console.error("Exception " + e.message)
//     logger.error("Exception " + e.message + ", open: " + encodeURI("https://stackoverflow.com/search?q=[js]" + e.message))
//   }
// }
// try {
//   logger.info("Before middleware")
//   app.use(
//     OpenApiValidator.middleware({
//       apiSpec: yamlFilename,
//       validateRequests: true, // (default)
//       validateResponses: false, // false by default
//     }),
//   )
//   logger.info("After middleware")
// } catch (e) {
//   if (typeof e === "string") {
//     logger.error(e.toUpperCase()) // works, `e` narrowed to string
//   } else if (e instanceof Error) {
//     // console.error("Exception " + e.message)
//     logger.error("Exception " + e.message + ", open: " + encodeURI("https://stackoverflow.com/search?q=[js]" + e.message))
//   }
// }
try {
    const file = fs_1.default.readFileSync(yamlFilename, "utf8");
    const swaggerDocument = yaml_1.default.parse(file);
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    // logger.info(`After Open yaml file in http://localhost:${PORT}/api`)
}
catch (e) {
    if (typeof e === "string") {
        e.toUpperCase(); // works, `e` narrowed to string
    }
    else if (e instanceof Error) {
        // console.error("Exception " + e.message)
        logger_1.default.error("Exception " + e.message + ", open: " + encodeURI("https://stackoverflow.com/search?q=[js]" + e.message));
    }
}
app
    .listen(PORT, "localhost", function () {
    logger_1.default.info(`Server 3d-inventory-mongo-api is running at http://localhost:${PORT}/api in ${process.env.ENV} mode.`);
})
    .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        logger_1.default.info("Error: address already in use");
    }
    else {
        logger_1.default.error(err);
    }
});
exports.default = app;

// "use strict"

require("dotenv").config()
const figlet = require("figlet")
const path = require("path")
const http = require("http")
const oas3Tools = require("oas3-tools")
const logger = require("./utils/logger.js")

const serverPort = 8080

// swaggerRouter configuration
const options = {
    routing: {
        controllers: "./controllers"
    },
}

logger.info(
    "\n" + figlet.textSync("3d-inv-mongo-api", {
        font: "Graffiti",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 255,
        whitespaceBreak: true,
    })
)

const expressAppConfig = oas3Tools.expressAppConfig("api/openapi.yaml", options)
const app = expressAppConfig.getApp()

// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    logger.info("Your server is listening on port %d (http://localhost:%d)", serverPort, serverPort)
    logger.info("Swagger UI is available on http://localhost:%d/docs", serverPort)
}).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        logger.info("Error: address already in use")
    } else {
        logger.error(err)
    }
})

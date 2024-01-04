/**
 * File:        /index.mjs
 * Description: API 3d-inventory. Project is a simple solution that allows you to build a spatial and database representation of all types
 *              of warehouses and server rooms.
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-12-29  C2RLO  Initial
 **/

import cors from "cors"
import express from "express"
import "express-async-errors"
import figlet from "figlet"
import "./loadEnvironment.mjs"
import devices from "./routers/devices.mjs"
import logger from "./utils/logger.mjs"
import swaggerUi from "swagger-ui-express"
import * as OpenApiValidator from "express-openapi-validator"
import fs from "fs"
import YAML from "yaml"

logger.info(
  "\n" +
  figlet.textSync("3d-inv-mongo-api", {
    font: "Graffiti",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 255,
    whitespaceBreak: true,
  })
)

const PORT = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(express.json())

// Load the /posts routes
app.use("/devices", devices)

// Global error handling
app.use((err, _req, res, next) => {
  logger.error(`Uh oh! An unexpected error occurred. ${err}`)
  res.status(500).send(`Uh oh! An unexpected error occurred. ${err}`)
})

app.use(express.json())
const yamlFilename = "./api/openapi.yaml"

fs.open(yamlFilename, "r", (err, fd) => {
  if (err) {
    if (err.code === "ENOENT") {
      logger.error("File Doesn't Exist")
      return
    }
    if (err.code === "EACCES") {
      logger.error("No Permission")
      return
    }
    logger.error("Unknown Error")
  }
})

// Server static OpenAPI
try {
  app.use("/yaml", express.static(yamlFilename))
  logger.info(`Openapi definition: http://localhost:${PORT}/yaml`)
} catch (e) {
  if (typeof e === "string") {
    e.toUpperCase()
  } else if (e instanceof Error) {
    logger.error("[Openapi definition] Exception " + e.message + ", open: " + encodeURI("https://stackoverflow.com/search?q=[js]" + e.message))
  }
}

try {
  const file = fs.readFileSync(yamlFilename, "utf8")
  const swaggerDocument = YAML.parse(file)
  app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  logger.info(`Open SwaggerUI in http://localhost:${PORT}/api`)
} catch (e) {
  if (typeof e === "string") {
    logger.warn(e.toUpperCase())
  } else if (e instanceof Error) {
    logger.error("[Open SwaggerUI] Exception " + e.message + ", open: " + encodeURI("https://stackoverflow.com/search?q=[js]" + e.message))
  }
}

// OpenApi validation
try {
  app.use(OpenApiValidator.middleware({
    apiSpec: yamlFilename,
    validateRequests: true,
    validateResponses: true
  }))
} catch (error) {
  logger.error(`[openApiValidator] ${error}`)
}

// Start the Express server
app
  .listen(PORT, () => {
    logger.info("Your server API is listening on http://localhost:%d/devices", PORT)
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.info("Error: address already in use")
    } else {
      logger.error(`[listen] ${err}`)
    }
  })

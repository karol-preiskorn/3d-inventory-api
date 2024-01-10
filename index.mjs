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
import * as OpenApiValidator from "express-openapi-validator"
import path from "path"
import fs from "fs"
import morgan from "morgan"
import morganBody from "morgan-body"
import rfs from "rotating-file-stream"
import swaggerUi from "swagger-ui-express"
import bodyParser from "body-parser"
import YAML from "yaml"
import helmet from "helmet"
import { fileURLToPath } from "url"
import "./loadEnvironment.mjs"
import devices from "./routers/devices.mjs"
import models from "./routers/models.mjs"
import readme from "./routers/readme.mjs"
import { logger, stream } from "./utils/logger.mjs"
import { banner } from "./utils/banner.mjs"


const PORT = process.env.PORT || 8080
const app = express()


// logger.accessLogStream = rfs.createStream("logs/access.log", {
//   size: "10M",        // rotate every 10 MegaBytes written
//   interval: "1d",     // rotate daily
//   compress: "gzip",   // compress rotated files
//   // path: path.join(__dirname, "logs")
// })

try {
  // const accessLogStream = fs.createWriteStream("./logs/access.log", { flags: "a" })
  app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"), "-",
      tokens["response-time"](req, res), "ms"
    ].join(" ")
  }, { stream } ))
} catch (error) {
  logger.error(`[morgan] ${error}`)
}

app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
morganBody(app,{
  noColors: true,
  stream
})
app.use(express.urlencoded({ extended: false }))

// Load the api routes
app.use("/devices", devices)
app.use("/models", models)
app.use("/readme", readme)

banner()

// Global error handling
// app.use((err, _req, res, next) => {
//   logger.error(`Uh oh! An unexpected error occurred. ${err}`)
//   res.status(500).send(`Uh oh! An unexpected error occurred. ${err}`)
// })

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
// try {
//   app.use("/yaml", express.static(yamlFilename))
//   logger.info(`Openapi definition: http://localhost:${PORT}/yaml`)
// } catch (e) {
//   if (typeof e === "string") {
//     e.toUpperCase()
//   } else if (e instanceof Error) {
//     logger.error("[Openapi definition] Exception " + e.message + ", open: " + encodeURI("https://stackoverflow.com/search?q=[js]" + e.message))
//   }
// }

try {
  const file = fs.readFileSync(yamlFilename, "utf8")
  const swaggerDocument = YAML.parse(file)
  app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  logger.info(`Open SwaggerUI in http://localhost:${PORT}/`)
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
  // logger.info("OpenApiValidator started")
} catch (error) {
  logger.error(`OpenApiValidator: ${error}`)
}

app.use(helmet())

// Start the Express server
app
  .listen(PORT, () => {
    logger.info(`README on http://localhost:${PORT}/readme`)
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.error("Error: address already in use")
    } else {
      logger.error(`[listen] ${err}`)
    }
  })

process.on("SIGTERM", () => {
  logger.debug("SIGTERM signal received: closing HTTP server")
  app.close(() => {
    logger.debug("HTTP server closed")
  })
})


export default app

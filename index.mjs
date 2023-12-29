/**
 * File:        /index.mjs
 * Description:
 * Used by:
 * Dependency:
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
import swaggerJsDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

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

const swaggerOptions = {
  failOnErrors: true,
  definition: {
    openapi: "3.0.3",
    info: {
      title: "3d-inventory-mongo-api",
      description: "A REST API built with Express and MongoDB. This API provides movie catchphrases and the context of the 3d-inventory project. Project is a simple solution that allows you\
    \ to build a spatial and database representation of all types of warehouses and\
    \ server rooms. \n ### Modules\n - Devices\n - Logs\n - Models\n - Connections\n - attributes\n - attributeDictionary\n - floors",
      version: "0.0.8",
      license: {
        name: "Apache 2.0",
        url: "https://www.apache.org/licenses/LICENSE-2.0.html",
      },
      contact: {
        name: "C2RLO",
        url: "https://github.com/karol-preiskorn/3d-inventory-mongo-api/discussions",
        email: "h5xwmtlfp@mozmail.com"
      },
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Development server",
      },
      {
        url: "https://virtserver.swaggerhub.com/karol-preiskorn/3d-inventory-rest-api/0.0.6",
        description: "SwaggerHub API Auto Mocking"
      }
    ],
    tags: [
      {
        name: "logs",
        description: "Group Logs API",
      },
      {
        name: "devices",
        description: "Group Devices API",
      },
      {
        name: "models",
        description: "Group Models API",
      },
      {
        name: "connections",
        description: "Group Connections API",
      },
      {
        name: "attributes",
        description: "Group Attributes API",
      },
      {
        name: "attributeDictionary",
        description: "Group Attributes Dictionary API",
      },
      {
        name: "floors",
        description: "Group Floors API",
      },
    ],
  },
  apis: ["./routers/devices.mjs"]
}

// Load the /posts routes
app.use("/devices", devices)

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send(`Uh oh! An unexpected error occurred. ${err}`)
})

// Render Swagger JSdocs
try {
  const swaggerDocs = swaggerJsDoc(swaggerOptions)
  app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs))
} catch (error) {
  logger.error(error)
}

// Start the Express server
app
  .listen(PORT, () => {
    logger.info("Your server is listening on http://localhost:%d/devices", PORT)
    logger.info("Swagger UI is available on http://localhost:%d/", PORT)
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.info("Error: address already in use")
    } else {
      logger.error(err)
    }
  })

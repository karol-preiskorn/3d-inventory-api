import express, { Application } from "express"
import Server from "./server"
import logger from "./utils/logger"
import figlet from "figlet"
import * as OpenApiValidator from "express-openapi-validator"
import path from "path"
import "dotenv/config"

const app: Application = express()
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

app.use(express.json())

// 3. (optionally) Serve the OpenAPI spec
const spec = path.join(__dirname, "../../api/openapi.yaml")
app.use("/doc", express.static(spec))

app.use(
  OpenApiValidator.middleware({
    apiSpec: "../../api/openapi.yaml",
    validateRequests: true, // (default)
    validateResponses: true, // false by default
  }),
)

app
  .listen(PORT, "localhost", function () {
    logger.info(
      "\n" + figlet.textSync("3d-inv-mongo-api", {
        font: "Graffiti",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 255,
        whitespaceBreak: true,
      })
    )
    logger.info(`Server 3d-inventory-mongo-api is running at http://localhost:${PORT} in ${process.env.ENV} mode.`)

  })
  .on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      logger.info("Error: address already in use")
    } else {
      logger.error(err)
    }
  })

  export default app

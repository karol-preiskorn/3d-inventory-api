import express, { Application } from "express"
import Server from "./server"
import logger from "./utils/logger"
import figlet from "figlet"
import * as OpenApiValidator from "express-openapi-validator"
import swaggerUi from "swagger-ui-express"
import "dotenv/config"
import fs from "fs"
import YAML from "yaml"
import path from "path"

const app: Application = express()
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

logger.info(
  "\n" + figlet.textSync("3d-inv-mongo-api", {
    font: "Graffiti",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 255,
    whitespaceBreak: true,
  })
)

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
  // logger.info(`Found yaml file: ${yamlFilename}`)
})


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
  const file = fs.readFileSync(yamlFilename, "utf8")
  const swaggerDocument = YAML.parse(file)
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  // logger.info(`After Open yaml file in http://localhost:${PORT}/api`)
} catch (e) {
  if (typeof e === "string") {
    e.toUpperCase() // works, `e` narrowed to string
  } else if (e instanceof Error) {
    // console.error("Exception " + e.message)
    logger.error("Exception " + e.message + ", open: " + encodeURI("https://stackoverflow.com/search?q=[js]" + e.message))
  }
}

app
  .listen(PORT, "localhost", function () {
    logger.info(`Server 3d-inventory-mongo-api is running at http://localhost:${PORT}/api in ${process.env.ENV} mode.`)
  })
  .on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      logger.info("Error: address already in use")
    } else {
      logger.error(err)
    }
  })

export default app

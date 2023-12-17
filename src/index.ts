import express, { Application } from "express"
import Server from "./server"
import logger from "./utils/logger"
import figlet from "figlet"

const app: Application = express()
const server: Server = new Server(app)
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080

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
    logger.info("Server 3d-inventory-mongo-api is running at http://localhost:${process.env.PORT} in ${process.env.ENV} mode.")

  })
  .on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      logger.info("Error: address already in use")
    } else {
      logger.error(err)
    }
  })

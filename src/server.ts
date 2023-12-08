import errorHandler from "errorhandler"
import app from "./app"
import logger from "./utils/logger"
import figlet from "figlet"

/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === "development") {
  app.use(errorHandler())
}

/**
 * Start Express server.
 *
 * */
try {
  app.listen(app.get("port"), () => {
    logger.info(
      "\n" + figlet.textSync("3d-inv-mongo-api", {
        font: "Graffiti",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 255,
        whitespaceBreak: true,
      })
    )
    logger.info(
      "  Server 3d-inventory-mongo-api is running at http://localhost:%d in %s mode",
      app.get("port"),
      app.get("env")
    )
  })
} catch

try

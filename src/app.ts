import express from "express"
import compression from "compression"  // compresses requests
import session from "express-session"
import bodyParser from "body-parser"
import MongoStore from "connect-mongo"
import flash from "express-flash"
import path from "path"
import "dotenv/config"
import { MongoClient, ServerApiVersion } from "mongodb"
import logger from "./util/logger"

logger.info('Start app')

const username = encodeURIComponent(process.env.username)
const password = encodeURIComponent(process.env.password)
const clusterUri = encodeURIComponent(process.env.clusterUri)

const uri = `mongodb+srv://${username}:${password}@${clusterUri}/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

import { MONGODB_URI, SESSION_SECRET } from "./util/secrets"

// Controllers (route handlers)
import * as homeController from "./controllers/home"
import * as userController from "./controllers/user"
import * as apiController from "./controllers/api"
import * as contactController from "./controllers/contact"
import * as deviceController from "./controllers/device"

// Create Express server
const app = express()

var db
client.connect()
const dbName = process.env.dbName
const collectionName = "devices"
const database = client.db(dbName)
const collection = database.collection(collectionName)

database.command({ ping: 1 })
logger.info("You successfully connected to MongoDB!")

// Express configuration
app.set("port", process.env.PORT || 3000)
app.set("views", path.join(__dirname, "../views"))
app.set("view engine", "pug")
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    mongoOptions: { retryWrites: true }
  })
}))
app.use(flash())
// app.use(lusca.xframe("SAMEORIGIN"))
// app.use(lusca.xssProtection(true))
app.use((req, res, next) => {
    res.locals.user = req.user
    next()
  })
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
      req.path !== "/login" &&
      req.path !== "/signup" &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    } else if (req.user &&
      req.path == "/account") {
    }
    next()
  })

app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
  )

/**
 * Primary app routes.
 */
app.get("/", homeController.index)
app.get("/devices", deviceController.getDevices)

/**
 * API examples routes.
 */
app.get("/api", apiController.getApi)

export default app

import bodyParser from "body-parser"
import compression from "compression" // compresses requests
import MongoStore from "connect-mongo"
import "dotenv/config"
import express from "express"
import flash from "express-flash"
import session from "express-session"
import { MongoClient, ServerApiVersion } from "mongodb"
import path from "path"
import logger from "./util/logger"

import { MONGODB_URI, SESSION_SECRET } from "./util/secrets"

// Controllers (route handlers)
import * as apiController from "./controllers/api"
import * as deviceController from "./controllers/device"
import * as homeController from "./controllers/home"

logger.info("Start app")

const username = encodeURIComponent(process.env.USERNAME)
const password = encodeURIComponent(process.env.PASSWORD)
const clusterUri = encodeURIComponent(process.env.CLUSTERURI)

const uri = `mongodb+srv://${username}:${password}@${clusterUri}/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Create Express server
const app = express()

var db
client.connect()
const collectionName = "devices"
const database = client.db(process.env.DBNAME)
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
var sessionSecret = encodeURIComponent(process.env.SESSION_SECRET)
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: sessionSecret,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    mongoOptions: { retryWrites: true }
  })
}))
app.use(flash())
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
 *
 * API examples routes.
 *
 */
app.get("/api", apiController.getApi)

export default app

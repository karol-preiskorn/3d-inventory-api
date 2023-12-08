import bodyParser from "body-parser"
import "dotenv/config"
import express from "express"
import flash from "express-flash"
import { MongoClient, ServerApiVersion } from "mongodb"
import path from "path"
import logger from "./utils/logger"

// Controllers (route handlers)
import * as apiController from "./controllers/api"
import * as deviceController from "./controllers/device"

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

const sessionSecret = encodeURIComponent(process.env.SESSION_SECRET)

// Create Express server
const app = express()

client.connect()
const database = client.db(process.env.DBNAME)
// const collectionName = "devices"
// const collection = database.collection(collectionName)
database.command({ ping: 1 })
//   logger.info("✅ You successfully connected to MongoDB!")
// } else {
//   logger.info("🐛 You do not connected to MongoDB!")
// }z

// Express configuration
app.set("port", process.env.PORT || 3000)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(session({
//   resave: true,
//   saveUninitialized: true,
//   secret: sessionSecret,
//   store: MongoStore.create({
//     mongoUrl: MONGODB_URI,
//     mongoOptions: { retryWrites: true }
//   })
// }))
app.use(flash())
app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }))

/**
 *  app routes.
 */
app.get("/api/devices", deviceController.getDevices)
app.get("/api", apiController.getApi)

export default app

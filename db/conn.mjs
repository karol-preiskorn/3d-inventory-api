/**
 * File:        /db/conn.mjs
 * Description: Connect to Mongo Atlas DB
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2024-01-13  C2RLO  Fix async error
 * 2023-12-29  C2RLO  Initial
 **/

import { MongoClient } from "mongodb"

const connectionString = process.env.ATLAS_URI || ""

const client = new MongoClient(connectionString)

let conn
let db

async function connectToDb() {
  try {
    conn = await client.connect()
    db = conn.db("3d-inventory")
  } catch (e) {
    console.error(e)
  }
}

connectToDb()

export default db

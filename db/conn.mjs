/**
 * File:        /db/conn.mjs
 * Description:
 * Used by:
 * Dependency:
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-12-29  C2RLO  Initial
**/

import { MongoClient } from "mongodb"

const connectionString = process.env.ATLAS_URI || ""

const client = new MongoClient(connectionString)

let conn
try {
  conn = await client.connect()
} catch (e) {
  console.error(e)
}

let db = conn.db("3d-inventory")

export default db

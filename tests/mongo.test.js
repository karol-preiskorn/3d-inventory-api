/*
 * File:        index.js
 * Description: Connect to MongoDB 3d-inventory claster
 * Used by:     testing connect to Mongo Atlas
 * Dependency:  .env (not push to git)
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-11-26  C2RLO  Add mongo test
 * 2023-11-20  C2RLO  Add logger
 * 2023-10-29  C2RLO  Init
 */

const logger = require("../utils/logger.js")
const runQuery = require("../service/MongoService")
const { MongoClient } = require("mongodb")
const { faker } = require("@faker-js/faker")


describe("Test Mongo Atlas DB connection and schema", () => {
  let connection
  let db

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    db = await connection.db(globalThis.process.env.DBNAME)
  })

  afterAll(async () => {
    await connection.close()
  })

  it("should insert a User doc into collection", async () => {
    const users = db.collection("users")

    const mockUser = {
      "name": faker.person.fullName(),
      "email": faker.internet.email(),
      "password": faker.internet.password({ length: 20 }),
      "rights": faker.helpers.arrayElements(["admin", "users", "models", "connections", "attributes"],1,3),
      "token": faker.internet.password({ length: 50 })
    }
    await users.insertOne(mockUser)

    const insertedUser = await users.findOne(mockUser)
    expect(insertedUser).toEqual(mockUser)
  })
})

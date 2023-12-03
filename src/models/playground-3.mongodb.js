/*
 * File:        /src/models/playground-3.mongodb.js
 * Description:
 * Used by:
 * Dependency:
 *
 * Date        By       Comments
 * ----------  -------  ------------------------------
 * 2023-11-29  C2RLO    Initial
 */



// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("3d-inventory")

// Create a new document in the collection.
db.getCollection("users").insertOne({
  name: "user",
  "email": "karol.preiskorn@gmail.com",
  password: "3d-inventory!",
  rights: ["admin", "users", "models", "connections", "attributes"],
  token: "1234567890"
})

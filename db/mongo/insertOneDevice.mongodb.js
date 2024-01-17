/* global use, db */

// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("3d-inventory")

// Create a new document in the collection.
db.getCollection("devices").insertOne({
  _id: {
    $oid: "659277c500d1075d06d28d28"
  },
  name: "Chair olive-bird",
  modelId: {
    $oid: "659277c500d1075d06d28d27"
  },
  position: {
    x: 52,
    y: 64,
    h: 57
  }
})

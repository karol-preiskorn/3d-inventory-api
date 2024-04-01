/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('3d-inventory')

// Search for documents in the current collection.
const r = db
  .getCollection('devices')
  .find(
    {
      _id: ObjectId('65b67f8bf42bf190aca7029d'),
    },
    {
      _id: 1,
      name: 1,
    },
  )
  .sort({
    _id: 1,
  })

// Print the result.

printjson(r.toArray())

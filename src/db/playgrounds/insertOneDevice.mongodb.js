/* global use, db */

// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('3d-inventory')

// Create a new document in the collection.
// db.getCollection('devices').insertOne({
//   _id: {
//     $oid: '659277c500d1075d06d28d28',
//   },
//   name: 'Chair olive-bird',
//   modelId: {
//     $oid: '659277c500d1075d06d28d27',
//   },
//   position: {
//     x: 52,
//     y: 64,
//     h: 57,
//   },
// })

// db.getCollection('devices').updateOne(
//   { _id: '65b67f8bf42bf190aca7029d'},
//   {
//     $set: {
//       name: 'Gloves Device',
//       modelId: { $oid: '65b67f8cf42bf190aca702a7' },
//       position: {
//         x: 43,
//         y: 86,
//         h: 57,
//       },
//     }
//   }
// )

db.getCollection('devices')
  .find({ _id: '65b67f8bf42bf190aca7029d' })
  .project({ name: 1, modelId: 1, _id: 0 })

/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('3d-inventory')

// Create a new document in the collection.
db.getCollection('models').insertOne({
  name: 'Model 10',
  dimension: {
    width: '1',
    height: '2',
    depth: '2'
  },
  texture: {
    front: '/assets/r710-2.5-nobezel__29341.png',
    back: '/assets/r710-2.5-nobezel__29341.png',
    side: '/assets/r710-2.5-nobezel__29341.png',
    top: '/assets/r710-2.5-nobezel__29341.png',
    botom: '/assets/r710-2.5-nobezel__29341.png'
  },
  type: 'CoolAir',
  category: 'Facility'
})

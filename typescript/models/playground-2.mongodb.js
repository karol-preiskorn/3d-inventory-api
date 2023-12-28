/*
 * File:        /src/models/playground-2.mongodb.js
 * Description:
 * Used by:
 * Dependency:
 *
 * Date        By       Comments
 * ----------  -------  ------------------------------
 * 2023-11-29  C2RLO    Initial
 */



/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = "3d-inventory"
const collection = "users"

// The current database to use.
use(database)

// Create a new collection.
db.createCollection(collection)


// More information on the `createCollection` command can be found at:
// https://www.mongodb.com/docs/manual/reference/method/db.createCollection/

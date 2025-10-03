/**
 * Direct MongoDB query to see raw user data
 * This script queries the database directly to see the raw user documents
 */

import { closeConnection, connectToCluster, connectToDb } from './src/utils/db'
import getLogger from './src/utils/logger'

const logger = getLogger('db-raw-query')

async function main() {
  console.log('🔍 Raw Database Query - User Collection')
  console.log('======================================')
  console.log(`Time: ${new Date().toISOString()}\n`)

  let client = null

  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB Atlas...')
    client = await connectToCluster()
    const db = connectToDb(client)
    // Get the users collection
    const usersCollection = db.collection('users')
    // Count total documents
    const totalCount = await usersCollection.countDocuments()

    console.log(`📊 Total documents in users collection: ${totalCount}`)

    if (totalCount === 0) {
      console.log('ℹ️  No users found in database.')
      console.log('   Run: npm run init:users')

      return
    }

    // Get all users with raw data
    console.log('\n📋 Raw user documents:')
    console.log('='.repeat(50))

    const users = await usersCollection.find({}).toArray()

    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`)
      console.log(`   _id: ${user._id}`)
      console.log(`   username: ${user.username}`)
      console.log(`   email: ${user.email}`)
      console.log(`   role: ${user.role}`)
      console.log(`   isActive: ${user.isActive}`)
      console.log(`   createdAt: ${user.createdAt}`)
      console.log(`   updatedAt: ${user.updatedAt}`)
      console.log(`   lastLogin: ${user.lastLogin}`)
      console.log(`   loginAttempts: ${user.loginAttempts}`)
      console.log(`   lockUntil: ${user.lockUntil}`)
      console.log(`   permissions: ${user.permissions ? JSON.stringify(user.permissions) : 'undefined'}`)
      console.log(`   password hash length: ${user.password ? user.password.length : 'undefined'}`)
    })

    // Look for specific usernames
    console.log('\n🔍 Searching for specific usernames:')
    console.log('='.repeat(40))

    const targetUsernames = ['admin', 'user', 'carlo', 'viewer']

    for (const username of targetUsernames) {
      const user = await usersCollection.findOne({ username: username })

      if (user) {
        console.log(`✅ Found user: ${username}`)
        console.log(`   _id: ${user._id}`)
        console.log(`   role: ${user.role}`)
        console.log(`   isActive: ${user.isActive}`)
      } else {
        console.log(`❌ User not found: ${username}`)
      }
    }

    // Check for users with similar usernames (case-insensitive)
    console.log('\n🔍 Case-insensitive username search:')
    console.log('='.repeat(40))

    for (const username of targetUsernames) {
      const user = await usersCollection.findOne({
        username: { $regex: new RegExp(`^${username}$`, 'i') }
      })

      if (user) {
        console.log(`✅ Found user (case-insensitive): ${user.username} (looking for: ${username})`)
      } else {
        console.log(`❌ User not found (case-insensitive): ${username}`)
      }
    }

    console.log('\n📊 Analysis:')
    console.log('='.repeat(20))
    console.log('1. If you see users but with undefined values:')
    console.log('   • There may be a schema mismatch')
    console.log('   • Check the User interface definition')
    console.log('   • Check the toUserResponse function')
    console.log('')
    console.log('2. If target users are missing:')
    console.log('   • Run: npm run init:users to create them')
    console.log('   • Check if initialization completed successfully')
    console.log('')
    console.log('3. If users exist but with different usernames:')
    console.log('   • Check for typos or extra characters')
    console.log('   • Check case sensitivity issues')

  } catch (error) {
    logger.error('Database query failed:', error instanceof Error ? error.message : String(error))
    console.error('\n❌ Database query failed:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('Error details:', error.stack)
    }
    process.exit(1)
  } finally {
    if (client) {
      await closeConnection(client)
      console.log('\n🔒 Database connection closed')
    }
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n🛑 Process interrupted, exiting...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Process terminated, exiting...')
  process.exit(0)
})

// Run the script
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

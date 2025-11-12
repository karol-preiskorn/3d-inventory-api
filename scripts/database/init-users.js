#!/usr/bin/env node

/**
 * 3D Inventory API Database User Initialization and Check
 * This script helps initialize default users and check database state
 */

// Import necessary modules for the API project
import { UserService } from './src/services/UserService.js'
import { closeConnection, connectToCluster, connectToDb } from './src/utils/db.js'
import getLogger from './src/utils/logger.js'

const logger = getLogger('db-check')

// Default users that should exist
const DEFAULT_USERS = [
  {
    username: 'admin',
    email: 'admin@3d-inventory.local',
    password: 'admin123!',
    role: 'admin'
  },
  {
    username: 'user',
    email: 'user@3d-inventory.local',
    password: 'user123!',
    role: 'user'
  },
  {
    username: 'carlo',
    email: 'carlo@3d-inventory.local',
    password: 'carlo123!',
    role: 'user'
  },
  {
    username: 'viewer',
    email: 'viewer@3d-inventory.local',
    password: 'viewer123!',
    role: 'viewer'
  }
]

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...')

  let client = null
  try {
    client = await connectToCluster()
    const db = connectToDb(client)

    // Test database connection
    await db.admin().ping()
    console.log('✅ Database connection: SUCCESS')

    return { client, db }
  } catch (error) {
    console.error('❌ Database connection: FAILED')
    console.error('   Error:', error.message)
    throw error
  }
}

async function checkExistingUsers(db) {
  console.log('\n🔍 Checking existing users...')

  try {
    const usersCollection = db.collection('users')
    const users = await usersCollection.find({}).toArray()

    console.log(`📊 Found ${users.length} users in database:`)

    if (users.length === 0) {
      console.log('   ⚠️  No users found in database!')
      return []
    }

    users.forEach(user => {
      console.log(`   • ${user.username} (${user.role}) - Active: ${user.isActive !== false}`)
    })

    return users
  } catch (error) {
    console.error('❌ Error checking users:', error.message)
    throw error
  }
}

async function initializeDefaultUsers() {
  console.log('\n🚀 Initializing default users...')

  const userService = UserService.getInstance()

  for (const userData of DEFAULT_USERS) {
    try {
      console.log(`   Creating user: ${userData.username}...`)

      // Check if user already exists
      const existingUser = await userService.getUserByUsername(userData.username)

      if (existingUser) {
        console.log(`   ⚠️  User ${userData.username} already exists, skipping...`)
        continue
      }

      // Create the user
      const createdUser = await userService.createUser(userData)
      console.log(`   ✅ Created user: ${userData.username} (${userData.role})`)

    } catch (error) {
      console.error(`   ❌ Failed to create user ${userData.username}:`, error.message)
    }
  }
}

async function testUserAuthentication() {
  console.log('\n🔐 Testing user authentication...')

  const userService = UserService.getInstance()

  for (const userData of DEFAULT_USERS) {
    try {
      console.log(`   Testing: ${userData.username}...`)

      const authenticatedUser = await userService.authenticateUser(userData.username, userData.password)

      if (authenticatedUser) {
        console.log(`   ✅ Authentication SUCCESS: ${userData.username}`)
      } else {
        console.log(`   ❌ Authentication FAILED: ${userData.username}`)
      }

    } catch (error) {
      console.error(`   ❌ Authentication ERROR for ${userData.username}:`, error.message)
    }
  }
}

async function main() {
  console.log('🚀 3D Inventory API Database Check and User Initialization')
  console.log('=========================================================')
  console.log(`Time: ${new Date().toISOString()}\n`)

  let client = null

  try {
    // Check database connection
    const { client: dbClient, db } = await checkDatabaseConnection()
    client = dbClient

    // Check existing users
    const existingUsers = await checkExistingUsers(db)

    // Initialize default users if needed
    if (existingUsers.length === 0) {
      console.log('\n💡 No users found. Initializing default users...')
      await initializeDefaultUsers()
    } else {
      // Check if we have all required default users
      const existingUsernames = existingUsers.map(u => u.username)
      const missingUsers = DEFAULT_USERS.filter(u => !existingUsernames.includes(u.username))

      if (missingUsers.length > 0) {
        console.log(`\n💡 Missing ${missingUsers.length} default users. Creating them...`)
        for (const userData of missingUsers) {
          try {
            const userService = UserService.getInstance()
            await userService.createUser(userData)
            console.log(`   ✅ Created missing user: ${userData.username}`)
          } catch (error) {
            console.error(`   ❌ Failed to create user ${userData.username}:`, error.message)
          }
        }
      }
    }

    // Test authentication
    await testUserAuthentication()

    console.log('\n📋 Summary:')
    console.log('===========')
    console.log('1. Database connection: ✅ Working')
    console.log('2. User initialization: ✅ Completed')
    console.log('3. Authentication test: ✅ Completed')
    console.log('')
    console.log('🎯 Next steps:')
    console.log('   • Wait 15 minutes for rate limiting to reset')
    console.log('   • Test login again with the UI or API')
    console.log('   • Check production logs if issues persist')

  } catch (error) {
    console.error('\n❌ Main execution error:', error.message)
    console.error(error.stack)
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

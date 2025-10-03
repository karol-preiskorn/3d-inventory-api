/**
 * Database cleanup and user re-initialization script
 * WARNING: This will delete all existing users and create fresh default users
 */

import { InitializationService } from './src/services/InitializationService'
import { UserService } from './src/services/UserService'
import { closeConnection, connectToCluster, connectToDb } from './src/utils/db'
import getLogger from './src/utils/logger'

const logger = getLogger('db-cleanup-script')

async function main() {
  console.log('🧹 Database Cleanup and User Re-initialization')
  console.log('===============================================')
  console.log('⚠️  WARNING: This will delete ALL existing users!')
  console.log(`Time: ${new Date().toISOString()}\n`)

  let client = null

  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB Atlas...')
    client = await connectToCluster()
    const db = connectToDb(client)
    // Get the users collection
    const usersCollection = db.collection('users')
    // Count existing users
    const existingCount = await usersCollection.countDocuments()

    console.log(`📊 Found ${existingCount} existing users in database`)

    if (existingCount > 0) {
      console.log('\n🗑️  Deleting all existing users...')
      const deleteResult = await usersCollection.deleteMany({})

      console.log(`✅ Deleted ${deleteResult.deletedCount} users`)
    }

    // Verify cleanup
    const remainingCount = await usersCollection.countDocuments()

    if (remainingCount > 0) {
      console.log(`⚠️  Warning: ${remainingCount} users still remain in database`)
    } else {
      console.log('✅ Database cleanup completed - no users remaining')
    }

    // Close the direct connection before using services
    await closeConnection(client)
    client = null

    console.log('\n🚀 Re-initializing default users...')

    // Use the initialization service to create fresh users
    const initService = InitializationService.getInstance()

    await initService.initializeApplication()

    console.log('✅ Default users re-initialization completed!')

    // Verify the new users
    console.log('\n🔍 Verifying new users...')
    const userService = UserService.getInstance()
    const newUsers = await userService.getAllUsers()

    console.log(`📊 Created ${newUsers.length} new users:`)
    newUsers.forEach(user => {
      console.log(`   ✅ ${user.username} (${user.role}) - Active: ${user.isActive}`)
    })

    // Test authentication for each default user
    console.log('\n🔐 Testing authentication for default users...')
    const defaultCredentials = [
      { username: 'admin', password: 'admin123!' },
      { username: 'user', password: 'user123!' },
      { username: 'carlo', password: 'carlo123!' },
      { username: 'viewer', password: 'viewer123!' }
    ]

    for (const cred of defaultCredentials) {
      try {
        const authenticatedUser = await userService.authenticateUser(cred.username, cred.password)

        if (authenticatedUser) {
          console.log(`   ✅ Authentication SUCCESS: ${cred.username}`)
        } else {
          console.log(`   ❌ Authentication FAILED: ${cred.username}`)
        }
      } catch (error) {
        console.log(`   ❌ Authentication ERROR: ${cred.username} - ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    console.log('\n🎉 Database cleanup and re-initialization completed successfully!')
    console.log('')
    console.log('📋 Summary:')
    console.log('===========')
    console.log('✅ Old corrupted users: DELETED')
    console.log('✅ New default users: CREATED')
    console.log('✅ Authentication: TESTED')
    console.log('')
    console.log('🎯 Next steps:')
    console.log('   • Wait 15 minutes for rate limiting to reset')
    console.log('   • Test login with: npm run test:auth')
    console.log('   • Use the UI or API to authenticate')
    console.log('   • Default credentials:')
    console.log('     - admin / admin123!')
    console.log('     - user / user123!')
    console.log('     - carlo / carlo123!')
    console.log('     - viewer / viewer123!')

  } catch (error) {
    logger.error('Cleanup failed:', error instanceof Error ? error.message : String(error))
    console.error('\n❌ Cleanup failed:', error instanceof Error ? error.message : String(error))
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

// Run the script with confirmation
console.log('⚠️  This script will DELETE ALL USERS in the database!')
console.log('⚠️  Are you sure you want to continue? (Press Ctrl+C to cancel)')
console.log('⚠️  Starting in 3 seconds...')

setTimeout(() => {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}, 3000)

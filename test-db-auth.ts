/**
 * Direct database authentication test
 * This script tests authentication directly against the database
 */

import { UserService } from './src/services/UserService'
import getLogger from './src/utils/logger'

const logger = getLogger('auth-test-script')
const TEST_CREDENTIALS = [
  { username: 'admin', password: 'admin123!' },
  { username: 'user', password: 'user123!' },
  { username: 'carlo', password: 'carlo123!' },
  { username: 'viewer', password: 'viewer123!' }
]

async function main() {
  console.log('🔐 Direct Database Authentication Test')
  console.log('=====================================')
  console.log(`Time: ${new Date().toISOString()}\n`)

  try {
    const userService = UserService.getInstance()

    // First, let's list all users to see what's in the database
    console.log('📋 Checking users in database...')
    try {
      const allUsers = await userService.getAllUsers(true) // Include inactive users

      console.log(`Found ${allUsers.length} users in database:`)

      allUsers.forEach(user => {
        console.log(`   • ${user.username} (${user.role}) - Active: ${user.isActive}`)
      })
      console.log('')
    } catch (error) {
      console.error('❌ Failed to get users from database:', error instanceof Error ? error.message : String(error))

      return
    }

    // Now test authentication for each credential
    console.log('🔐 Testing authentication...')
    for (const cred of TEST_CREDENTIALS) {
      try {
        console.log(`   Testing: ${cred.username}...`)

        // First check if user exists
        const user = await userService.getUserByUsername(cred.username)

        if (!user) {
          console.log(`   ❌ User ${cred.username} not found in database`)
          continue
        }

        console.log(`   ✅ User ${cred.username} exists in database`)
        console.log(`      - Role: ${user.role}`)
        console.log(`      - Active: ${user.isActive}`)
        console.log(`      - Email: ${user.email}`)

        // Test authentication
        const authenticatedUser = await userService.authenticateUser(cred.username, cred.password)

        if (authenticatedUser) {
          console.log(`   ✅ Authentication SUCCESS for ${cred.username}`)
        } else {
          console.log(`   ❌ Authentication FAILED for ${cred.username} - Password incorrect`)
        }

      } catch (error) {
        if (error instanceof Error && error.message.includes('locked')) {
          console.log(`   ⚠️  Account ${cred.username} is LOCKED: ${error.message}`)
        } else {
          console.log(`   ❌ Authentication ERROR for ${cred.username}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      console.log('') // Empty line for readability
    }

    console.log('📊 Summary & Recommendations:')
    console.log('============================')
    console.log('1. Check the results above to identify the issue:')
    console.log('   • If users are missing: Run initialization again')
    console.log('   • If passwords fail: Check environment variables')
    console.log('   • If accounts are locked: Wait or unlock them')
    console.log('')
    console.log('2. Environment variables to check:')
    console.log('   • DEFAULT_ADMIN_PASSWORD')
    console.log('   • DEFAULT_USER_PASSWORD')
    console.log('   • DEFAULT_CARLO_PASSWORD')
    console.log('   • DEFAULT_VIEWER_PASSWORD')
    console.log('')
    console.log('3. Production considerations:')
    console.log('   • Production may use different passwords via env vars')
    console.log('   • Check Google Cloud environment configuration')
    console.log('   • Verify MongoDB Atlas connection and data')

  } catch (error) {
    logger.error('Test failed:', error instanceof Error ? error.message : String(error))
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('Error details:', error.stack)
    }
    process.exit(1)
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

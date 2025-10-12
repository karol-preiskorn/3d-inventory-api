/**
 * Script to add admin role to the admin user
 * Run with: npx tsx add-admin-role.ts
 */

import { MongoClient } from 'mongodb'
import config from './src/utils/config'
import getLogger from './src/utils/logger'

const logger = getLogger('add-admin-role')

async function main() {
  console.log('🔧 Adding Admin Role to Admin User')
  console.log('====================================')
  console.log(`Time: ${new Date().toISOString()}\n`)

  let client: MongoClient | null = null

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...')
    client = new MongoClient(config.ATLAS_URI)
    await client.connect()
    console.log('✅ Connected to MongoDB\n')

    const db = client.db(config.DBNAME)
    const usersCollection = db.collection('users')

    // Find admin user
    console.log('📋 Checking admin user...')
    const adminUser = await usersCollection.findOne({ username: 'admin' })

    if (!adminUser) {
      console.error('❌ Admin user not found in database')
      console.log('\n💡 Tip: Run "npm run init:users" to create default users')
      process.exit(1)
    }

    console.log('✅ Admin user found:')
    console.log(`   - Username: ${adminUser.username}`)
    console.log(`   - Current Role: ${adminUser.role || '(none)'}`)
    console.log(`   - Email: ${adminUser.email}`)
    console.log(`   - Active: ${adminUser.isActive}`)

    // Check if already has admin role
    if (adminUser.role === 'admin') {
      console.log('\n✅ Admin user already has admin role!')
      console.log('ℹ️  No update needed.')
    } else {
      // Update admin user with admin role
      console.log('\n🔄 Updating admin user role to "admin"...')

      const result = await usersCollection.updateOne(
        { username: 'admin' },
        {
          $set: {
            role: 'admin',
            updatedAt: new Date()
          }
        }
      )

      if (result.modifiedCount > 0) {
        console.log('✅ Admin role added successfully!')

        // Verify the update
        const updatedUser = await usersCollection.findOne({ username: 'admin' })

        console.log('\n📋 Updated user details:')
        console.log(`   - Username: ${updatedUser?.username}`)
        console.log(`   - Role: ${updatedUser?.role}`)
        console.log(`   - Email: ${updatedUser?.email}`)
      } else {
        console.log('⚠️  No changes made (user might already have admin role)')
      }
    }

    console.log('\n✅ Operation completed successfully!')
    console.log('\n🎯 Next steps:')
    console.log('   1. Login with admin credentials')
    console.log('   2. Access /admin/users should now work')
    console.log('   3. Verify admin role is displayed in profile')

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error(errorMessage)
    console.error('\n❌ Failed to add admin role:', errorMessage)
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  } finally {
    // Close MongoDB connection
    if (client) {
      await client.close()
      console.log('\n🔌 MongoDB connection closed')
    }
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})

/**
 * Reset admin password script
 * This script resets the admin password to admin123!
 */

import bcrypt from 'bcrypt'
import { Db, MongoClient } from 'mongodb'
import { closeConnection, connectToCluster, connectToDb } from './src/utils/db'
import getLogger from './src/utils/logger'

const logger = getLogger('reset-admin-password')
const SALT_ROUNDS = 12

async function main() {
  console.log('🔑 Resetting Admin Password')
  console.log('============================')
  console.log(`Time: ${new Date().toISOString()}\n`)

  let client: MongoClient | null = null

  try {
    // Connect to database
    client = await connectToCluster()
    const db: Db = connectToDb(client)
    const usersCollection = db.collection('users')

    // Get admin user
    console.log('📋 Checking admin user...')
    const adminUser = await usersCollection.findOne({ username: 'admin' })

    if (!adminUser) {
      console.error('❌ Admin user not found in database')
      process.exit(1)
    }

    console.log('✅ Admin user found:')
    console.log(`   - Username: ${adminUser.username}`)
    console.log(`   - Role: ${adminUser.role}`)
    console.log(`   - Email: ${adminUser.email}`)

    // Hash the new password
    const newPassword = 'admin123!'

    console.log(`\n🔑 Hashing new password: ${newPassword}`)
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    // Update password and unlock account
    console.log('💾 Updating password in database...')
    const result = await usersCollection.updateOne(
      { username: 'admin' },
      {
        $set: {
          password: hashedPassword,
          loginAttempts: 0,
          lockUntil: null,
          updatedAt: new Date()
        }
      }
    )

    if (result.modifiedCount > 0) {
      console.log('✅ Admin password reset successfully!')
      console.log('   - Password: admin123!')
      console.log('   - Login attempts reset to 0')
      console.log('   - Account unlocked')
      console.log('\n🎉 You can now login with:')
      console.log('   Username: admin')
      console.log('   Password: admin123!')
    } else {
      console.log('⚠️  No changes made')
    }

    // Verify password works
    console.log('\n🔍 Verifying new password...')
    const updatedUser = await usersCollection.findOne({ username: 'admin' })

    if (updatedUser) {
      const isValid = await bcrypt.compare(newPassword, updatedUser.password)

      if (isValid) {
        console.log('✅ Password verification SUCCESSFUL')
      } else {
        console.error('❌ Password verification FAILED')
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error(`Error resetting admin password: ${errorMessage}`)
    console.error('❌ Error:', errorMessage)
    process.exit(1)
  } finally {
    if (client) {
      await closeConnection(client)
    }
  }

  process.exit(0)
}

main()

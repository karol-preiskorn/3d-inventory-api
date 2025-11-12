/**
 * Unlock admin account script
 * This script unlocks the admin account by resetting failed login attempts
 */

import { Db, MongoClient } from 'mongodb'
import { closeConnection, connectToCluster, connectToDb } from './src/utils/db'
import getLogger from './src/utils/logger'

const logger = getLogger('unlock-admin-script')

async function main() {
  console.log('🔓 Unlocking Admin Account')
  console.log('===========================')
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
    console.log(`   - Active: ${adminUser.isActive}`)
    console.log(`   - Email: ${adminUser.email}`)
    console.log(`   - Login attempts: ${adminUser.loginAttempts || 0}`)

    if (adminUser.lockUntil) {
      const lockDate = new Date(adminUser.lockUntil)
      const now = new Date()
      const isLocked = lockDate > now

      console.log(`   - Lock until: ${lockDate.toISOString()}`)
      console.log(`   - Currently locked: ${isLocked ? '🔒 YES' : '✅ NO'}`)

      if (isLocked) {
        const minutesRemaining = Math.ceil((lockDate.getTime() - now.getTime()) / (1000 * 60))

        console.log(`   - Time remaining: ${minutesRemaining} minutes`)
      }
    }

    // Unlock the account by resetting login attempts and lockUntil
    console.log('\n🔓 Unlocking admin account...')
    const result = await usersCollection.updateOne(
      { username: 'admin' },
      {
        $set: {
          loginAttempts: 0,
          lockUntil: null,
          updatedAt: new Date()
        }
      }
    )

    if (result.modifiedCount > 0) {
      console.log('✅ Admin account unlocked successfully!')
      console.log('   - Login attempts reset to 0')
      console.log('   - Lock removed')
      console.log('\n🎉 You can now login with: admin / admin123!')
    } else {
      console.log('⚠️  No changes made (account may already be unlocked)')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error(`Error unlocking admin account: ${errorMessage}`)
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

/**
 * @file verify-admin-access.ts
 * @description Verify admin user can access admin area
 */

import { Collection, Db, MongoClient } from 'mongodb'
import config from './src/utils/config'
import getLogger from './src/utils/logger'

const logger = getLogger('verify-admin-access')

interface User {
  _id?: string
  username: string
  email: string
  role?: string
  permissions?: string[]
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

async function verifyAdminAccess(): Promise<void> {
  console.log('\n🔍 ADMIN ACCESS VERIFICATION')
  console.log('====================================')
  console.log('Time:', new Date().toISOString())
  console.log()

  let client: MongoClient | null = null

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...')
    client = new MongoClient(config.ATLAS_URI)
    await client.connect()
    console.log('✅ Connected to MongoDB')
    console.log()

    // Get database and collection
    const db: Db = client.db(config.DBNAME)
    const usersCollection: Collection<User> = db.collection('users')

    // Find admin user
    console.log('📋 Searching for admin user...')
    const adminUser = await usersCollection.findOne({ username: 'admin' })

    if (!adminUser) {
      console.log('❌ Admin user not found in database!')
      console.log()
      console.log('💡 Please run: npm run init:users')

      return
    }

    console.log('✅ Admin user found!')
    console.log()

    // Display user details
    console.log('📄 USER DETAILS:')
    console.log('================')
    console.log('   Username:', adminUser.username)
    console.log('   Email:', adminUser.email)
    console.log('   Role:', adminUser.role || '⚠️  NOT SET')
    console.log('   Active:', adminUser.isActive ? '✅ Yes' : '❌ No')
    console.log('   Created:', adminUser.createdAt?.toISOString() || 'N/A')
    console.log('   Updated:', adminUser.updatedAt?.toISOString() || 'N/A')
    console.log()

    // Display permissions
    const permissionCount = adminUser.permissions?.length || 0

    console.log('🔑 PERMISSIONS:', permissionCount)
    console.log('================')
    if (permissionCount > 0 && adminUser.permissions) {
      adminUser.permissions.forEach((perm, idx) => {
        console.log(`   ${(idx + 1).toString().padStart(2, '0')}. ${perm}`)
      })
    } else {
      console.log('   ⚠️  No permissions set')
    }
    console.log()

    // Access verification
    console.log('🚦 ACCESS VERIFICATION:')
    console.log('================')

    const hasAdminRole = adminUser.role === 'admin'
    const isActive = adminUser.isActive === true

    console.log('   Has admin role:', hasAdminRole ? '✅ YES' : '❌ NO')
    console.log('   Account active:', isActive ? '✅ YES' : '❌ NO')
    console.log()

    if (hasAdminRole && isActive) {
      console.log('✅ ADMIN ACCESS: GRANTED')
      console.log('================')
      console.log('   ✅ AdminGuard will allow access')
      console.log('   ✅ Can access /admin/users route')
      console.log('   ✅ Can manage users')
      console.log('   ✅ Has full admin permissions')
    } else {
      console.log('❌ ADMIN ACCESS: DENIED')
      console.log('================')

      if (!hasAdminRole) {
        console.log('   ❌ Missing admin role')
        console.log('   💡 Fix: Run npm run add:admin-role')
      }

      if (!isActive) {
        console.log('   ❌ Account is inactive')
        console.log('   💡 Fix: Run npm run unlock:admin')
      }
    }
    console.log()

    // AdminGuard simulation
    console.log('🛡️  ADMINGUARD SIMULATION:')
    console.log('================')
    console.log('   Check: user?.role === "admin"')
    console.log('   Result:', adminUser.role, '=== "admin"')
    console.log('   Outcome:', hasAdminRole ? '✅ PASS (Access Granted)' : '❌ FAIL (Access Denied)')
    console.log()

    if (!hasAdminRole) {
      console.log('⚠️  WARNING:')
      console.log('   User will see: "Access denied: User admin attempted to')
      console.log('   access admin area without admin role"')
      console.log()
    }

    // Next steps
    console.log('🎯 NEXT STEPS:')
    console.log('================')

    if (hasAdminRole && isActive) {
      console.log('   1. ✅ Admin user is ready')
      console.log('   2. Login with: username=admin, password=admin123!')
      console.log('   3. Navigate to: http://localhost:4200/admin/users')
      console.log('   4. Verify access is granted')
    } else {
      console.log('   1. Fix issues identified above')
      console.log('   2. Re-run this verification script')
      console.log('   3. Then test admin access')
    }
    console.log()

    console.log('✅ Verification completed!')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error(errorMessage)

    console.log()
    console.log('❌ Failed to verify admin access')
    console.log('Error:', errorMessage)
    console.log()
    console.log('💡 Troubleshooting:')
    console.log('   1. Check MongoDB connection')
    console.log('   2. Verify .env configuration')
    console.log('   3. Run: npm run test:db-auth')
  } finally {
    if (client) {
      console.log('🔌 Closing MongoDB connection...')
      await client.close()
      console.log('✅ Connection closed')
      console.log()
    }
  }
}

// Run verification
verifyAdminAccess().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

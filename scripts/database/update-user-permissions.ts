/**
 * @file update-user-permissions.ts
 * @description Update user permissions to include all new permissions based on their role
 *
 * This script:
 * 1. Reads each user's current permissions
 * 2. Determines their role based on existing permissions
 * 3. Updates them with the full set of permissions for that role
 *
 * Usage: npx tsx update-user-permissions.ts
 */

import { Db, MongoClient } from 'mongodb'
import config from './src/utils/config.js'
import getLogger from './src/utils/logger.js'

const logger = getLogger('update-permissions')
// Full permission sets for each role
const ADMIN_PERMISSIONS = [
  'device:read',
  'device:create',
  'device:update',
  'device:delete',
  'model:read',
  'model:create',
  'model:update',
  'model:delete',
  'connection:read',
  'connection:create',
  'connection:update',
  'connection:delete',
  'attribute:read',
  'attribute:create',
  'attribute:update',
  'attribute:delete',
  'floor:read',
  'floor:create',
  'floor:update',
  'floor:delete',
  'user:read',
  'user:create',
  'user:update',
  'user:delete',
  'log:read',
  'log:create',
  'log:delete',
  'admin:full'
]
const USER_PERMISSIONS = [
  'device:read',
  'device:create',
  'device:update',
  'model:read',
  'model:create',
  'model:update',
  'connection:read',
  'connection:create',
  'connection:update',
  'attribute:read',
  'floor:read',
  'log:read'
]
const VIEWER_PERMISSIONS = [
  'device:read',
  'model:read',
  'connection:read',
  'attribute:read',
  'floor:read',
  'log:read'
]

/**
 * Determine user role based on current permissions
 */
function determineRole(permissions: string[]): 'admin' | 'user' | 'viewer' {
  const hasAdminPermission = permissions.some(p =>
    p === 'admin:full' || p === 'admin:access' ||
    p === 'user:create' || p === 'user:delete'
  )

  if (hasAdminPermission) {
    return 'admin'
  }

  const hasWritePermission = permissions.some(p =>
    p.includes(':create') || p.includes(':update') || p.includes(':delete')
  )

  return hasWritePermission ? 'user' : 'viewer'
}

/**
 * Get permissions for role
 */
function getPermissionsForRole(role: string): string[] {
  switch (role) {
  case 'admin':
    return ADMIN_PERMISSIONS
  case 'user':
    return USER_PERMISSIONS
  case 'viewer':
    return VIEWER_PERMISSIONS
  default:
    return USER_PERMISSIONS
  }
}

/**
 * Main update function
 */
async function updateUserPermissions(): Promise<void> {
  let client: MongoClient | null = null

  try {
    console.log('🚀 Starting user permissions update...')
    console.log(`📡 Connecting to: ${config.DBNAME}`)

    client = new MongoClient(config.ATLAS_URI)
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db: Db = client.db(config.DBNAME)
    const usersCollection = db.collection('users')
    // Get all users
    const users = await usersCollection.find({}).toArray()

    console.log(`📋 Found ${users.length} users to update\n`)

    let successCount = 0
    let errorCount = 0

    for (const user of users) {
      try {
        const username = user.username || user.name

        console.log(`🔄 Processing user: ${username}`)

        const currentPermissions = user.permissions || []

        console.log(`   Current permissions (${currentPermissions.length}):`, JSON.stringify(currentPermissions))

        // Determine role
        const role = user.role || determineRole(currentPermissions)

        console.log(`   Detected role: ${role}`)

        // Get full permissions for role
        const newPermissions = getPermissionsForRole(role)

        console.log(`   New permissions (${newPermissions.length}):`, JSON.stringify(newPermissions))

        // Update user
        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              permissions: newPermissions,
              role: role,
              updatedAt: new Date()
            }
          }
        )

        console.log(`✅ Successfully updated user: ${username}`)
        console.log(`   Added ${newPermissions.length - currentPermissions.length} new permissions\n`)
        successCount++

      } catch (error) {
        console.error(`❌ Error updating user ${user.username || user.name}:`, error)
        errorCount++
      }
    }

    console.log('\n📊 Update Summary:')
    console.log(`   Total users processed: ${users.length}`)
    console.log(`   ✅ Successfully updated: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log('🎉 Update completed successfully!')

  } catch (error) {
    logger.error('Fatal error during permission update:', error)
    throw error
  } finally {
    if (client) {
      await client.close()
      console.log('\n🔌 Disconnected from MongoDB')
    }
  }
}

// Run the update
updateUserPermissions()
  .then(() => {
    console.log('\n✅ Permission update script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Permission update script failed:', error)
    process.exit(1)
  })

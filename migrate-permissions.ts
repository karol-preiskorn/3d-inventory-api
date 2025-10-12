/**
 * @file migrate-permissions.ts
 * @description Migration script to convert old permission format to new format in MongoDB
 *
 * Old format: ["read:devices", "write:devices", "delete:devices"]
 * New format: ["device:read", "device:create", "device:delete"]
 *
 * Usage: ts-node migrate-permissions.ts
 */

import { Db, MongoClient } from 'mongodb'
import config from './src/utils/config.js'
import getLogger from './src/utils/logger.js'

const logger = getLogger('permission-migration')
// Permission mapping from old format to new format
const PERMISSION_MAPPING: { [key: string]: string } = {
  // Device permissions
  'read:devices': 'device:read',
  'write:devices': 'device:create',
  'delete:devices': 'device:delete',

  // Model permissions
  'read:models': 'model:read',
  'write:models': 'model:create',
  'delete:models': 'model:delete',

  // Connection permissions
  'read:connections': 'connection:read',
  'write:connections': 'connection:create',
  'delete:connections': 'connection:delete',

  // Log permissions
  'read:logs': 'log:read',
  'delete:logs': 'log:delete',

  // Admin permissions
  'admin:access': 'admin:full'
}

/**
 * Normalize old permission format to new format
 */
function normalizePermission(oldPermission: string): string {
  return PERMISSION_MAPPING[oldPermission] || oldPermission
}

/**
 * Main migration function
 */
async function migratePermissions(): Promise<void> {
  let client: MongoClient | null = null

  try {
    logger.info('🚀 Starting permission migration...')
    logger.info(`📡 Connecting to: ${config.DBNAME}`)

    // Connect to MongoDB
    client = new MongoClient(config.ATLAS_URI)
    await client.connect()
    logger.info('✅ Connected to MongoDB')

    const db: Db = client.db(config.DBNAME)
    const usersCollection = db.collection('users')
    // Find all users with old permission format
    const users = await usersCollection.find({}).toArray()

    logger.info(`📋 Found ${users.length} users to check`)

    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const user of users) {
      try {
        const oldPermissions = user.permissions || []
        // Check if user has any old format permissions
        const hasOldFormat = oldPermissions.some((p: string) =>
          Object.keys(PERMISSION_MAPPING).includes(p)
        )

        if (!hasOldFormat) {
          logger.info(`⏭️  Skipping user ${user.username} - already using new format`)
          skippedCount++
          continue
        }

        // Normalize all permissions
        const newPermissions = oldPermissions.map((p: string) => normalizePermission(p))
        // Remove duplicates
        const uniquePermissions = Array.from(new Set(newPermissions))

        logger.info(`🔄 Migrating user: ${user.username}`)
        logger.info(`   Old permissions: ${JSON.stringify(oldPermissions)}`)
        logger.info(`   New permissions: ${JSON.stringify(uniquePermissions)}`)

        // Update user in database
        const result = await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              permissions: uniquePermissions,
              updatedAt: new Date()
            }
          }
        )

        if (result.modifiedCount === 1) {
          logger.info(`✅ Successfully migrated user: ${user.username}`)
          migratedCount++
        } else {
          logger.warn(`⚠️  User ${user.username} was not modified`)
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        logger.error(`❌ Error migrating user ${user.username}: ${errorMessage}`)
        errorCount++
      }
    }

    // Summary
    logger.info('\n' + '='.repeat(60))
    logger.info('📊 Migration Summary:')
    logger.info(`   Total users checked: ${users.length}`)
    logger.info(`   ✅ Successfully migrated: ${migratedCount}`)
    logger.info(`   ⏭️  Skipped (already new format): ${skippedCount}`)
    logger.info(`   ❌ Errors: ${errorCount}`)
    logger.info('='.repeat(60))

    if (errorCount === 0) {
      logger.info('🎉 Migration completed successfully!')
    } else {
      logger.warn('⚠️  Migration completed with errors. Please review the logs.')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error(`❌ Fatal error during migration: ${errorMessage}`)
    throw error
  } finally {
    if (client) {
      await client.close()
      logger.info('🔌 Disconnected from MongoDB')
    }
  }
}

// Run migration with error handling
migratePermissions()
  .then(() => {
    logger.info('✅ Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error(`❌ Migration script failed: ${errorMessage}`)
    process.exit(1)
  })

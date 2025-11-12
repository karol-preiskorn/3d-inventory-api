/**
 * TypeScript script to initialize default users
 * Run with: npx tsx init-users.ts
 */

import { InitializationService } from './src/services/InitializationService'
import getLogger from './src/utils/logger'

const logger = getLogger('init-users-script')

async function main() {
  console.log('🚀 3D Inventory API User Initialization')
  console.log('========================================')
  console.log(`Time: ${new Date().toISOString()}\n`)

  try {
    const initService = InitializationService.getInstance()

    console.log('🔍 Checking if initialization is needed...')
    const needsInit = await initService.isInitializationNeeded()

    if (needsInit) {
      console.log('✅ Initialization needed. Starting initialization...\n')
      await initService.initializeApplication()
      console.log('\n✅ Application initialization completed successfully!')
    } else {
      console.log('ℹ️  Application already initialized. No action needed.')
    }

    console.log('\n📋 Summary:')
    console.log('===========')
    console.log('✅ User initialization process completed')
    console.log('ℹ️  Default users should now be available:')
    console.log('   • admin (password: admin123!)')
    console.log('   • user (password: user123!)')
    console.log('   • carlo (password: carlo123!)')
    console.log('   • viewer (password: viewer123!)')
    console.log('')
    console.log('🎯 Next steps:')
    console.log('   • Wait 15 minutes for rate limiting to reset')
    console.log('   • Test login with: npm run test:auth')
    console.log('   • Use the UI or API to authenticate')

  } catch (error) {
    logger.error('Initialization failed:', error)
    console.error('\n❌ Initialization failed:', error instanceof Error ? error.message : String(error))
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

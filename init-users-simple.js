#!/usr/bin/env node

/**
 * Simple script to initialize default users using the existing InitializationService
 * This uses tsx to run TypeScript directly without compilation
 */

import('./src/services/InitializationService.js').then(async ({ InitializationService }) => {
  console.log('🚀 Starting 3D Inventory API User Initialization')
  console.log('================================================')
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
    console.error('\n❌ Initialization failed:', error.message)
    console.error('Error details:', error.stack)
    process.exit(1)
  }
}).catch(error => {
  console.error('Failed to load InitializationService:', error.message)
  console.error('Make sure the project is built with: npm run build')
  process.exit(1)
})

#!/usr/bin/env node

/**
 * Test script to validate Jest cleanup fix
 * Tests if Jest exits cleanly without open handles
 */

const { spawn } = require('child_process')

console.log('🧪 Testing Jest cleanup fix...')

// Test individual test files
const testFiles = [
  'src/tests/db.utils.test.ts',
  'src/tests/db.advanced.test.ts'
]

async function runTest(testFile) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 Running test: ${testFile}`)

    const jest = spawn('npm', ['test', '--', '--detectOpenHandles', testFile], {
      cwd: process.cwd(),
      stdio: 'pipe'
    })

    let output = ''
    let errorOutput = ''

    jest.stdout.on('data', (data) => {
      output += data.toString()
    })

    jest.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    const timeout = setTimeout(() => {
      jest.kill('SIGTERM')
      reject(new Error(`Test ${testFile} timed out after 30 seconds`))
    }, 30000)

    jest.on('close', (code) => {
      clearTimeout(timeout)

      if (code === 0) {
        console.log(`✅ ${testFile} - PASSED (exit code: ${code})`)
        console.log(`   Output: ${output.match(/Tests:.*passed/)?.[0] || 'Test completed'}`)
        resolve({ file: testFile, success: true, code, output })
      } else {
        console.log(`❌ ${testFile} - FAILED (exit code: ${code})`)
        console.log(`   Error: ${errorOutput.slice(0, 200)}`)
        resolve({ file: testFile, success: false, code, output, error: errorOutput })
      }
    })

    jest.on('error', (err) => {
      clearTimeout(timeout)
      console.log(`💥 ${testFile} - ERROR: ${err.message}`)
      reject(err)
    })
  })
}

async function main() {
  const results = []

  for (const testFile of testFiles) {
    try {
      const result = await runTest(testFile)
      results.push(result)
    } catch (error) {
      console.error(`Failed to run ${testFile}:`, error.message)
      results.push({ file: testFile, success: false, error: error.message })
    }
  }

  console.log('\n📊 Test Results Summary:')
  console.log('========================')

  const successful = results.filter(r => r.success).length
  const total = results.length

  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} - ${result.file}`)
  })

  console.log(`\n🎯 Results: ${successful}/${total} tests passed`)

  if (successful === total) {
    console.log('🎉 SUCCESS: All tests exit cleanly without open handles!')
    console.log('✨ The Jest cleanup fix is working correctly.')
  } else {
    console.log('⚠️  Some tests still have issues. Check the output above.')
  }

  process.exit(successful === total ? 0 : 1)
}

main().catch(error => {
  console.error('Script failed:', error)
  process.exit(1)
})

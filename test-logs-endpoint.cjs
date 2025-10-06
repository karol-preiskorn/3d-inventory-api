#!/usr/bin/env node

/**
 * Test script to verify the logs API endpoints are working correctly
 * This will test the device logs functionality after fixing the URL paths
 */

const https = require('https')

const API_BASE = 'https://3d-inventory.ultimasolution.pl'
const TEST_DEVICE_ID = '68cfcae6dab0e8398f8f29f0' // From earlier testing

// Test credentials
const TEST_USER = 'carlo'
const TEST_PASSWORD = 'carlo123!'

let authToken = null

/**
 * Make authenticated API call
 */
function makeApiCall(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path)
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''

      res.on('data', (chunk) => {
        responseData += chunk
      })

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData)
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers })
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData, headers: res.headers })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

/**
 * Authenticate and get token
 */
async function authenticate() {
  console.log('🔐 Authenticating...')
  
  try {
    const response = await makeApiCall('/login', 'POST', {
      username: TEST_USER,
      password: TEST_PASSWORD
    })

    if (response.status === 200 && response.data.token) {
      authToken = response.data.token
      console.log('✅ Authentication successful')
      return true
    } else {
      console.log('❌ Authentication failed:', response.data)
      return false
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message)
    return false
  }
}

/**
 * Test getting all logs
 */
async function testGetAllLogs() {
  console.log('\n📋 Testing GET /logs (all logs)...')
  
  try {
    const response = await makeApiCall('/logs')
    
    if (response.status === 200) {
      const logCount = response.data.data ? response.data.data.length : 0
      console.log(`✅ Successfully retrieved ${logCount} logs`)
      return true
    } else {
      console.log('❌ Failed to get all logs:', response.status, response.data)
      return false
    }
  } catch (error) {
    console.log('❌ Error getting all logs:', error.message)
    return false
  }
}

/**
 * Test getting logs for specific device (fixed URL)
 */
async function testGetDeviceLogs() {
  console.log(`\n📊 Testing GET /logs/${TEST_DEVICE_ID} (device logs)...`)
  
  try {
    const response = await makeApiCall(`/logs/${TEST_DEVICE_ID}`)
    
    if (response.status === 200) {
      const logCount = response.data.data ? response.data.data.length : 0
      console.log(`✅ Successfully retrieved ${logCount} logs for device ${TEST_DEVICE_ID}`)
      
      if (logCount > 0) {
        const sampleLog = response.data.data[0]
        console.log('📝 Sample log entry:')
        console.log(`   - Operation: ${sampleLog.operation}`)
        console.log(`   - Component: ${sampleLog.component}`)
        console.log(`   - Date: ${new Date(sampleLog.date).toLocaleString()}`)
      }
      
      return true
    } else {
      console.log('❌ Failed to get device logs:', response.status, response.data)
      return false
    }
  } catch (error) {
    console.log('❌ Error getting device logs:', error.message)
    return false
  }
}

/**
 * Test getting logs by component
 */
async function testGetComponentLogs() {
  console.log('\n🔧 Testing GET /logs/component/devices (component logs)...')
  
  try {
    const response = await makeApiCall('/logs/component/devices')
    
    if (response.status === 200) {
      const logCount = response.data.data ? response.data.data.length : 0
      console.log(`✅ Successfully retrieved ${logCount} logs for 'devices' component`)
      
      if (logCount > 0) {
        // Group by operation
        const operations = {}
        response.data.data.forEach(log => {
          operations[log.operation] = (operations[log.operation] || 0) + 1
        })
        
        console.log('📊 Operations breakdown:')
        Object.entries(operations).forEach(([op, count]) => {
          console.log(`   - ${op}: ${count} entries`)
        })
      }
      
      return true
    } else {
      console.log('❌ Failed to get component logs:', response.status, response.data)
      return false
    }
  } catch (error) {
    console.log('❌ Error getting component logs:', error.message)
    return false
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('🧪 Testing Logs API Endpoints')
  console.log('==============================')
  
  // Authenticate first
  const authenticated = await authenticate()
  if (!authenticated) {
    console.log('\n❌ Cannot proceed without authentication')
    process.exit(1)
  }
  
  // Run tests
  const results = {
    allLogs: await testGetAllLogs(),
    deviceLogs: await testGetDeviceLogs(),
    componentLogs: await testGetComponentLogs()
  }
  
  // Summary
  console.log('\n📈 Test Results Summary:')
  console.log('========================')
  console.log(`✅ Get All Logs: ${results.allLogs ? 'PASS' : 'FAIL'}`)
  console.log(`✅ Get Device Logs: ${results.deviceLogs ? 'PASS' : 'FAIL'}`)
  console.log(`✅ Get Component Logs: ${results.componentLogs ? 'PASS' : 'FAIL'}`)
  
  const passCount = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 Overall: ${passCount}/${totalTests} tests passed`)
  
  if (passCount === totalTests) {
    console.log('🎉 All logs API endpoints are working correctly!')
    console.log('✅ The HTTP 500 error issue has been resolved.')
  } else {
    console.log('⚠️  Some tests failed - please check the API implementation.')
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test execution error:', error)
  process.exit(1)
})
#!/usr/bin/env node

/**
 * 3D Inventory API Authentication Tester
 * Tests the login functionality with various scenarios
 */

const https = require('https');
const http = require('http');

const API_URL = 'https://3d-inventory-api.ultimasolution.pl';
const LOGIN_ENDPOINT = '/login';

// Test credentials from the codebase
const TEST_CREDENTIALS = [
  { username: 'admin', password: 'admin123!', role: 'admin' },
  { username: 'user', password: 'user123!', role: 'user' },
  { username: 'carlo', password: 'carlo123!', role: 'user' },
  { username: 'viewer', password: 'viewer123!', role: 'viewer' }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const protocol = options.hostname.includes('https') || options.port === 443 ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testHealth() {
  log('\n🔍 Testing API Health...', 'blue');
  log('='.repeat(30), 'blue');
  
  try {
    const options = {
      hostname: '3d-inventory-api.ultimasolution.pl',
      port: 443,
      path: '/health',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };
    
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      log('✅ API Health Check: PASSED', 'green');
      log(`   Response: ${response.body}`);
    } else {
      log(`❌ API Health Check: FAILED (${response.statusCode})`, 'red');
      log(`   Response: ${response.body}`);
    }
  } catch (error) {
    log(`❌ API Health Check: ERROR - ${error.message}`, 'red');
  }
}

async function testLogin(username, password) {
  log(`\n🔐 Testing Login: ${username}`, 'yellow');
  log('-'.repeat(30), 'yellow');
  
  const postData = JSON.stringify({
    username: username,
    password: password
  });
  
  const options = {
    hostname: '3d-inventory-api.ultimasolution.pl',
    port: 443,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'NodeJS-API-Tester/1.0'
    }
  };
  
  try {
    const response = await makeRequest(options, postData);
    
    log(`   Status Code: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      log('   ✅ Login: SUCCESS', 'green');
      try {
        const responseData = JSON.parse(response.body);
        log(`   Token: ${responseData.token ? responseData.token.substring(0, 20) + '...' : 'Not found'}`);
        log(`   User: ${responseData.user ? responseData.user.username : 'Not found'}`);
        log(`   Role: ${responseData.user ? responseData.user.role : 'Not found'}`);
      } catch (parseError) {
        log(`   Response (raw): ${response.body}`, 'cyan');
      }
    } else if (response.statusCode === 401) {
      log('   ❌ Login: UNAUTHORIZED', 'red');
      try {
        const errorData = JSON.parse(response.body);
        log(`   Error: ${errorData.message || errorData.error || 'Unknown error'}`);
      } catch (parseError) {
        log(`   Response (raw): ${response.body}`, 'cyan');
      }
    } else if (response.statusCode === 429) {
      log('   ⚠️  Login: RATE LIMITED', 'yellow');
      log(`   Response: ${response.body}`);
    } else if (response.statusCode === 500) {
      log('   ❌ Login: SERVER ERROR', 'red');
      log(`   Response: ${response.body}`);
    } else {
      log(`   ❓ Login: UNEXPECTED STATUS (${response.statusCode})`, 'magenta');
      log(`   Response: ${response.body}`);
    }
    
    // Log response headers for debugging
    log('   Response Headers:', 'cyan');
    Object.keys(response.headers).forEach(header => {
      log(`     ${header}: ${response.headers[header]}`, 'cyan');
    });
    
  } catch (error) {
    log(`   ❌ Login: ERROR - ${error.message}`, 'red');
    log(`   Error Details: ${error.stack}`);
  }
}

async function testInvalidCredentials() {
  log('\n🚫 Testing Invalid Credentials...', 'magenta');
  log('='.repeat(35), 'magenta');
  
  await testLogin('nonexistent', 'wrongpassword');
}

async function testMissingFields() {
  log('\n📝 Testing Missing Fields...', 'cyan');
  log('='.repeat(30), 'cyan');
  
  // Test missing password
  log('\n   Testing missing password...', 'cyan');
  const postData1 = JSON.stringify({ username: 'admin' });
  
  const options1 = {
    hostname: '3d-inventory-api.ultimasolution.pl',
    port: 443,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(postData1)
    }
  };
  
  try {
    const response1 = await makeRequest(options1, postData1);
    log(`   Status: ${response1.statusCode}`);
    log(`   Response: ${response1.body}`);
  } catch (error) {
    log(`   Error: ${error.message}`, 'red');
  }
  
  // Test missing username
  log('\n   Testing missing username...', 'cyan');
  const postData2 = JSON.stringify({ password: 'admin123!' });
  
  const options2 = {
    hostname: '3d-inventory-api.ultimasolution.pl',
    port: 443,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(postData2)
    }
  };
  
  try {
    const response2 = await makeRequest(options2, postData2);
    log(`   Status: ${response2.statusCode}`);
    log(`   Response: ${response2.body}`);
  } catch (error) {
    log(`   Error: ${error.message}`, 'red');
  }
}

async function main() {
  log('🚀 3D Inventory API Authentication Tester', 'blue');
  log('==========================================', 'blue');
  log(`Target: ${API_URL}`, 'blue');
  log(`Time: ${new Date().toISOString()}`, 'blue');
  
  try {
    // Test API health first
    await testHealth();
    
    // Test each credential
    for (const cred of TEST_CREDENTIALS) {
      await testLogin(cred.username, cred.password);
    }
    
    // Test invalid credentials
    await testInvalidCredentials();
    
    // Test missing fields
    await testMissingFields();
    
    log('\n📊 Summary & Recommendations', 'blue');
    log('============================', 'blue');
    log('1. If all tests show 401 Unauthorized:', 'yellow');
    log('   • Check if default users exist in database', 'yellow');
    log('   • Verify database connection in production', 'yellow');
    log('   • Check environment variables (JWT_SECRET, ATLAS_URI)', 'yellow');
    log('');
    log('2. If tests show 500 Internal Server Error:', 'yellow');
    log('   • Database connection issues', 'yellow');
    log('   • Check server logs in Google Cloud Console', 'yellow');
    log('   • Verify MongoDB Atlas configuration', 'yellow');
    log('');
    log('3. If tests show 429 Rate Limited:', 'yellow');
    log('   • Wait 15 minutes before retrying', 'yellow');
    log('   • Check rate limiting configuration', 'yellow');
    log('');
    log('4. Next debugging steps:', 'green');
    log('   • Run: npm run test:db (test database connection)', 'green');
    log('   • Check production logs in Google Cloud', 'green');
    log('   • Test locally with: npm run dev', 'green');
    log('   • Verify user initialization: npm run init:users', 'green');
    
  } catch (error) {
    log(`\n❌ Main execution error: ${error.message}`, 'red');
    log(error.stack, 'red');
  }
}

// Run the tests
main().catch(console.error);
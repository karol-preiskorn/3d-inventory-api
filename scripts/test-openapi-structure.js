#!/usr/bin/env node

/**
 * Test script to validate the modular OpenAPI specification
 */

import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const OPENAPI_DIR = path.join(__dirname, '../docs/openapi')

/**
 * Recursively resolve $ref references in an object
 */
function resolveRefs(obj, baseDir) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveRefs(item, baseDir))
  }

  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string') {
      try {
        const refPath = path.join(baseDir, value.replace('#/', '').replace('/', '/'))
        const refContent = fs.readFileSync(refPath, 'utf8')
        const refData = yaml.load(refContent)
        // Resolve nested refs in the loaded content
        Object.assign(result, resolveRefs(refData, baseDir))
      } catch (error) {
        console.error(`Error resolving ref: ${value}`, error.message)
        result[key] = value // Keep original ref if resolution fails
      }
    } else {
      result[key] = resolveRefs(value, baseDir)
    }
  }

  return result
}

/**
 * Validate OpenAPI specification structure
 */
function validateOpenAPISpec(spec) {
  const errors = []

  if (!spec.openapi) {
    errors.push('Missing openapi version')
  }

  if (!spec.info || !spec.info.title) {
    errors.push('Missing API title')
  }

  if (!spec.info || !spec.info.version) {
    errors.push('Missing API version')
  }

  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    errors.push('No paths defined')
  }

  if (!spec.components) {
    errors.push('No components defined')
  }

  return errors
}

/**
 * Main test function
 */
async function testOpenAPIModularStructure() {
  try {
    console.log('🧪 Testing OpenAPI Modular Structure...\n')

    // Load main API specification
    const mainSpecPath = path.join(OPENAPI_DIR, 'api.yaml')
    console.log(`📄 Loading main spec: ${mainSpecPath}`)

    if (!fs.existsSync(mainSpecPath)) {
      throw new Error(`Main API spec not found: ${mainSpecPath}`)
    }

    const mainSpecContent = fs.readFileSync(mainSpecPath, 'utf8')
    const mainSpec = yaml.load(mainSpecContent)

    console.log('✅ Main specification loaded successfully')
    console.log(`   - OpenAPI version: ${mainSpec.openapi}`)
    console.log(`   - API title: ${mainSpec.info?.title}`)
    console.log(`   - API version: ${mainSpec.info?.version}`)

    // Check for modular structure
    console.log('\n🔗 Checking for modular references...')

    const specString = JSON.stringify(mainSpec)
    const refCount = (specString.match(/\$ref/g) || []).length
    console.log(`   - Found ${refCount} $ref references`)

    if (refCount === 0) {
      console.log('⚠️  Warning: No $ref references found - specification may not be modular')
    }

    // Validate component files exist
    console.log('\n📁 Checking component files...')

    const expectedComponents = [
      'components/schemas/base-responses.yaml',
      'components/schemas/device.yaml',
      'components/responses/common.yaml',
      'components/parameters/common.yaml'
    ]

    let missingFiles = 0
    for (const component of expectedComponents) {
      const componentPath = path.join(OPENAPI_DIR, component)
      if (fs.existsSync(componentPath)) {
        console.log(`   ✅ ${component}`)
      } else {
        console.log(`   ❌ ${component} (missing)`)
        missingFiles++
      }
    }

    // Resolve all references (basic test)
    console.log('\n🔍 Testing reference resolution...')
    try {
      const resolvedSpec = resolveRefs(mainSpec, OPENAPI_DIR)
      console.log('✅ Reference resolution completed')

      // Basic validation
      const errors = validateOpenAPISpec(resolvedSpec)
      if (errors.length === 0) {
        console.log('✅ OpenAPI specification validation passed')
      } else {
        console.log('❌ OpenAPI specification validation errors:')
        errors.forEach(error => console.log(`   - ${error}`))
      }
    } catch (error) {
      console.log(`❌ Reference resolution failed: ${error.message}`)
    }

    // Summary
    console.log('\n📊 Test Summary:')
    console.log(`   - Modular references: ${refCount}`)
    console.log(`   - Missing component files: ${missingFiles}`)
    console.log(`   - Paths defined: ${Object.keys(mainSpec.paths || {}).length}`)
    console.log(`   - Components sections: ${Object.keys(mainSpec.components || {}).length}`)

    if (missingFiles === 0 && refCount > 0) {
      console.log('\n🎉 OpenAPI modular structure test PASSED!')
      return true
    } else {
      console.log('\n⚠️  OpenAPI modular structure test completed with warnings')
      return false
    }

  } catch (error) {
    console.error('❌ OpenAPI test failed:', error.message)
    return false
  }
}

// Run the test
testOpenAPIModularStructure()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Test execution failed:', error)
    process.exit(1)
  })

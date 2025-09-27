#!/usr/bin/env node

/**
 * OpenAPI Modular Builder
 *
 * This script builds the complete OpenAPI specification from modular components.
 * It resolves all $ref references and creates a single, complete specification file.
 */

import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, '..', 'docs', 'openapi'),
  outputDir: path.join(__dirname, '..', 'dist'),
  outputFile: 'openapi-spec.yaml',
  mainFile: 'api.yaml'
}

/**
 * Recursively resolve $ref references in OpenAPI document
 * @param {Object} obj - The object to process
 * @param {string} basePath - Base path for resolving relative references
 * @returns {Object} - Object with resolved references
 */
function resolveRefs(obj, basePath = CONFIG.sourceDir) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveRefs(item, basePath))
  }

  const result = {}

  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string') {
      // Resolve $ref reference
      const refPath = value.split('#')
      const filePath = refPath[0]
      const componentPath = refPath[1]

      if (filePath && !filePath.startsWith('http')) {
        // Resolve relative file path
        let fullFilePath
        if (filePath.startsWith('./') || filePath.startsWith('../')) {
          fullFilePath = path.resolve(basePath, filePath)
        } else {
          // Handle absolute paths from the schemas directory
          fullFilePath = path.resolve(basePath, filePath)
        }

        try {
          if (!fs.existsSync(fullFilePath)) {
            console.warn(`Warning: File not found: ${fullFilePath} (from reference: ${value})`)
            result[key] = value
            continue
          }

          const refContent = yaml.load(fs.readFileSync(fullFilePath, 'utf8'))

          if (componentPath) {
            // Navigate to specific component within the file
            const pathParts = componentPath.substring(1).split('/')
            let component = refContent

            for (const part of pathParts) {
              component = component[part]
            }

            result[key.replace('$ref', 'resolved')] = resolveRefs(component, path.dirname(fullFilePath))
            // Keep original $ref for documentation
            result[key] = value
          } else {
            // Return entire file content
            result[key.replace('$ref', 'resolved')] = resolveRefs(refContent, path.dirname(fullFilePath))
            result[key] = value
          }
        } catch (error) {
          console.warn(`Warning: Could not resolve reference ${value}: ${error.message}`)
          result[key] = value // Keep original reference if resolution fails
        }
      } else {
        result[key] = value // Keep HTTP references or invalid references as-is
      }
    } else {
      result[key] = resolveRefs(value, basePath)
    }
  }

  return result
}

/**
 * Flatten resolved references into inline definitions
 * @param {Object} obj - The object to process
 * @returns {Object} - Object with flattened definitions
 */
function flattenRefs(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => flattenRefs(item))
  }

  const result = {}

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'resolved' && obj['$ref']) {
      // Replace $ref with resolved content
      return flattenRefs(value)
    } else if (key === '$ref' && obj['resolved']) {
      // Skip $ref if we have resolved content
      continue
    } else {
      result[key] = flattenRefs(value)
    }
  }

  return result
}

/**
 * Build the complete OpenAPI specification
 */
function buildSpec() {
  console.log('🏗️  Building OpenAPI specification...')

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true })
    console.log(`✅ Created output directory: ${CONFIG.outputDir}`)
  }

  // Load main specification file
  const mainFilePath = path.join(CONFIG.sourceDir, CONFIG.mainFile)

  if (!fs.existsSync(mainFilePath)) {
    console.error(`❌ Main specification file not found: ${mainFilePath}`)
    process.exit(1)
  }

  console.log(`📖 Loading main specification: ${mainFilePath}`)
  const mainSpec = yaml.load(fs.readFileSync(mainFilePath, 'utf8'))

  // Resolve all $ref references
  console.log('🔗 Resolving $ref references...')
  const resolvedSpec = resolveRefs(mainSpec)

  // Flatten resolved references
  console.log('📋 Flattening resolved references...')
  const flattenedSpec = flattenRefs(resolvedSpec)

  // Write complete specification
  const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile)
  console.log(`💾 Writing complete specification: ${outputPath}`)

  const yamlOutput = yaml.dump(flattenedSpec, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    skipInvalid: true
  })

  fs.writeFileSync(outputPath, yamlOutput)

  // Generate build statistics
  const stats = {
    totalFiles: countFiles(CONFIG.sourceDir),
    outputSize: fs.statSync(outputPath).size,
    buildTime: new Date().toISOString(),
    modularFiles: {
      schemas: countFiles(path.join(CONFIG.sourceDir, 'components', 'schemas')),
      responses: countFiles(path.join(CONFIG.sourceDir, 'components', 'responses')),
      parameters: countFiles(path.join(CONFIG.sourceDir, 'components', 'parameters')),
      paths: countFiles(path.join(CONFIG.sourceDir, 'paths'))
    }
  }

  console.log('\n📊 Build Statistics:')
  console.log(`   Total modular files: ${stats.totalFiles}`)
  console.log(`   - Schemas: ${stats.modularFiles.schemas}`)
  console.log(`   - Responses: ${stats.modularFiles.responses}`)
  console.log(`   - Parameters: ${stats.modularFiles.parameters}`)
  console.log(`   - Paths: ${stats.modularFiles.paths}`)
  console.log(`   Output file size: ${(stats.outputSize / 1024).toFixed(2)} KB`)
  console.log(`   Build completed at: ${stats.buildTime}`)

  // Save build metadata
  const metadataPath = path.join(CONFIG.outputDir, 'build-metadata.json')
  fs.writeFileSync(metadataPath, JSON.stringify(stats, null, 2))

  console.log(`\n✅ Build completed successfully!`)
  console.log(`📄 Complete specification: ${outputPath}`)
  console.log(`📋 Build metadata: ${metadataPath}`)
}

/**
 * Count files in a directory
 * @param {string} dir - Directory to count files in
 * @returns {number} - Number of files
 */
function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0
  return fs.readdirSync(dir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml')).length
}

/**
 * Validate the built specification
 */
function validateSpec() {
  const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile)

  if (!fs.existsSync(outputPath)) {
    console.error('❌ Built specification not found. Run build first.')
    return false
  }

  try {
    const spec = yaml.load(fs.readFileSync(outputPath, 'utf8'))

    // Basic validation checks
    const checks = [
      { name: 'OpenAPI version', condition: spec.openapi === '3.0.3' },
      { name: 'Info object', condition: spec.info && spec.info.title && spec.info.version },
      { name: 'Paths object', condition: spec.paths && Object.keys(spec.paths).length > 0 },
      { name: 'Components object', condition: spec.components && Object.keys(spec.components).length > 0 }
    ]

    console.log('\n🔍 Validating built specification...')
    let allPassed = true

    for (const check of checks) {
      if (check.condition) {
        console.log(`   ✅ ${check.name}`)
      } else {
        console.log(`   ❌ ${check.name}`)
        allPassed = false
      }
    }

    if (allPassed) {
      console.log('\n✅ Specification validation passed!')
      return true
    } else {
      console.log('\n❌ Specification validation failed!')
      return false
    }

  } catch (error) {
    console.error(`❌ Specification validation failed: ${error.message}`)
    return false
  }
}

// CLI handling
const args = process.argv.slice(2)
const command = args[0] || 'build'

switch (command) {
  case 'build':
    buildSpec()
    break
  case 'validate':
    validateSpec()
    break
  case 'build-and-validate':
    buildSpec()
    validateSpec()
    break
  default:
    console.log('Usage: node build-openapi-spec.js [build|validate|build-and-validate]')
    process.exit(1)
}

#!/usr/bin/env node

/**
 * Enhanced OpenAPI YAML Version Updater
 *
 * This script updates the version number in OpenAPI YAML files using the modern 'yaml' package.
 * It preserves comments, formatting, and provides robust error handling.
 *
 * Usage:
 *   node yaml-num.js [increment-type]
 *   npm run version:yaml:patch    # Default: increment patch version (1.0.0 → 1.0.1)
 *   npm run version:yaml:minor    # Increment minor version (1.0.0 → 1.1.0)
 *   npm run version:yaml:major    # Increment major version (1.0.0 → 2.0.0)
 *
 * Features:
 * - ✅ Preserves YAML formatting and comments
 * - ✅ Automatic backup creation
 * - ✅ Semantic versioning validation
 * - ✅ Support for major/minor/patch increments
 * - ✅ Comprehensive error handling
 * - ✅ Colored console output
 *
 * @author 3d-inventory-mongo-api
 * @version 2.0.0
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { parseDocument } from 'yaml'

/**
 * Enhanced YAML version updater using the modern 'yaml' package
 * Features:
 * - Preserves comments and formatting
 * - Better error handling
 * - Supports different version increment types
 * - Validates semantic versioning
 */

// Configuration
const CONFIG = {
  filePath: resolve('./api.yaml'),
  incrementType: process.argv[2] || 'patch', // patch, minor, major
  backup: true,
}

/**
 * Displays help information
 */
function showHelp() {
  console.log(`
🔧 OpenAPI YAML Version Updater

Usage:
  node yaml-num.js [increment-type]

Arguments:
  increment-type    Type of version increment (default: patch)
                   • patch  - Increment patch version (1.0.0 → 1.0.1)
                   • minor  - Increment minor version (1.0.0 → 1.1.0)
                   • major  - Increment major version (1.0.0 → 2.0.0)

Examples:
  node yaml-num.js              # Increment patch version
  node yaml-num.js patch        # Increment patch version
  node yaml-num.js minor        # Increment minor version
  node yaml-num.js major        # Increment major version

NPM Scripts:
  npm run version:yaml:patch    # Increment patch version
  npm run version:yaml:minor    # Increment minor version
  npm run version:yaml:major    # Increment major version

Features:
  ✅ Preserves YAML formatting and comments
  ✅ Creates automatic backups (.backup extension)
  ✅ Validates semantic versioning
  ✅ Comprehensive error handling
`)
}

// Handle help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp()
  process.exit(0)
}

/**
 * Validates semantic version format
 * @param {string} version - Version string to validate
 * @returns {boolean} True if valid semver
 */
function isValidSemver(version) {
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
  return semverRegex.test(version)
}

/**
 * Increments version based on type
 * @param {string} version - Current version
 * @param {string} type - Increment type (patch, minor, major)
 * @returns {string} New version
 */
function incrementVersion(version, type = 'patch') {
  if (!isValidSemver(version)) {
    throw new Error(`Invalid semantic version: ${version}`)
  }

  const validTypes = ['patch', 'minor', 'major']
  if (!validTypes.includes(type.toLowerCase())) {
    throw new Error(`Invalid increment type: ${type}. Must be one of: ${validTypes.join(', ')}`)
  }

  const [major, minor, patch] = version.split('.').map(Number)

  switch (type.toLowerCase()) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`
  }
}

try {
  // Read and parse YAML file while preserving structure
  const fileContent = readFileSync(CONFIG.filePath, 'utf8')
  const doc = parseDocument(fileContent)

  // Validate document structure
  if (!doc.contents || !doc.get('info')) {
    throw new Error('Invalid OpenAPI structure: missing info section')
  }

  const currentVersion = doc.getIn(['info', 'version'])
  if (!currentVersion) {
    throw new Error('Version not found in info.version')
  }

  console.log(`📋 Current version: ${currentVersion}`)

  // Create backup if enabled
  if (CONFIG.backup) {
    const backupPath = `${CONFIG.filePath}.backup`
    writeFileSync(backupPath, fileContent, 'utf8')
    console.log(`💾 Backup created: ${backupPath}`)
  }

  // Increment version
  const newVersion = incrementVersion(currentVersion, CONFIG.incrementType)
  doc.setIn(['info', 'version'], newVersion)

  // Write updated content (preserves formatting and comments)
  const updatedContent = doc.toString()
  writeFileSync(CONFIG.filePath, updatedContent, 'utf8')

  console.log(`🚀 Version updated successfully: ${currentVersion} → ${newVersion}`)
  console.log(`📄 File updated: ${CONFIG.filePath}`)
  console.log(`🔄 Increment type: ${CONFIG.incrementType}`)
} catch (error) {
  console.error('❌ Error updating version:', error.message)
  process.exit(1)
}

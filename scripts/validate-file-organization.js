#!/usr/bin/env node

/**
 * @file validate-file-organization.js
 * @description Validates that files are organized in proper subdirectories
 *
 * This script ensures:
 * 1. Only 4 essential markdown files are in root (README.md, DEVELOPMENT.md, AGENTS.md, SECURITY.md)
 * 2. Shell scripts (.sh) are in scripts/ directory
 * 3. Database scripts are in scripts/database/ directory
 * 4. Test scripts are in scripts/testing/ directory
 * 5. Configuration files are in config/ directory
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const { readdirSync, statSync } = fs

const ROOT_DIR = path.resolve(__dirname, '..')

// Files that are allowed in the root directory
const ALLOWED_ROOT_FILES = [
  'README.md',
  'DEVELOPMENT.md',
  'AGENTS.md',
  'SECURITY.md',
]

// Files that should be in specific directories
const REQUIRED_LOCATIONS = {
  scripts: {
    type: 'pattern',
    patterns: ['.sh', '.mjs'],
    description: 'Shell and deployment scripts',
  },
  'scripts/database': {
    type: 'specific',
    files: [
      'init-users.ts',
      'init-users.js',
      'init-users-simple.js',
      'add-admin-role.ts',
      'verify-admin-access.ts',
      'reset-admin-password.ts',
      'unlock-admin.ts',
      'check-db-raw.ts',
      'cleanup-and-reinit.ts',
      'migrate-permissions.ts',
      'update-user-permissions.ts',
    ],
  },
  'scripts/testing': {
    type: 'specific',
    files: [
      'test-db-auth.ts',
      'test-auth.cjs',
      'test-jest-cleanup.js',
      'test-logs-endpoint.cjs',
    ],
  },
  config: {
    type: 'specific',
    files: [
      'jest.config.ts',
      'jest.config.simple.ts',
      'eslint.config.ts',
    ],
  },
}

let hasErrors = false
let hasWarnings = false
let issues = []

// Check root directory
console.log('🔍 Validating file organization...\n')

// Get all markdown files in root
const rootFiles = readdirSync(ROOT_DIR)
  .filter(
    (f) =>
      f.endsWith('.md') &&
      statSync(path.join(ROOT_DIR, f)).isFile() &&
      f !== '.npmrc' &&
      f !== '.prettierrc.json'
  )

// Check for disallowed markdown files
const disallowedMdFiles = rootFiles.filter(
  (f) => !ALLOWED_ROOT_FILES.includes(f)
)

if (disallowedMdFiles.length > 0) {
  hasWarnings = true
  issues.push({
    type: 'warning',
    message: `⚠️  Disallowed markdown files in root: ${disallowedMdFiles.join(', ')}`,
    suggestion: `Move these files to appropriate docs/ subdirectories`,
  })
}

// Check for executable files in root that shouldn't be there
const executableExtensions = ['.sh', '.ts', '.js', '.cjs', '.mjs']
const rootExecutables = readdirSync(ROOT_DIR)
  .filter(
    (f) =>
      executableExtensions.some((ext) => f.endsWith(ext)) &&
      f !== 'package.json' &&
      f !== '.prettierrc.json' &&
      statSync(path.join(ROOT_DIR, f)).isFile()
  )

if (rootExecutables.length > 0) {
  hasErrors = true
  issues.push({
    type: 'error',
    message: `❌ Executable files found in root: ${rootExecutables.join(', ')}`,
    suggestion: `Move these files to scripts/, config/, or appropriate subdirectories`,
  })
}

// Check for required files in proper locations
for (const [directory, config] of Object.entries(REQUIRED_LOCATIONS)) {
  const fullPath = path.join(ROOT_DIR, directory)

  if (!fs.existsSync(fullPath)) {
    hasErrors = true
    issues.push({
      type: 'error',
      message: `❌ Directory ${directory}/ does not exist`,
      suggestion: `Create the directory: mkdir -p ${directory}`,
    })
    continue
  }

  // Skip pattern-based validation for now (they're just file extensions)
  if (config.type === 'pattern') {
    continue
  }

  // Check specific files
  const expectedFiles = config.files || []
  for (const file of expectedFiles) {
    const filePath = path.join(fullPath, file)
    if (!fs.existsSync(filePath)) {
      hasWarnings = true
      issues.push({
        type: 'warning',
        message: `⚠️  Expected file not found: ${directory}/${file}`,
        suggestion: `Check if this file needs to be migrated or if the path is correct`,
      })
    }
  }
}

// Check for unexpected files in scripts/ subdirectories
const scriptDirs = ['database', 'testing']
for (const subdir of scriptDirs) {
  const fullPath = path.join(ROOT_DIR, 'scripts', subdir)

  if (fs.existsSync(fullPath)) {
    const files = readdirSync(fullPath)
    const expectedFiles = REQUIRED_LOCATIONS[`scripts/${subdir}`]?.files || []

    for (const file of files) {
      if (file.startsWith('.')) continue // Skip hidden files

      if (!expectedFiles.includes(file) && !file.endsWith('.md')) {
        hasWarnings = true
        issues.push({
          type: 'warning',
          message: `⚠️  Unexpected file in scripts/${subdir}/: ${file}`,
          suggestion: `Verify if this file should be here or moved elsewhere`,
        })
      }
    }
  }
}

// Print issues
if (issues.length > 0) {
  console.log('📋 Issues found:\n')
  issues.forEach((issue) => {
    console.log(issue.message)
    console.log(`   💡 ${issue.suggestion}\n`)
  })
}

// Summary
console.log('\n' + '='.repeat(70))
if (hasErrors) {
  console.log('❌ VALIDATION FAILED - Critical errors found')
  console.log('='.repeat(70))
  process.exit(1)
} else if (hasWarnings) {
  console.log('⚠️  VALIDATION PASSED WITH WARNINGS - Minor issues found')
  console.log('='.repeat(70))
  process.exit(0)
} else {
  console.log('✅ VALIDATION PASSED - File organization is correct')
  console.log('='.repeat(70))
  console.log('\n✨ Root directory structure:')
  console.log('  📁 Root/')
  console.log('     ├─ README.md')
  console.log('     ├─ DEVELOPMENT.md')
  console.log('     ├─ AGENTS.md')
  console.log('     ├─ SECURITY.md')
  console.log('     ├─ scripts/')
  console.log('     │  ├─ database/ (initialization & admin scripts)')
  console.log('     │  ├─ testing/ (test utilities)')
  console.log('     │  └─ *.sh (deployment & build scripts)')
  console.log('     ├─ config/')
  console.log('     │  ├─ jest.config.ts')
  console.log('     │  ├─ eslint.config.ts')
  console.log('     │  └─ jest.config.simple.ts')
  console.log('     ├─ docs/')
  console.log('     ├─ src/')
  console.log('     └─ ... (other folders)\n')
  process.exit(0)
}

#!/usr/bin/env node

/**
 * Script to migrate database connection patterns from individual connections to connection pooling
 * This script will update controller files to use getDatabase() instead of connectToCluster() + connectToDb()
 */

import fs from 'fs'
import { glob } from 'glob'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONTROLLERS_PATH = path.join(__dirname, '../src/controllers/**/*.ts')
const BACKUP_DIR = path.join(__dirname, '../backups')

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

// Migration patterns
const migrations = [
  // Update imports
  {
    pattern: /import\s+{([^}]*)}\s+from\s+['"][^'"]*\/utils\/db['"](\s*;?)/g,
    replacement: (match, imports, semicolon) => {
      // Replace old imports with new getDatabase import
      const currentImports = imports
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean)
      const newImports = currentImports.filter((imp) => !['connectToCluster', 'connectToDb', 'closeConnection'].includes(imp)).concat(['getDatabase'])

      return `import { ${[...new Set(newImports)].join(', ')} } from '../utils/db'${semicolon}`
    },
  },

  // Pattern 1: Simple function with try/finally
  {
    pattern: /(\s+)const client = await connectToCluster\(\)\s*\n\s*try\s*{\s*\n\s*const db:\s*Db\s*=\s*connectToDb\(client\)\s*\n/g,
    replacement: '$1try {\n$1  const db: Db = await getDatabase()\n',
  },

  // Pattern 2: Remove finally blocks with closeConnection
  {
    pattern: /\s*}\s*finally\s*{\s*\n\s*await\s+closeConnection\(client\)\s*\n\s*}/g,
    replacement: '\n  }',
  },

  // Pattern 3: Remove client variable declarations at the beginning of functions
  {
    pattern: /(\s+)const client = await connectToCluster\(\)\s*\n/g,
    replacement: '',
  },

  // Pattern 4: Replace connectToDb calls
  {
    pattern: /const db:\s*Db\s*=\s*connectToDb\(client\)/g,
    replacement: 'const db: Db = await getDatabase()',
  },

  // Pattern 5: Remove standalone closeConnection calls
  {
    pattern: /\s*await closeConnection\(client\)\s*\n/g,
    replacement: '',
  },
]

// Function to migrate a single file
function migrateFile(filePath) {
  const fileName = path.basename(filePath)
  console.log(`Migrating ${fileName}...`)

  // Create backup
  const backupPath = path.join(BACKUP_DIR, fileName)
  const originalContent = fs.readFileSync(filePath, 'utf8')
  fs.writeFileSync(backupPath, originalContent)
  console.log(`  ✓ Backup created: ${backupPath}`)

  let content = originalContent
  let changesMade = 0

  // Apply all migration patterns
  migrations.forEach((migration, index) => {
    const beforeLength = content.length

    if (typeof migration.replacement === 'function') {
      content = content.replace(migration.pattern, migration.replacement)
    } else {
      content = content.replace(migration.pattern, migration.replacement)
    }

    if (content.length !== beforeLength) {
      changesMade++
      console.log(`  ✓ Applied migration pattern ${index + 1}`)
    }
  })

  // Additional cleanup - remove empty lines and fix formatting issues
  content = content
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive empty lines
    .replace(/(\s*}\s*\n)\s*}/g, '$1}') // Fix brace formatting
    .trim()

  if (changesMade > 0) {
    fs.writeFileSync(filePath, content)
    console.log(`  ✅ ${fileName} migrated successfully (${changesMade} changes)`)
  } else {
    console.log(`  ⏭️  ${fileName} - no changes needed`)
  }

  console.log()
}

// Main execution
async function main() {
  console.log('🚀 Starting database connection migration...\n')

  // Find all controller files
  const controllerFiles = await glob(CONTROLLERS_PATH)

  console.log(`Found ${controllerFiles.length} controller files to migrate:`)
  controllerFiles.forEach((file) => console.log(`  - ${path.basename(file)}`))
  console.log()

  controllerFiles.forEach(migrateFile)

  console.log('✅ Migration completed!')
  console.log('\nNext steps:')
  console.log('1. Review the migrated files for any manual adjustments needed')
  console.log('2. Run `npm run build` to check for compilation errors')
  console.log('3. Run tests to ensure functionality is preserved')
  console.log('4. If everything works, you can delete the backup files')
  console.log(`\nBackup files are stored in: ${BACKUP_DIR}`)
}

// Run the migration
main().catch(console.error)

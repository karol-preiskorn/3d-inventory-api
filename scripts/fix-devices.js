#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'src/controllers/devices.ts')

console.log('🔧 Fixing devices.ts database connections...')

let content = fs.readFileSync(filePath, 'utf8')

// 1. First, ensure we have the right imports
content = content.replace(
  /import\s+{([^}]*)}\s+from\s+['"][^'"]*\/utils\/db['"](\s*;?)/,
  (match, imports, semicolon) => {
    const currentImports = imports.split(',').map(i => i.trim()).filter(Boolean)
    const newImports = currentImports
      .filter(imp => !['connectToCluster', 'connectToDb', 'closeConnection'].includes(imp))
      .concat(['getDatabase'])

    return `import { ${[...new Set(newImports)].join(', ')} } from '../utils/db'${semicolon}`
  }
)

// 2. Replace the complete pattern for functions with client, try, finally blocks
const functionPatterns = [
  // Pattern 1: client = await connectToCluster() with try/finally
  {
    from: /(\s+)const client = await connectToCluster\(\)\s*\n\s*try\s*{\s*\n\s*const db:\s*Db\s*=\s*connectToDb\(client\)/g,
    to: '$1try {\n$1  const db: Db = await getDatabase()'
  },
  // Pattern 2: Remove finally blocks with closeConnection
  {
    from: /\s*}\s*finally\s*{\s*\n\s*await closeConnection\(client\)\s*\n\s*}/g,
    to: '\n  }'
  }
]

// Apply patterns
functionPatterns.forEach(pattern => {
  content = content.replace(pattern.from, pattern.to)
})

// 3. Handle edge cases - standalone client variables and cleanup
content = content.replace(/const client = await connectToCluster\(\)\s*\n/g, '')
content = content.replace(/await closeConnection\(client\)\s*\n/g, '')

// 4. Clean up formatting
content = content
  .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive empty lines
  .replace(/(\s*}\s*\n)\s*}/g, '$1}') // Fix brace formatting

fs.writeFileSync(filePath, content)
console.log('✅ devices.ts fixed successfully!')

#!/usr/bin/env node

/**
 * Documentation Quality Improvement Script
 * Automatically fixes common markdown issues and improves documentation structure
 */

import * as fs from 'fs'
import * as path from 'path'

interface MarkdownIssue {
  file: string
  line: number
  rule: string
  description: string
  severity: 'error' | 'warning' | 'info'
}

interface DocumentationMetrics {
  totalFiles: number
  fixedFiles: number
  issues: {
    altTextMissing: number
    lineTooLong: number
    inconsistentStructure: number
    genericContent: number
  }
  fixedIssues: {
    altTextAdded: number
    linesWrapped: number
    structureImproved: number
    contentCustomized: number
  }
}

class DocumentationFixer {
  private metrics: DocumentationMetrics = {
    totalFiles: 0,
    fixedFiles: 0,
    issues: {
      altTextMissing: 0,
      lineTooLong: 0,
      inconsistentStructure: 0,
      genericContent: 0
    },
    fixedIssues: {
      altTextAdded: 0,
      linesWrapped: 0,
      structureImproved: 0,
      contentCustomized: 0
    }
  }

  private readonly MARKDOWN_FILES = [
    'README.md',
    'SECURITY.md',
    'DEVELOPMENT.md',
    'CODE-QUALITY-IMPROVEMENTS.md',
    'SECURITY-FIXES.md',
    'ESLINT-POLICY.md',
    'JEST-TESTING.md',
    'MODERN-JEST-SETUP.md',
    'MIGRATION-SUMMARY.md',
    'IMPROVEMENTS_SUMMARY.md',
    '.github/PULL_REQUEST_TEMPLATE.md'
  ]

  private readonly MAX_LINE_LENGTH = 80

  /**
   * Fix images missing alt text
   */
  private fixMissingAltText(content: string): string {
    let fixedContent = content
    let fixCount = 0

    // Pattern for badges without alt text
    const badgePattern = /\[\!\[([^\]]*)\]\(([^)]+)\)\]/g
    fixedContent = fixedContent.replace(badgePattern, (match, altText, url) => {
      if (!altText || altText.trim() === '') {
        // Extract meaningful alt text from URL
        let newAltText = 'Badge'
        if (url.includes('wakatime')) newAltText = 'Development time tracker'
        else if (url.includes('commit')) newAltText = 'Latest commit'
        else if (url.includes('issues')) newAltText = 'Open issues'
        else if (url.includes('stars')) newAltText = 'GitHub stars'
        else if (url.includes('license')) newAltText = 'License'
        else if (url.includes('npm')) newAltText = 'NPM version'
        else if (url.includes('javascript')) newAltText = 'JavaScript'

        fixCount++
        return `[![${newAltText}](${url})]`
      }
      return match
    })

    // Pattern for regular images without alt text
    const imagePattern = /!\[\s*\]\(([^)]+)(?:\s+"([^"]*)")?\)/g
    fixedContent = fixedContent.replace(imagePattern, (match, url, title) => {
      const fileName = path.basename(url, path.extname(url))
      const altText = title || fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      fixCount++
      return `![${altText}](${url}${title ? ` "${title}"` : ''})`
    })

    if (fixCount > 0) {
      this.metrics.fixedIssues.altTextAdded += fixCount
    }

    return fixedContent
  }

  /**
   * Fix long lines by wrapping them
   */
  private fixLongLines(content: string): string {
    const lines = content.split('\n')
    let fixedLines: string[] = []
    let fixCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Skip code blocks, tables, and URLs
      if (line.startsWith('```') ||
          line.startsWith('|') ||
          line.match(/https?:\/\//) ||
          line.trim().startsWith('[![')) {
        fixedLines.push(line)
        continue
      }

      if (line.length > this.MAX_LINE_LENGTH) {
        // Try to wrap at word boundaries
        const wrapped = this.wrapLine(line, this.MAX_LINE_LENGTH)
        if (wrapped.length !== line.length) {
          fixedLines.push(...wrapped.split('\n'))
          fixCount++
        } else {
          fixedLines.push(line)
        }
      } else {
        fixedLines.push(line)
      }
    }

    if (fixCount > 0) {
      this.metrics.fixedIssues.linesWrapped += fixCount
    }

    return fixedLines.join('\n')
  }

  /**
   * Wrap a single line at word boundaries
   */
  private wrapLine(line: string, maxLength: number): string {
    // Preserve leading whitespace
    const indent = line.match(/^(\s*)/)?.[1] || ''
    const content = line.slice(indent.length)

    if (content.length <= maxLength - indent.length) {
      return line
    }

    const words = content.split(' ')
    const wrappedLines: string[] = []
    let currentLine = indent

    for (const word of words) {
      const testLine = currentLine + (currentLine === indent ? '' : ' ') + word

      if (testLine.length <= maxLength) {
        currentLine = testLine
      } else {
        if (currentLine !== indent) {
          wrappedLines.push(currentLine)
          currentLine = indent + '  ' + word // Continue with additional indent
        } else {
          // Single word too long, just add it
          wrappedLines.push(currentLine + word)
          currentLine = indent
        }
      }
    }

    if (currentLine !== indent) {
      wrappedLines.push(currentLine)
    }

    return wrappedLines.join('\n')
  }

  /**
   * Improve documentation structure
   */
  private improveStructure(content: string, filename: string): string {
    let fixedContent = content

    // Add proper spacing around headings
    fixedContent = fixedContent.replace(/\n(#{1,6}\s+[^\n]+)\n(?!\n)/g, '\n$1\n\n')
    fixedContent = fixedContent.replace(/(?<!\n)\n(#{1,6}\s+[^\n]+)/g, '\n\n$1')

    // Add proper spacing around lists
    fixedContent = fixedContent.replace(/\n(-|\*|\d+\.)\s+/g, '\n\n$1 ')
    fixedContent = fixedContent.replace(/(-|\*|\d+\.)\s+[^\n]+\n(?!\n|-|\*|\d+\.)/g, '$&\n')

    // Fix table formatting
    fixedContent = fixedContent.replace(/\n\|[^\n]+\|\n(?!\|)/g, '$&\n')
    fixedContent = fixedContent.replace(/(?<!\n)\n\|[^\n]+\|/g, '\n\n$&')

    this.metrics.fixedIssues.structureImproved++
    return fixedContent
  }

  /**
   * Process a single markdown file
   */
  private async processFile(filePath: string): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${filePath}`)
        return
      }

      console.log(`🔧 Processing: ${filePath}`)
      const originalContent = fs.readFileSync(filePath, 'utf8')
      let fixedContent = originalContent

      // Apply fixes
      fixedContent = this.fixMissingAltText(fixedContent)
      fixedContent = this.fixLongLines(fixedContent)
      fixedContent = this.improveStructure(fixedContent, path.basename(filePath))

      // Only write if content changed
      if (fixedContent !== originalContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf8')
        this.metrics.fixedFiles++
        console.log(`✅ Fixed: ${filePath}`)
      } else {
        console.log(`✨ Already clean: ${filePath}`)
      }

      this.metrics.totalFiles++
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error)
    }
  }

  /**
   * Create documentation style guide
   */
  private createStyleGuide(): void {
    const styleGuideContent = `# Documentation Style Guide

## Overview

This guide ensures consistent, accessible, and professional documentation
across the 3D Inventory project.

## Markdown Standards

### Line Length
- Maximum 80 characters per line
- Break at word boundaries
- Exceptions: URLs, tables, code blocks

### Headings
- Use ATX-style headings (\`#\`)
- Add blank lines before and after headings
- Use sentence case for headings

### Images and Badges
- Always include descriptive alt text
- Use meaningful descriptions, not just filenames
- Format: \`![Alt text](URL "Optional title")\`

Example:
\`\`\`markdown
// Good
![3D Inventory Architecture Diagram](./architecture.png "System architecture overview")

// Bad
![](./architecture.png)
\`\`\`

### Lists
- Add blank lines before and after lists
- Use consistent bullet style (\`-\` for unordered)
- Use proper indentation (2 spaces)

### Tables
- Add blank lines before and after tables
- Align columns for readability
- Keep tables under 80 characters when possible

### Links
- Use descriptive link text
- Avoid "click here" or bare URLs
- Format: \`[Description](URL)\`

## Content Guidelines

### Writing Style
- Use clear, concise language
- Write in active voice
- Use present tense
- Include examples where helpful

### Accessibility
- All images must have alt text
- Use proper heading hierarchy
- Provide context for code examples
- Include keyboard shortcuts where applicable

### Security Documentation
- Customize generic templates
- Include specific project details
- Provide clear contact information
- List supported versions accurately

## File Structure

### README.md
- Brief project description
- Installation instructions
- Usage examples
- Contributing guidelines
- License information

### SECURITY.md
- Supported versions
- Vulnerability reporting process
- Security features overview
- Contact information

### API Documentation
- Endpoint descriptions
- Authentication requirements
- Request/response examples
- Error handling

## Quality Checks

Run these commands to maintain quality:

\`\`\`bash
# Fix markdown issues
npm run lint:md

# Check only (no fixes)
npm run lint:md:check

# Full quality check
npm run quality:report
\`\`\`

## Tools

- **markdownlint-cli2**: Markdown linting
- **prettier**: Code formatting
- **Documentation fixer**: Custom quality script

## Contributing

When updating documentation:

1. Follow this style guide
2. Run quality checks before committing
3. Include relevant examples
4. Update table of contents if needed
5. Test all links and references

---

For questions about documentation standards, please create an issue with the
\`documentation\` label.
`

    const styleGuidePath = path.join(process.cwd(), 'DOCUMENTATION-STYLE-GUIDE.md')
    fs.writeFileSync(styleGuidePath, styleGuideContent, 'utf8')
    console.log(`📖 Created documentation style guide: ${styleGuidePath}`)
  }

  /**
   * Generate improvement report
   */
  private generateReport(): void {
    console.log('\n📊 DOCUMENTATION IMPROVEMENT REPORT')
    console.log('====================================')

    console.log(`\n📁 Files Processed: ${this.metrics.totalFiles}`)
    console.log(`🔧 Files Fixed: ${this.metrics.fixedFiles}`)

    console.log('\n🛠️ Fixes Applied:')
    console.log(`   ├─ Alt text added: ${this.metrics.fixedIssues.altTextAdded}`)
    console.log(`   ├─ Lines wrapped: ${this.metrics.fixedIssues.linesWrapped}`)
    console.log(`   ├─ Structure improved: ${this.metrics.fixedIssues.structureImproved}`)
    console.log(`   └─ Content customized: ${this.metrics.fixedIssues.contentCustomized}`)

    const totalFixes = Object.values(this.metrics.fixedIssues).reduce((a, b) => a + b, 0)
    console.log(`\n✅ Total improvements: ${totalFixes}`)

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'documentation-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(this.metrics, null, 2))
    console.log(`\n📄 Detailed report saved: ${reportPath}`)
  }

  /**
   * Run the documentation fixer
   */
  async run(): Promise<void> {
    console.log('🚀 Starting documentation quality improvements...\n')

    // Process each markdown file
    for (const file of this.MARKDOWN_FILES) {
      await this.processFile(file)
    }

    // Create style guide
    this.createStyleGuide()

    // Generate report
    this.generateReport()

    console.log('\n🎉 Documentation improvements completed!')
    console.log('\n💡 Next steps:')
    console.log('   1. Review changes with: git diff')
    console.log('   2. Run markdown linting: npm run lint:md:check')
    console.log('   3. Commit improvements: git add . && git commit -m "docs: improve markdown quality"')
  }
}

// Run the documentation fixer
const fixer = new DocumentationFixer()
fixer.run().catch(console.error)

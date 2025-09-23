#!/usr/bin/env node

/**
 * Comprehensive Quality Report Generator
 * Generates detailed reports on code quality, test coverage, and security
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  PURPLE: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
  RESET: '\x1b[0m',
}

const log = (color, message) => {
  console.log(`${color}${message}${COLORS.RESET}`)
}

const runCommand = (command, description) => {
  log(COLORS.BLUE, `🔍 ${description}...`)
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    return { success: true, output: result }
  } catch (error) {
    return { success: false, output: error.message, stderr: error.stderr }
  }
}

const generateReport = () => {
  log(COLORS.PURPLE, '📊 Generating Comprehensive Quality Report')
  console.log('='.repeat(60))

  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
  }

  // TypeScript Type Check
  const typeCheck = runCommand('npm run check:type', 'TypeScript Type Checking')
  results.checks.push({
    name: 'TypeScript Types',
    passed: typeCheck.success,
    details: typeCheck.success ? 'All types are valid' : typeCheck.output,
  })

  if (typeCheck.success) {
    log(COLORS.GREEN, '✅ TypeScript type checking passed')
  } else {
    log(COLORS.RED, '❌ TypeScript type checking failed')
  }

  // ESLint Check
  const lintCheck = runCommand('npx eslint src --format=compact', 'ESLint Analysis')
  results.checks.push({
    name: 'ESLint',
    passed: lintCheck.success,
    details: lintCheck.success ? 'No linting issues' : lintCheck.output,
  })

  if (lintCheck.success) {
    log(COLORS.GREEN, '✅ ESLint checks passed')
  } else {
    log(COLORS.RED, '❌ ESLint issues found')
  }

  // Test Coverage
  const testCoverage = runCommand('npm run test:coverage -- --silent', 'Test Coverage Analysis')
  results.checks.push({
    name: 'Test Coverage',
    passed: testCoverage.success,
    details: testCoverage.output,
  })

  if (testCoverage.success) {
    log(COLORS.GREEN, '✅ Tests passed with coverage')
  } else {
    log(COLORS.RED, '❌ Test failures or coverage issues')
  }

  // Security Audit
  const securityAudit = runCommand('npm audit --audit-level=moderate --json', 'Security Vulnerability Scan')
  let vulnerabilities = 0
  try {
    const auditResult = JSON.parse(securityAudit.output || '{}')
    vulnerabilities = auditResult.metadata?.vulnerabilities?.total || 0
  } catch (e) {
    // Ignore JSON parse errors
  }

  results.checks.push({
    name: 'Security Audit',
    passed: vulnerabilities === 0,
    details: `${vulnerabilities} vulnerabilities found`,
  })

  if (vulnerabilities === 0) {
    log(COLORS.GREEN, '✅ No security vulnerabilities found')
  } else {
    log(COLORS.YELLOW, `⚠️  ${vulnerabilities} security vulnerabilities found`)
  }

  // Dependency Check
  const depCheck = runCommand('npx depcheck --json', 'Unused Dependencies Check')
  let unusedDeps = []
  try {
    const depResult = JSON.parse(depCheck.output || '{}')
    unusedDeps = depResult.dependencies || []
  } catch (e) {
    // Ignore JSON parse errors
  }

  results.checks.push({
    name: 'Dependencies',
    passed: unusedDeps.length === 0,
    details: unusedDeps.length === 0 ? 'No unused dependencies' : `${unusedDeps.length} unused dependencies: ${unusedDeps.join(', ')}`,
  })

  if (unusedDeps.length === 0) {
    log(COLORS.GREEN, '✅ No unused dependencies found')
  } else {
    log(COLORS.YELLOW, `⚠️  ${unusedDeps.length} unused dependencies found`)
  }

  // Build Check
  const buildCheck = runCommand('npm run build', 'Build Verification')
  results.checks.push({
    name: 'Build',
    passed: buildCheck.success,
    details: buildCheck.success ? 'Build successful' : buildCheck.output,
  })

  if (buildCheck.success) {
    log(COLORS.GREEN, '✅ Build successful')
  } else {
    log(COLORS.RED, '❌ Build failed')
  }

  // Generate Summary
  console.log('\n' + '='.repeat(60))
  log(COLORS.PURPLE, '📋 Quality Report Summary')

  const passed = results.checks.filter((check) => check.passed).length
  const total = results.checks.length
  const score = Math.round((passed / total) * 100)

  log(COLORS.WHITE, `Total Checks: ${total}`)
  log(COLORS.GREEN, `Passed: ${passed}`)
  log(COLORS.RED, `Failed: ${total - passed}`)
  log(COLORS.CYAN, `Quality Score: ${score}%`)

  if (score >= 90) {
    log(COLORS.GREEN, '🏆 Excellent code quality!')
  } else if (score >= 75) {
    log(COLORS.YELLOW, '👍 Good code quality')
  } else {
    log(COLORS.RED, '⚠️  Code quality needs improvement')
  }

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'quality-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
  log(COLORS.BLUE, `📄 Detailed report saved to: ${reportPath}`)

  console.log('\n' + '='.repeat(60))
  return score >= 75 ? 0 : 1 // Exit code
}

// Check if this script is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  process.exit(generateReport())
}

export { generateReport }

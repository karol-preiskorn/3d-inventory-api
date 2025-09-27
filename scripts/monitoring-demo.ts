#!/usr/bin/env tsx
/**
 * Monitoring System Demo
 * Demonstrates all monitoring and observability features
 */

import { randomUUID } from 'crypto'
import { databaseMonitor } from '../src/middleware/database-monitor'
import { healthMonitor } from '../src/middleware/health-alerting'
import { metricsCollector } from '../src/middleware/metrics'
import getLogger from '../src/utils/logger'

const logger = getLogger('monitoring-demo')

async function demonstrateMonitoring() {
  console.log('🔍 Monitoring & Observability System Demo')
  console.log('='.repeat(50))

  // 1. Demonstrate Correlation IDs
  console.log('\n1. 📝 Correlation ID Generation:')
  const correlationId = `req_${randomUUID().replace(/-/g, '').substring(0, 16)}`
  console.log(`   Generated ID: ${correlationId}`)

  // 2. Demonstrate Metrics Collection
  console.log('\n2. 📊 Metrics Collection:')
  console.log('   Simulating API requests...')

  // Simulate various requests
  const endpoints = ['/api/devices', '/api/models', '/api/attributes', '/api/connections']
  const methods = ['GET', 'POST', 'PUT', 'DELETE']

  for (let i = 0; i < 20; i++) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
    const method = methods[Math.floor(Math.random() * methods.length)]
    const status = Math.random() > 0.1 ? 200 : (Math.random() > 0.5 ? 404 : 500)
    const duration = Math.random() * 500 + 50 + (Math.random() > 0.9 ? 2000 : 0) // Occasional slow request

    metricsCollector['recordRequestStart'](method, endpoint)
    metricsCollector['recordRequestComplete'](method, endpoint, status, duration, `demo-${i}`)
  }

  const metrics = metricsCollector.getMetrics()
  console.log(`   📈 Total Requests: ${metrics.totalRequests}`)
  console.log(`   📈 Error Rate: ${metrics.errorRate.toFixed(2)}%`)
  console.log(`   📈 P95 Response Time: ${metrics.responseTimeP95.toFixed(2)}ms`)
  console.log(`   📈 P99 Response Time: ${metrics.responseTimeP99.toFixed(2)}ms`)

  // 3. Demonstrate Database Monitoring
  console.log('\n3. 🗄️ Database Query Monitoring:')
  console.log('   Simulating database operations...')

  // Simulate database queries
  const collections = ['devices', 'models', 'users', 'logs']
  const operations = ['find', 'insertOne', 'updateOne', 'deleteOne']

  for (let i = 0; i < 15; i++) {
    const collection = collections[Math.floor(Math.random() * collections.length)]
    const operation = operations[Math.floor(Math.random() * operations.length)]

    const mockQuery = async () => {
      // Simulate query execution time
      const delay = Math.random() * 200 + 10 + (Math.random() > 0.8 ? 1200 : 0) // Occasional slow query
      return new Promise(resolve => setTimeout(() => resolve({ data: `${operation} result` }), delay))
    }

    try {
      await databaseMonitor.monitorOperation(mockQuery, operation, collection, `db-demo-${i}`)
    } catch (error) {
      // Handle any errors
    }
  }

  const dbMetrics = databaseMonitor.getMetrics()
  console.log(`   🔍 Total Queries: ${dbMetrics.queryCount}`)
  console.log(`   🔍 Slow Queries: ${dbMetrics.slowQueryCount}`)
  console.log(`   🔍 Avg Query Time: ${dbMetrics.avgQueryTime.toFixed(2)}ms`)
  console.log(`   🔍 Database Errors: ${dbMetrics.errors}`)

  if (dbMetrics.lastSlowQuery) {
    console.log(`   ⚠️ Last Slow Query: ${dbMetrics.lastSlowQuery.query} on ${dbMetrics.lastSlowQuery.collection} (${dbMetrics.lastSlowQuery.duration.toFixed(2)}ms)`)
  }

  // 4. Demonstrate Health Checks
  console.log('\n4. 🏥 Health Check System:')
  console.log('   Performing comprehensive health check...')

  const health = await healthMonitor.performHealthCheck()

  console.log(`   🎯 Overall Status: ${health.status.toUpperCase()}`)
  console.log(`   🎯 Version: ${health.version}`)
  console.log(`   🎯 Uptime: ${health.uptime}s`)
  console.log('   🎯 Service Checks:')

  health.checks.forEach(check => {
    const statusIcon = check.status === 'healthy' ? '✅' :
                      check.status === 'warning' ? '⚠️' :
                      check.status === 'critical' ? '❌' : '🔴'
    console.log(`      ${statusIcon} ${check.service}: ${check.message} (${check.responseTime?.toFixed(2)}ms)`)
  })

  // 5. Demonstrate Prometheus Metrics
  console.log('\n5. 📊 Prometheus Metrics Format:')
  const prometheusMetrics = metricsCollector.getPrometheusMetrics()
  console.log('   Sample metrics:')
  console.log(prometheusMetrics.split('\n').slice(0, 10).map(line => `   ${line}`).join('\n'))

  // 6. Show Top Performing/Slow Endpoints
  console.log('\n6. 🏆 Performance Analysis:')
  const topEndpoints = metrics.topEndpoints.slice(0, 5)
  console.log('   Top Endpoints by Request Count:')
  topEndpoints.forEach((endpoint, index) => {
    console.log(`   ${index + 1}. ${endpoint.endpoint}: ${endpoint.requests} requests, ${endpoint.avgDuration.toFixed(2)}ms avg`)
  })

  // 7. Show Database Query Statistics
  console.log('\n7. 📈 Database Query Statistics:')
  const topQueries = dbMetrics.topSlowQueries.slice(0, 5)
  console.log('   Slowest Operations:')
  topQueries.forEach((query, index) => {
    console.log(`   ${index + 1}. ${query.operation}: ${query.avgTime.toFixed(2)}ms avg (${query.count} queries)`)
  })

  // 8. Show Alerts (if any)
  console.log('\n8. 🚨 Alert System:')
  const alerts = healthMonitor.getAlerts()
  if (alerts.length > 0) {
    console.log(`   Active Alerts: ${alerts.length}`)
    alerts.forEach(alert => {
      const severityIcon = alert.severity === 'critical' ? '🔥' :
                          alert.severity === 'high' ? '⚠️' :
                          alert.severity === 'medium' ? '⚡' : 'ℹ️'
      console.log(`   ${severityIcon} [${alert.severity.toUpperCase()}] ${alert.type}: ${alert.message}`)
    })
  } else {
    console.log('   ✅ No active alerts - System is healthy!')
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Monitoring & Observability Demo Completed!')
  console.log('\nKey Features Demonstrated:')
  console.log('• ✅ Correlation ID tracking for request tracing')
  console.log('• ✅ Application metrics (response times, error rates)')
  console.log('• ✅ Database query performance monitoring')
  console.log('• ✅ Comprehensive health checks')
  console.log('• ✅ Prometheus-compatible metrics')
  console.log('• ✅ Alert generation and management')
  console.log('• ✅ Performance analysis and reporting')

  console.log('\n📊 Available Endpoints:')
  console.log('• GET /monitoring/health - System health check')
  console.log('• GET /monitoring/metrics - Application metrics dashboard')
  console.log('• GET /monitoring/metrics/prometheus - Prometheus metrics')
  console.log('• GET /monitoring/alerts - Active alerts')
}

// Run the demo
demonstrateMonitoring().catch(error => {
  logger.error('Demo failed:', error)
  process.exit(1)
})

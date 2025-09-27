/**
 * Monitoring and observability routes
 * Provides endpoints for metrics, health checks, and alerts
 */

import { Router } from 'express'
import { getAlerts, getHealthCheck, getMetrics, getPrometheusMetrics } from '../middlewares'
import { requireAuth } from '../middlewares/auth'

const router = Router()

/**
 * @swagger
 * /monitoring/health:
 *   get:
 *     summary: System health check
 *     description: Returns comprehensive health status of all system components
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: System is healthy or has warnings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, warning, critical, down]
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: string
 *                     uptime:
 *                       type: number
 *                     checks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           service:
 *                             type: string
 *                           status:
 *                             type: string
 *                           message:
 *                             type: string
 *                           responseTime:
 *                             type: number
 *       500:
 *         description: Health check system failure
 *       503:
 *         description: Service unavailable
 */
router.get('/health', getHealthCheck)

/**
 * @swagger
 * /monitoring/metrics:
 *   get:
 *     summary: Application metrics
 *     description: Returns detailed application performance metrics
 *     tags:
 *       - Monitoring
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRequests:
 *                       type: number
 *                     activeRequests:
 *                       type: number
 *                     errorRate:
 *                       type: number
 *                     responseTimeP95:
 *                       type: number
 *                     responseTimeP99:
 *                       type: number
 *                     topEndpoints:
 *                       type: array
 *       401:
 *         description: Unauthorized
 */
router.get('/metrics', requireAuth, getMetrics)

/**
 * @swagger
 * /monitoring/metrics/prometheus:
 *   get:
 *     summary: Prometheus metrics
 *     description: Returns metrics in Prometheus format for monitoring tools
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Prometheus metrics
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 # HELP http_requests_total Total number of HTTP requests
 *                 # TYPE http_requests_total counter
 *                 http_requests_total{method="GET",path="/api/devices"} 42
 */
router.get('/metrics/prometheus', getPrometheusMetrics)

/**
 * @swagger
 * /monitoring/alerts:
 *   get:
 *     summary: Active alerts
 *     description: Returns list of active system alerts
 *     tags:
 *       - Monitoring
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       severity:
 *                         type: string
 *                         enum: [low, medium, high, critical]
 *                       message:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/alerts', requireAuth, getAlerts)

export default router

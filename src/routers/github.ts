import express from 'express'
import { getGithubIssues } from '../controllers/github'
import { Permission, requireAuth, requirePermission } from '../middlewares'

// Create github router with enhanced security
export default function createGithubRouter() {
  const router = express.Router()

  // Apply authentication to all routes
  router.use(requireAuth)

  // GET GitHub issues - Requires admin permission for sensitive operations
  router.get('/issues', requirePermission(Permission.ADMIN_FULL), getGithubIssues)

  return router
}

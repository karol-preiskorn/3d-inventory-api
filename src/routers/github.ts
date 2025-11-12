import express from 'express'
import { getGithubIssues } from '../controllers/github'
import { optionalAuth } from '../middlewares'

// Create github router with enhanced security
export default function createGithubRouter() {
  const router = express.Router()

  // GET GitHub issues - Public endpoint (GitHub issues are publicly visible)
  // Using optionalAuth to track authenticated users but allow anonymous access
  router.get('/issues', optionalAuth, getGithubIssues)

  return router
}

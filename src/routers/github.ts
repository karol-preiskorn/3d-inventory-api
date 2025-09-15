import express from 'express';
import { getGithubIssues } from '../controllers/github';
import { requireAuth, requirePermission, Permission } from '../middlewares';

// Create github router with enhanced security
export default function createGithubRouter() {
  const router = express.Router();

  // Apply authentication to all routes
  router.use(requireAuth);

  // GET GitHub issues - Requires admin permission for sensitive operations
  router.get('/issues', requirePermission(Permission.ADMIN_ACCESS), getGithubIssues);

  return router;
}

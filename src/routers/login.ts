import express from 'express';
import { loginUser, getProtectedData } from '../controllers/login';
import { authRateLimit, requireAuth } from '../middlewares';
import log from '../utils/logger';

const logger = log('login');

// Create login router with enhanced security
export default function createLoginRouter() {
  const router = express.Router();

  // POST /login - User authentication with rate limiting
  router.post('/', authRateLimit, loginUser);

  // GET /protected - Protected route example using centralized auth middleware
  router.get('/protected', requireAuth, getProtectedData);

  logger.info('Login router created with enhanced security: POST / (with rate limiting), GET /protected (with JWT auth)');

  return router;
}

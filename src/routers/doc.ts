import express from 'express';
import { getSwaggerServe, getSwaggerSetup, getDocumentationHealth } from '../controllers/doc';
import log from '../utils/logger';

const logger = log('doc');

// Create documentation router with all routes
export default function createDocRouter() {
  const router = express.Router();

  // GET /health - Documentation service health check
  router.get('/health', getDocumentationHealth);

  // Swagger UI routes - serve static assets and setup
  router.use('/', getSwaggerServe(), getSwaggerSetup());

  logger.info('Documentation router created with routes: GET /health, GET / (Swagger UI)');

  return router;
}

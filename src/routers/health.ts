import express from 'express'
import { healthController } from '../controllers/health'
import { dbConnection } from '../utils/db'

/**
 * Creates and returns an Express router for health check endpoints.
 *
 * The router defines a single GET endpoint at the root path (`/`) which uses
 * the `dbConnection` middleware and delegates the request to the `healthController`.
 * The controller receives the request, response, and the database instance from
 * the application's local variables.
 *
 * @returns {import('express').Router} An Express router configured for health checks.
 */
export default function createHealthRouter(): import('express').Router {
  const router = express.Router()

  router.get('/', dbConnection, (req, res) => healthController(req, res, req.app.locals.db))

  return router
}

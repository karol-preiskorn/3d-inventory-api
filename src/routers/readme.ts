import { Router } from 'express'
import { getReadme } from '../controllers/readme'

/**
 * Creates and configures the readme router
 * @returns {Router} Configured Express router
 */
export function createReadmeRouter(): Router {
  const router = Router()

  // README route
  router.get('/', getReadme)

  return router
}

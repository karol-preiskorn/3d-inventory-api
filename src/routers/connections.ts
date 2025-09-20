import { Router } from 'express'
import {
  getAllConnections,
  getConnectionById,
  getConnectionsFrom,
  getConnectionsTo,
  getConnectionBetweenDevices,
  createConnection,
  updateConnection,
  deleteConnection,
  deleteConnectionsFrom,
  deleteConnectionsTo,
  deleteConnectionsBetweenDevices,
  deleteAllConnections
} from '../controllers/connections'
import { validateObjectId, validateConnectionInput } from '../middlewares'

/**
 * Creates and configures the connections router
 * @returns {Router} Configured Express router
 */
export function createConnectionsRouter(): Router {
  const router = Router()

  // Route definitions
  router.get('/', getAllConnections)
  router.get('/:id', validateObjectId, getConnectionById)
  router.get('/from/:id', validateObjectId, getConnectionsFrom)
  router.get('/to/:id', validateObjectId, getConnectionsTo)
  router.get('/from/:idFrom/to/:idTo', getConnectionBetweenDevices)
  router.post('/', validateConnectionInput, createConnection)
  router.put('/:id', validateObjectId, validateConnectionInput, updateConnection)
  router.delete('/:id', validateObjectId, deleteConnection)
  router.delete('/from/:id', validateObjectId, deleteConnectionsFrom)
  router.delete('/to/:id', validateObjectId, deleteConnectionsTo)
  router.delete('/from/:idFrom/to/:idTo', deleteConnectionsBetweenDevices)
  router.delete('/all', deleteAllConnections)

  return router
}

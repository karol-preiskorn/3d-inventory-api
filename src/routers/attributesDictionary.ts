import express from 'express';
import {
  getAllAttributesDictionary,
  getAttributesDictionaryById,
  getAttributesDictionaryByModelId,
  createAttributesDictionary,
  updateAttributesDictionary,
  deleteAttributesDictionary,
  deleteAllAttributesDictionary,
  deleteAttributesDictionaryByModelId
} from '../controllers/attributesDictionary';
import { validateObjectId, requireAuth } from '../middlewares';

// Create attributes dictionary router with all routes
export default function createAttributesDictionaryRouter() {
  const router = express.Router();

  // Apply authentication to all routes
  router.use(requireAuth);

  // GET all attributes dictionary entries
  router.get('/', getAllAttributesDictionary);

  // GET attributes dictionary entry by ID
  router.get('/:id', validateObjectId, getAttributesDictionaryById);

  // GET attributes dictionary entry by model ID
  router.get('/model/:id', validateObjectId, getAttributesDictionaryByModelId);

  // POST new attributes dictionary entry
  router.post('/', createAttributesDictionary);

  // PUT update attributes dictionary entry by ID
  router.put('/:id', validateObjectId, updateAttributesDictionary);

  // DELETE attributes dictionary entry by ID
  router.delete('/:id', validateObjectId, deleteAttributesDictionary);

  // DELETE all attributes dictionary entries
  router.delete('/', deleteAllAttributesDictionary);

  // DELETE attributes dictionary entries by model ID
  router.delete('/model/:id', validateObjectId, deleteAttributesDictionaryByModelId);

  return router;
}

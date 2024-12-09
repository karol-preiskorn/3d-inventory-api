/**
 * @description Render README.md in express
 * @module routers
 * @version 2024-04-02 C2RLO - refactor use fs.readFile
 * @version 2024-01-07 C2RLO - Initial
 */

import express from 'express'
import fs from 'fs'
import Markdown from 'markdown-it'
import { promisify } from 'util'

const router: express.Router = express.Router()
const readFileAsync = promisify(fs.readFile)
const md = new Markdown()

router.get('/', async (_req, res): Promise<void> => {
  const path = './src/assets/README.md'
  try {
    const data = await readFileAsync(path, 'utf8')
    res.status(200).send(md.render(data))
  }
  catch (err: unknown) {
    res.status(404).json({ message: `File ${path}: ${(err as Error).message}` })
  }
})

export default router

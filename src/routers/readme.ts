/**
 * File:        /routers/readme.js
 * Description: Render README.md in express
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2024-01-07  C2RLO  Initial
 */

import express from 'express'
import fs from 'fs'
import Markdown from 'markdown-it'
import { logger } from '../utils/logger.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const path = '../../../README.md'
  const md = Markdown()
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) {
      logger.error(`Error readFile ${path}: ${err}`)
    }
    if (!data) {
      res.status(404).send(`File ${path} not found: ${err}`)
    } else {
      res.status(200).send(md.render(data))
    }
  })
})

export default router

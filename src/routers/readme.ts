/**
 * @file: /routers/readme.ts
 * @description: Render README.md in express
 * @version 2024-04-02 C2RLO - refactor use fs.readFile
 * @version 2024-01-07 C2RLO - Initial
 */

import express, { Response } from 'express'
import fs from 'fs'
import Markdown from 'markdown-it'

const router = express.Router()

router.get('/', (res: Response) => {
  const path = './../../README.md'
  const md = Markdown()
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      res.status(404).send(`File ${path}: ${err.message}`)
    } else {
      res.status(200).send(md.render(data))
    }
  })
})

export default router

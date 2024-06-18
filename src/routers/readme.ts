/**
 * @file: /routers/readme.ts
 * @description: Render README.md in express
 * @version: 2024-04-02 C2RLO - refactor use fs.readFile
 * @version: 2024-01-07 C2RLO - Initial
 */

import express, { Response } from 'express';
import fs from 'fs';
import Markdown from 'markdown-it';
import { promisify } from 'util';

const router = express.Router()
const readFileAsync = promisify(fs.readFile)
const md = Markdown()

router.get('/', async (req, res) => {
  let path
  try {
    path = './assets/README.md'
    const data = await readFileAsync(path, 'utf8')
    res.status(200).send(md.render(data))
  } catch (err: any) {
    res.status(404).send(`File ${path}: ${err.message}`)
  }
})

export default router

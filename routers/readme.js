/**
 * File:        /routers/readme.js
 * Description: Render README.md in express
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2024-01-07  C2RLO  Initial
**/

import express from "express"
import fs from "fs"
import Markdown from "markdown-it"
import { logger } from "../utils/logger.js"

const router = express.Router()

router.get("/", async (req, res) => {
  const path = "../README.md"
  const md = Markdown()
  fs.readFile(path, "utf8", function (err, data) {
    if (err) {
      logger.error(`Error read ${path} file: ${err}`)
    }
    if (!data) res.send(`File ${path} not found, error: ${err}`).status(404)
    res.send(md.render(data)).status(200)
  })
})

export default router

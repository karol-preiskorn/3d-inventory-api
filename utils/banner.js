/**
 * File:        /utils/banner.js
 * Description: Print banner log
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2024-01-07  C2RLO  Initial
**/

import figlet from "figlet"
import fs from "fs"
import { logger } from "./logger.js"


export function banner() {
  const data = fs.readFileSync("./assets/font.flf", "utf8")
  figlet.parseFont("myfont", data)
  logger.warn(
    "\n" +
    figlet.textSync("3d-inv API", "myfont")
  )
}

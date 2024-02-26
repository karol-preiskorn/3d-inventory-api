/**
 * File:        /utils/banner.js
 * Description: Print banner log
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2024-01-07  C2RLO  Initial
 */

import figlet from 'figlet'
import fs from 'fs'
import { logger } from './logger.js'
import { promisify } from 'util'


const readFile = promisify(fs.readFile)

let fontLoaded = false

/**
 *
 */
async function loadFont() {
  if (!fontLoaded) {
    const data = await readFile('src/assets/font.flf', 'utf8')
    figlet.parseFont('myfont', data)
    fontLoaded = true
  }
}

/**
 *
 */
export async function banner() {
  await loadFont()
  logger.warn(
    '\n' +
    figlet.textSync('3d-inv API', 'myfont')
  )
}

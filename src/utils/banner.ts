/**
 * @description: Print banner log.
 * @version: 2024-01-07  C2RLO  Initial
 */

import figlet, { Fonts } from 'figlet'
import fs from 'fs/promises'

import { logger } from './logger.js'

let fontLoaded = false

/**
 * Loads the font used for rendering ASCII art.
 * If the font is not already loaded, it reads the font file and parses it.
 * @returns Promise<void> A promise that resolves when the font is loaded.
 */
async function loadFont(): Promise<void> {
  if (!fontLoaded) {
    const data = await fs.readFile('src/assets/font.flf', 'utf8')
    figlet.parseFont('myfont', data)
    fontLoaded = true
  }
}

/**
 * Displays a banner with the name of the API.
 * @returns {Promise<void>} A promise that resolves when the banner is displayed.
 */
export async function banner(): Promise<void> {
  await loadFont()
  logger.warn('\n' + figlet.textSync('3d-inv API', 'myfont' as Fonts))
}

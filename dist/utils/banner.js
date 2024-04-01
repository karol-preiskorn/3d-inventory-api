'use strict'
/**
 * File:        /utils/banner.js
 * Description: Print banner log.
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2024-01-07  C2RLO  Initial
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.banner = void 0
const fs_1 = require('fs')
const figlet_1 = __importDefault(require('figlet'))
const logger_js_1 = require('./logger.js')
let fontLoaded = false
/**
 * Loads the font used for rendering ASCII art.
 * If the font is not already loaded, it reads the font file and parses it.
 * @returns {Promise<void>} A promise that resolves when the font is loaded.
 */
async function loadFont() {
  if (!fontLoaded) {
    const data = await fs_1.promises.readFile('src/assets/font.flf', 'utf8')
    figlet_1.default.parseFont('myfont', data)
    fontLoaded = true
  }
}
/**
 * Displays a banner with the name of the API.
 * @returns {Promise<void>} A promise that resolves when the banner is displayed.
 */
async function banner() {
  await loadFont()
  logger_js_1.logger.warn(
    '\n' + figlet_1.default.textSync('3d-inv API', 'myfont'),
  )
}
exports.banner = banner
//# sourceMappingURL=banner.js.map

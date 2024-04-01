'use strict'
/**
 * File:        /routers/readme.js
 * Description: Render README.md in express
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
const express_1 = __importDefault(require('express'))
const fs_1 = __importDefault(require('fs'))
const markdown_it_1 = __importDefault(require('markdown-it'))
const logger_js_1 = require('../utils/logger.js')
const router = express_1.default.Router()
router.get('/', async (req, res) => {
  const path = '../../../README.md'
  const md = (0, markdown_it_1.default)()
  fs_1.default.readFile(path, 'utf8', function (err, data) {
    if (err) {
      logger_js_1.logger.error(`Error readFile ${path}: ${err}`)
    }
    if (!data) {
      res.status(404).send(`File ${path} not found: ${err}`)
    } else {
      res.status(200).send(md.render(data))
    }
  })
})
exports.default = router
//# sourceMappingURL=readme.js.map

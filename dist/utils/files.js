'use strict'
/**
 * @file /utils/files.js
 * @module /utils
 * @description operation on files
 * @version 2024-01-29 C2RLO - Initial
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.deleteFilesInDirectory = void 0
const fs_1 = __importDefault(require('fs'))
const path_1 = __importDefault(require('path'))
/**
 * Deletes all files in a given directory.
 * @param {string} directory - The directory path.
 */
function deleteFilesInDirectory(directory) {
  try {
    fs_1.default.readdir(directory, (err, files) => {
      if (err) {
        console.error(`read dir: ${directory} - ${err}`)
        return
      }
      for (const file of files) {
        try {
          fs_1.default.unlink(path_1.default.join(directory, file), (err) => {
            if (err) throw err
          })
        } catch (err) {
          console.error(`unlink ${file}: ${err}`)
        }
      }
    })
  } catch (err) {
    console.error(`read dir: ${directory} - ${err}`)
  }
}
exports.deleteFilesInDirectory = deleteFilesInDirectory
exports.default = deleteFilesInDirectory
//# sourceMappingURL=files.js.map

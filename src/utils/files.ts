/**
 * @file /utils/files.ts
 * @module /utils
 * @description Toolset operation on files
 * @version 2024-01-29 C2RLO - Initial
 * @version 2024-01-30 C2RLO - Add deleteFilesInDirectory
 * @version 2024-01-30 C2RLO - Fix deleteFilesInDirectory
 * @public
 */

import fs from 'fs'
import path from 'path'

/**
 * Deletes all files in a given directory.
 * @param {string} directory - The directory path.
 * @returns {void}
 * @example deleteFilesInDirectory('path/to/directory')
 * @public
 */
export function deleteFilesInDirectory(directory: string) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error(`read dir: ${directory} - ${err.message}`)
      return
    }
    for (const file of files) {
      fs.unlink(path.join(directory, file), (error) => {
        if (error) {
          console.error(`unlink ${file}: ${error.message}`)
        }
      }) // Add closing parenthesis here
    }
  })
}

export default deleteFilesInDirectory

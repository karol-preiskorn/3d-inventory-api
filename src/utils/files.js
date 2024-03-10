/**
 * @file /utils/files.js
 * @module /utils
 * @description operation on files
 * @version 2024-01-29 C2RLO - Initial
 */

import fs from 'fs'
import path from 'path'

/**
 * Deletes all files in a given directory.
 * @param {string} directory - The directory path.
 */
export function deleteFilesInDirectory(directory) {
  try {
    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error(`read dir: ${directory} - ${err}`)
        return
      }
      for (const file of files) {
        try {
          fs.unlink(path.join(directory, file), (err) => {
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

export default deleteFilesInDirectory

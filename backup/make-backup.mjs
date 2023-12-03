/*
 * File:        @/backup/make-backup.js
 * Description: create backup API app with data
 * Used by:
 * Dependency:
 *
 * Date        By       Comments
 * ----------  -------  ------------------------------
 * 2023-11-18  C2RLO
 */

import moment from "moment"
import { existsSync, mkdirSync, copySync } from "fs-extra"

import { createLogger, format, transports } from "winston"
const { combine, timestamp, label, printf, colorize } = format

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})

const logger = createLogger({
  format: combine(
    colorize(),
    label({ label: __filename.slice(__dirname.length + 1) }),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "error.log" })
  ]
})

const backupDir = moment().format("yyyy-MM-DD_HHmm")
const dir = "./backup/" + backupDir

if (!existsSync(dir)) {
  mkdirSync(dir)
}

logger.info("Create " + dir)

copySync("./src", dir, {
  filter: path => {
    console.log("path ===", path)
    return !(path.indexOf("node_modules") > -1)
  }
})

logger.info("Copy " + "./src to " + dir)

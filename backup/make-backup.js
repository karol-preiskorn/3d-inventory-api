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

const moment = require('moment')
const fs = require('fs-extra')
const chalk = require('chalk')

const { createLogger, format, transports } = require('winston')
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
    new transports.File({ filename: 'error.log' })
  ]
});

var backup_dir = moment().format('yyyy-MM-DD_HHmm')
var dir = './backup/' + backup_dir

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

logger.info('Create ' + dir)

fs.copySync('./src', dir, {
  filter: path => {
    console.log('path ===', path)
    return !(path.indexOf('node_modules') > -1)
  }
})

logger.info('Copy ' + './src to ' + dir)

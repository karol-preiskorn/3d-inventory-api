import { createLogger, format, transports } from 'winston'

const { combine, timestamp, label, printf, colorize } = format

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})

const logger = createLogger({
  format: combine(
    colorize({ all: true }),
    label({ label: __filename.slice(__dirname.length + 1) }),
    format.errors({ stack: true }),
    format.splat(),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log' })
  ]
})
export default logger

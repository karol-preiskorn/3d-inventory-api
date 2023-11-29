import { createLogger, format, transports, addColors } from "winston"
import path from "path"
import { fileURLToPath } from "url"

//const url = dirname(fileURLToPath(import.meta.url))
//const url = new URL(import.meta.url)

const { combine, timestamp, label, printf, colorize } = format

const myCustomLevels = {
  levels: {
    info: 0,
    warning: 1,
    error: 2,
    debug: 3
  },
  colors: {
    info: "green",
    warning: "yellow",
    error: "red",
    debug: "pink"
  }
}

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})
console.log(path.basename(require.main.id))

const logger = createLogger({
  levels: myCustomLevels.levels,
  format: combine(
    colorize({ all: true }),
    //label({ label: __filename.slice(__dirname.length + 1) }),
    label({ label: path.basename(require.main.id) }),
    format.errors({ stack: true }),
    format.splat(),
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "error.log", handleExceptions: true })
  ]
})

addColors(myCustomLevels.colors)

export default logger

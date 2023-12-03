/*
 * File:        /src/util/log.ts
 * Description:
 * Used by:
 * Dependency:
 *
 * Date        By       Comments
 * ----------  -------  ------------------------------
 * 2023-11-26  C2RLO    Initial
 */


import winston from "winston"

const fileURL = "Log"
// const fileURL = dirname(fileURLToPath(`module.exports = process.env.NODE_ENV === "test" ? "{ADD VALID VALUE FOR TESTS}" : "import.meta.url"`))


const log = (m: string) => {
  return winston.info(fileURL + ": " + m)
}

export default log

/*
 * File:        /src/environment.ts
 * Description:
 * Used by:
 * Dependency:
 *
 * Date        By       Comments
 * ----------  -------  ------------------------------
 * 2023-12-02  C2RLO    Initial
 */


declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string
      API_KEY_NAME: string
      CLUSTERURI: string
      COLLECTIONNAME: string
      CONNECT_STRING: string
      DBNAME: string
      GITHUB_AUTH_TOKEN: string
      NODE_ENV: "development" | "production"
      PASSWORD: string
      PORT?: string
      PWD: string
      REALM_CLI_PRIVATE_KEY: string
      REALM_CLI_PUBLIC_KEY: string
      SECRET_KEY: string
      SESSION_SECRET: string
      USERNAME: string
    }
  }
}
// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }

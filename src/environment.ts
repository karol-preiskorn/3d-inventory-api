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
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_AUTH_TOKEN: string
      NODE_ENV: 'development' | 'production'
      PORT?: string
      PWD: string
      REALM_CLI_PUBLIC_KEY: string
      REALM_CLI_PRIVATE_KEY: string
      API_KEY_NAME: string
      API_KEY: string
      SECRET_KEY: string
      CONNECT_STRING: string
      USERNAME: string
      PASSWORD: string
      CLUSTERURI: string
      DBNAME: string
      COLLECTIONNAME: string
    }
  }
}
// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }

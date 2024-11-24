/**
 * @module routers
 * @remarks This file contains the router for accessing the GitHub issues API
 * endpoint. It defines a GET route for retrieving GitHub issues and sets the
 * necessary headers for authentication.
 */
import '../utils/loadEnvironment'

import express from 'express'

const router = express.Router()
/**
 * The URL for accessing the GitHub issues API endpoint.
 */
const githubIssuesUrl = 'https://api.github.com/repos/karol-preiskorn/3d-inventory-angular-ui/issues'
const authToken = process.env.GITHUB_AUTH_TOKEN

router.get(
  githubIssuesUrl,
  (req: express.Request, res: express.Response) => {
    console.log('Get Issues ' + JSON.stringify(res, null, ' '))
    const issues = res as unknown as string
    return issues
  },
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.set('Authorization', `Bearer ${authToken}`)
    next()
  },
)

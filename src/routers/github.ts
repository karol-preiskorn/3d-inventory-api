/**
 * @remarks This file contains the router for accessing the GitHub issues API
 * endpoint. It defines a GET route for retrieving GitHub issues and sets the
 * necessary headers for authentication.
 */
import '../utils/loadEnvironment'

import axios from 'axios'
import express from 'express'

const router = express.Router()
/**
 * The URL for accessing the GitHub issues API endpoint.
 */
const githubIssuesUrl = 'https://api.github.com/repos/karol-preiskorn/3d-inventory-angular-ui/issues'
const authToken = process.env.GITHUB_AUTH_TOKEN

router.get('/github-issues', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const response = await axios.get(githubIssuesUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
    res.json(response.data)
  }
  catch (error) {
    next(error)
  }
})

export default router

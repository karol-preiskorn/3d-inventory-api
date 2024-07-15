import '../utils/loadEnvironment'

import express from 'express'

const router = express.Router()
const collectionName: string = 'github'
const githubIssuesUrl = 'https://api.github.com/repos/karol-preiskorn/3d-inventory-angular-ui/issues'
const authToken = process.env.GITHUB_AUTH_TOKEN
const baseUrl = 'https://api.github.com'
let issues = ''

router.get(
  githubIssuesUrl,
  (req: express.Request, res: express.Response) => {
    console.log('Get Issues ' + JSON.stringify(res, null, ' '))
    issues = res as unknown as string
  },
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.set('Authorization', `Bearer ${authToken}`)
    next()
  },
)

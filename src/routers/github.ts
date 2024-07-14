import '../utils/loadEnvironment'

import express from 'express'

const router = express.Router()
const collectionName: string = 'github'
let md: string | undefined
const githubIssuesUrl = 'https://api.github.com/karol-preiskorn/3d-inventory-angular-ui/issues'
const authToken = ''
const baseUrl = 'https://api.github.com'
let issues = ''

router.get(githubIssuesUrl, async (req: express.Request, res: express.Response) => {
  console.log('Get Issues ' + JSON.stringify(res, null, ' '))
  issues = res as unknown as string
})

import path from 'path'
import dotenv from 'dotenv'
import { RequestHandler } from 'express'
import fetch from 'node-fetch'
import getLogger from '../utils/logger'

const logger = getLogger('github')
const proc = '[github]'

dotenv.config({ path: path.resolve('./.env') })

export interface GitHubIssue {
  id: number
  number: number
  title: string
  state: string
  body: string
  user: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  }
  html_url: string
  created_at: string
  updated_at: string
}

const githubIssuesUrl = 'https://api.github.com/repos/karol-preiskorn/3d-inventory-angular-ui/issues'
const authToken = process.env.GH_AUTH_TOKEN

if (!authToken) {
  logger.error(`${proc} GH_AUTH_TOKEN environment variable is not set`)
  throw new Error('GH_AUTH_TOKEN environment variable is not set.')
}

/**
 * Get GitHub issues from the repository
 */
export const getGithubIssues: RequestHandler = async (_req, res) => {
  try {
    logger.info(`${proc} Fetching issues from GitHub API`)

    const response = await fetch(githubIssuesUrl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      logger.error(`${proc} GitHub API error: ${response.status} ${response.statusText}`)
      res.status(response.status).json({ error: 'Failed to fetch issues from GitHub' })

      return
    }

    const data = (await response.json()) as GitHubIssue[]

    logger.info(`${proc} Successfully fetched ${data.length} issues from GitHub`)
    res.status(200).json(data)
  } catch (error) {
    logger.error(`${proc} Error fetching GitHub issues: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'github',
      procedure: 'getGithubIssues',
      status: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error)
    })
  }
}

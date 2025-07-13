/**
 * @remarks Router for accessing the GitHub issues API endpoint.
 * Defines a GET route for retrieving GitHub issues with authentication.
 */

import dotenv from 'dotenv';
import path from 'path';
import express, { Request, Response as ExpressResponse } from 'express';
import logger from '../utils/logger';
// For node-fetch v3+, use the following import syntax:
import fetch from 'node-fetch';

const log = logger('github-router');

dotenv.config({ path: path.resolve('./.env') });

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  body: string;
  user: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  created_at: string;
  updated_at: string;
}

const router = express.Router();
const githubIssuesUrl = 'https://api.github.com/repos/karol-preiskorn/3d-inventory-angular-ui/issues';
const authToken = process.env.GH_AUTH_TOKEN;

if (!authToken) {
  throw new Error('GH_AUTH_TOKEN environment variable is not set.');
}
router.get('/issues', async (_req: Request, res: ExpressResponse): Promise<void> => {
  try {
    const response = await fetch(githubIssuesUrl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) {
      log.error(`GitHub API error: ${response.status} ${response.statusText}`);
      res.status(response.status).json({ error: 'Failed to fetch issues from GitHub' });
      return;
    }

    const data = (await response.json()) as GitHubIssue[];
    log.info(`GET /github/issues - Fetched ${data.length} issues from GitHub`);
    res.json(data);
  } catch (error) {
    log.error('Internal server error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

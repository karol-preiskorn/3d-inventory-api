import { RequestHandler } from 'express';
import fs from 'fs';
import Markdown from 'markdown-it';
import { promisify } from 'util';
import getLogger from '../utils/logger';

const logger = getLogger('readme');

const proc = '[readme]';

const readFileAsync = promisify(fs.readFile);

const md = new Markdown();

/**
 * Get and render README.md file
 */
export const getReadme: RequestHandler = async (_req, res) => {
  const path = './src/assets/README.md';

  try {
    logger.info(`${proc} Reading README file from: ${path}`);

    const data = await readFileAsync(path, 'utf8');

    const renderedMarkdown = md.render(data);

    logger.info(`${proc} Successfully rendered README file (${data.length} characters)`);

    res.status(200).send(renderedMarkdown);
  } catch (error) {
    logger.error(`${proc} Error reading README file: ${error instanceof Error ? error.message : String(error)}`);

    res.status(404).json({
      message: `File ${path}: ${error instanceof Error ? error.message : String(error)}`,
      module: 'readme',
      procedure: 'getReadme',
      status: 'File not found or read error'
    });
  }
};

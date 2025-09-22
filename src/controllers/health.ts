import { Request, Response } from 'express';
import type { Db } from 'mongodb';
import config from '../utils/config';
import getLogger from '../utils/logger';

const logger = getLogger('health');
const proc = '[health]';
const PORT = config.PORT;

export type HealthStatus = {
  status: string;
  timestamp: string;
  port: typeof PORT;
  environment: string | undefined;
  uptime: number;
  uptimeString: string;
  database: 'unknown' | 'connected' | 'not_initialized' | 'disconnected';
  error: string | null;
};

function formatUptime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hrs}h ${mins}m ${secs}s`;
}

export async function healthController(_req: Request, res: Response, db: Db) {
  const uptimeSeconds = process.uptime();
  const humanReadableUptime = formatUptime(uptimeSeconds);
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    uptimeString: humanReadableUptime,
    database: 'unknown',
    error: null,
  };

  try {
    if (db !== null) {
      await db.admin().ping();
      health.database = 'connected';
    } else {
      health.database = 'not_initialized';
      health.status = 'degraded';
      health.error = 'Database connection is not initialized.';
      logger.warn(`${proc} Database connection is not initialized.`);
    }
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'degraded';
    health.error = error instanceof Error ? error.message : String(error);
    logger.warn(`${proc} Database ping failed: ${health.error}`);
  }

  const statusCode = health.database === 'disconnected' || health.database === 'not_initialized' ? 503 : 200;

  res.status(statusCode).json(health);
}

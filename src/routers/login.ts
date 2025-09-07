
import jwt from 'jsonwebtoken';
import config from '../utils/config';
import getLogger from '../utils/logger';
import express, { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include 'user'

const router: express.Router = express.Router();

const logger = getLogger('auth');

const proc = '[login]';

const JWT_SECRET = config.JWT_SECRET || 'your-secret-key';

// Fake user for demo
const API_USER = { id: 1, username: 'carlo' };

export type JwtPayload = {
  id: number;
  username: string;
  iat?: number;
  exp?: number;
};

// Extend Express Request interface to include 'user' property using module augmentation
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

router.post('/', (req, res) => {
  const { username } = req.body;

  if (username !== API_USER.username) {
    logger.warn(`${proc} Invalid login attempt for user: ${username}`);

    return res.status(401).json({ message: `${proc} Invalid credentials` });
  }

  // Generate token (expires in 1 hour)
  const token = jwt.sign({ id: API_USER.id, username: API_USER.username }, JWT_SECRET, { expiresIn: '1h' });

  logger.info(`${proc} User logged in: ${username}`);
  res.json({ token });
});

// 2. Middleware to verify Bearer token
export function authenticateBearer(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Optionally attach payload to request
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: `Invalid or expired token ${err.message}` });
  }
}

// 3. Example protected route
router.get('/protected', authenticateBearer, (req, res) => {
  res.json({ message: `${proc} This is a protected route`, user: req.user });
});


export default router;

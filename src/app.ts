import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';
import express, { type Express } from 'express';

import { login } from './api/auth/login';
import { logout } from './api/auth/logout';
import { me } from './api/auth/me';
import { refresh } from './api/auth/refresh';
import { register } from './api/auth/register';
import { health } from './api/health';
import { authMiddleware } from './auth';
import { client } from './redis';

export function createApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static('public'));

  app.get('/hello', (_req: Request, res: Response) => {
    res.send('Hello World!');
  });

  app.get('/set', authMiddleware, async (req: Request, res: Response) => {
    const { key, value, ttl } = req.query as { key?: string; value?: string; ttl?: string };
    if (!key || !value) {
      return res.status(400).send('key and value query parameters are required');
    }

    try {
      if (ttl) {
        await client.set(key, value, { EX: parseInt(ttl, 10) });
      } else {
        await client.set(key, value);
      }
      return res.send(`Stored ${key}=${value}`);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Failed to set value');
    }
  });

  app.get('/get', authMiddleware, async (req: Request, res: Response) => {
    const { key } = req.query as { key?: string };
    if (!key) {
      return res.status(400).send('key query parameter is required');
    }

    try {
      const value = await client.get(key);
      if (value === null) {
        return res.status(404).send('Not found');
      }
      return res.send(value);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Failed to get value');
    }
  });

  app.get('/health', health);

  app.post('/register', register);

  app.post('/login', login);

  app.post('/refresh', refresh);

  app.post('/logout', logout);

  app.get('/me', authMiddleware, me);

  return app;
}

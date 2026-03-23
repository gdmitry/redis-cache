import type { Request, Response } from 'express';
import express from 'express';

import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();

import { client, connectRedis } from './redis';

// delegate Redis setup to redis.ts
connectRedis().catch(console.error);

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// Redis-backed cache endpoints
app.get('/set', async (req: Request, res: Response) => {
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
    res.send(`Stored ${key}=${value}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to set value');
  }
});

app.get('/get', async (req: Request, res: Response) => {
  const { key } = req.query as { key?: string };
  if (!key) {
    return res.status(400).send('key query parameter is required');
  }

  try {
    const value = await client.get(key);
    if (value === null) {
      return res.status(404).send('Not found');
    }
    res.send(value);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to get value');
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('healthy');
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

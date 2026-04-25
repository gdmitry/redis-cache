import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';
import express, { type Express } from 'express';
import swaggerUi from 'swagger-ui-express';

import { login } from './api/auth/login';
import { logout } from './api/auth/logout';
import { me } from './api/auth/me';
import { refresh } from './api/auth/refresh';
import { register } from './api/auth/register';
import { health } from './api/health';
import { authMiddleware } from './auth';
import { client } from './redis';
import { swaggerSpec } from './swagger';

export function createApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static('public'));

  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  /**
   * @openapi
   * /hello:
   *   get:
   *     summary: Hello endpoint
   *     description: Returns a simple Hello World message
   *     tags:
   *       - General
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   */
  app.get('/hello', (_req: Request, res: Response) => {
    res.send('Hello World!');
  });

  /**
   * @openapi
   * /set:
   *   get:
   *     summary: Set a cache value
   *     description: Sets a key-value pair in Redis cache
   *     tags:
   *       - Cache
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - name: key
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *         description: Cache key
   *       - name: value
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *         description: Cache value
   *       - name: ttl
   *         in: query
   *         required: false
   *         schema:
   *           type: integer
   *         description: Time to live in seconds
   *     responses:
   *       200:
   *         description: Value stored successfully
   *       400:
   *         description: Missing required parameters
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
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

  /**
   * @openapi
   * /get:
   *   get:
   *     summary: Get a cache value
   *     description: Retrieves a value from Redis cache by key
   *     tags:
   *       - Cache
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - name: key
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *         description: Cache key
   *     responses:
   *       200:
   *         description: Value retrieved successfully
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   *       400:
   *         description: Missing required parameters
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Key not found
   *       500:
   *         description: Server error
   */
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

  /**
   * @openapi
   * /health:
   *   get:
   *     summary: Health check
   *     description: Returns the health status of the API
   *     tags:
   *       - General
   *     responses:
   *       200:
   *         description: Service is healthy
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthResponse'
   */
  app.get('/health', health);

  /**
   * @openapi
   * /register:
   *   post:
   *     summary: Register a new user
   *     description: Creates a new user account
   *     tags:
   *       - Authentication
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       200:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       400:
   *         description: Bad request or user already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error
   */
  app.post('/register', register);

  /**
   * @openapi
   * /login:
   *   post:
   *     summary: Login user
   *     description: Authenticates user and returns JWT tokens
   *     tags:
   *       - Authentication
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *         headers:
   *           Set-Cookie:
   *             schema:
   *               type: string
   *               example: jwt=refresh_token; HttpOnly; Secure; SameSite=None
   *       400:
   *         description: Missing credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error
   */
  app.post('/login', login);

  /**
   * @openapi
   * /refresh:
   *   post:
   *     summary: Refresh access token
   *     description: Generates a new access token using refresh token
   *     tags:
   *       - Authentication
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *       401:
   *         description: Invalid or missing refresh token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error
   */
  app.post('/refresh', refresh);

  /**
   * @openapi
   * /logout:
   *   post:
   *     summary: Logout user
   *     description: Invalidates the user session
   *     tags:
   *       - Authentication
   *     security:
   *       - cookieAuth: []
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  app.post('/logout', logout);

  /**
   * @openapi
   * /me:
   *   get:
   *     summary: Get current user
   *     description: Returns the authenticated user's information
   *     tags:
   *       - Authentication
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: User information retrieved
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  app.get('/me', authMiddleware, me);

  return app;
}

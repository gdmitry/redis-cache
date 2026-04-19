import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from './prisma';

export function generateAccessToken(payload: Record<string, any>): string {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || '';
  const expiration = process.env.ACCESS_TOKEN_EXPIRY || '15m';
  return jwt.sign(payload, accessTokenSecret, { expiresIn: expiration } as SignOptions);
}

export function generateRefreshToken(payload: Record<string, any>): string {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || '';
  const expiration = process.env.REFRESH_TOKEN_EXPIRY || '24h';
  return jwt.sign(payload, refreshTokenSecret, { expiresIn: expiration } as SignOptions);
}

export function verifyAccessToken(token: string): Record<string, any> {
  try {
    const tokenSecret = process.env.ACCESS_TOKEN_SECRET || '';
    return jwt.verify(token, tokenSecret) as Record<string, any>;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function verifyRefreshToken(token: string): Record<string, any> {
  try {
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || '';
    return jwt.verify(token, refreshSecret) as Record<string, any>;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

// Password hashing functions
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function extractAccessToken(authHeader: string): string {
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid authorization header');
  }
  return parts[1];
}

export async function authMiddleware(req: any, res: any, next: any): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Missing authorization header' });
      return;
    }

    const token = extractAccessToken(authHeader);
    const decoded = verifyAccessToken(token);

    // Check if token exists in database
    const tokenRecord = await prisma.token.findFirst({
      where: { accessToken: token },
    });

    if (!tokenRecord) {
      res.status(401).json({ error: 'Token not found' });
      return;
    }

    // Check if token has expired
    if (new Date() > tokenRecord.expiresAt) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

import type { Response } from 'express';

const JWT_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export function setJWTCookie(res: Response, refreshToken: string): void {
  res.cookie('jwt', refreshToken, JWT_COOKIE_OPTIONS);
}

import type { Request, Response } from 'express';
import { generateAccessToken, generateRefreshToken, verifyPassword } from '../../auth';
import { setJWTCookie } from '../../cookie';
import { prisma } from '../../prisma';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'username and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const tokenPayload = { userId: user.id, username: user.username };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.token.create({
      data: {
        userId: user.id,
        refreshToken,
        accessToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    setJWTCookie(res, refreshToken);
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.json({ message: 'Login successful', accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to login' });
  }
}

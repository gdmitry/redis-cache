import type { Request, Response } from 'express';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../auth';
import { prisma } from '../../prisma';

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies.jwt;
    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token is missing' });
      return;
    }

    const token = await prisma.token.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!token || !token.user) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    if (new Date() > token.expiresAt) {
      res.status(401).json({ error: 'Refresh token expired' });
      return;
    }

    await prisma.token.delete({
      where: { id: token.id },
    });

    const refreshPayload = verifyRefreshToken(refreshToken);
    const { userId, username } = refreshPayload;

    const newAccessToken = generateAccessToken({ userId, username });
    const newRefreshToken = generateRefreshToken({ userId, username });

    await prisma.token.create({
      data: {
        userId: token.userId,
        refreshToken: newRefreshToken,
        accessToken: newAccessToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('jwt', newRefreshToken, {
      httpOnly: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.setHeader('Authorization', `Bearer ${newAccessToken}`);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

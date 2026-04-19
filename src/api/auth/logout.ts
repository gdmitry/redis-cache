import type { Request, Response } from 'express';
import { prisma } from '../../prisma';

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies.jwt;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is missing' });
      return;
    }

    await prisma.token.delete({
      where: { refreshToken },
    });

    res.clearCookie('jwt');
    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to logout' });
  }
}

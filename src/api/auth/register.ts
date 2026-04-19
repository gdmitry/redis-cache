import crypto from 'crypto';
import type { Request, Response } from 'express';
import { hashPassword } from '../../auth';
import { prisma } from '../../prisma';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'username and password are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();
    const user = await prisma.user.create({
      data: {
        userId,
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

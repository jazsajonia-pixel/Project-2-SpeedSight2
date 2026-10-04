import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSessionCookie,
  SESSION_EXPIRATION_DAYS,
} from '../lib/auth.js';
import { registerSchema, loginSchema } from '../schemas/index.js';

export const authRoutes = new Hono();

function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Database operation timed out')), ms)
    ),
  ]);
}

authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = registerSchema.parse(body);

    const existing = await withTimeout(
      prisma.user.findUnique({
        where: { email: parsed.email },
      })
    );

    if (existing) {
      return c.json(
        { error: { code: 'DUPLICATE_EMAIL', message: 'An account with this email address already exists' } },
        400
      );
    }

    const passwordHash = await hashPassword(parsed.password);

    const user = await withTimeout(
      prisma.user.create({
        data: {
          name: parsed.name,
          email: parsed.email,
          passwordHash,
        },
      })
    );

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRATION_DAYS);

    await withTimeout(
      prisma.session.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      })
    );

    setSessionCookie(c, token);

    return c.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      201
    );
  } catch (err: any) {
    if (err.message === 'Database operation timed out') {
      return c.json(
        { error: { code: 'DATABASE_TIMEOUT', message: 'Database query timed out. Please try again or use Demo Mode.' } },
        503
      );
    }
    throw err;
  }
});

authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.parse(body);

    const user = await withTimeout(
      prisma.user.findUnique({
        where: { email: parsed.email },
      })
    );

    if (!user) {
      return c.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Unable to sign in. Please check your email and password.' } }, 401);
    }

    const valid = await verifyPassword(parsed.password, user.passwordHash);
    if (!valid) {
      return c.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Unable to sign in. Please check your email and password.' } }, 401);
    }

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRATION_DAYS);

    await withTimeout(
      prisma.session.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      })
    );

    setSessionCookie(c, token);

    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    if (err.message === 'Database operation timed out') {
      return c.json(
        { error: { code: 'DATABASE_TIMEOUT', message: 'Database query timed out. Please try again or use Demo Mode.' } },
        503
      );
    }
    throw err;
  }
});

authRoutes.post('/logout', async (c) => {
  const token = getSessionCookie(c);
  if (token) {
    const tokenHash = hashSessionToken(token);
    await withTimeout(prisma.session.deleteMany({ where: { tokenHash } })).catch(() => {});
  }
  clearSessionCookie(c);
  return c.json({ message: 'Logged out successfully' });
});

authRoutes.get('/me', async (c) => {
  const token = getSessionCookie(c);
  if (!token) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, 401);
  }

  try {
    const tokenHash = hashSessionToken(token);
    const session = await withTimeout(
      prisma.session.findUnique({
        where: { tokenHash },
        include: { user: true },
      })
    );

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      clearSessionCookie(c);
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'Session expired' } }, 401);
    }

    return c.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });
  } catch {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Session lookup failed' } }, 401);
  }
});

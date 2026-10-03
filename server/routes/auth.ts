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

authRoutes.post('/register', async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.parse(body);

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

  if (existing) {
    return c.json(
      { error: { code: 'DUPLICATE_EMAIL', message: 'An account with this email address already exists' } },
      400
    );
  }

  const passwordHash = await hashPassword(parsed.password);

  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      passwordHash,
    },
  });

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRATION_DAYS);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

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
});

authRoutes.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.parse(body);

  const user = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

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

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  setSessionCookie(c, token);

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

authRoutes.post('/logout', async (c) => {
  const token = getSessionCookie(c);
  if (token) {
    const tokenHash = hashSessionToken(token);
    await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => {});
  }
  clearSessionCookie(c);
  return c.json({ message: 'Logged out successfully' });
});

authRoutes.get('/me', async (c) => {
  const token = getSessionCookie(c);
  if (!token) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, 401);
  }

  const tokenHash = hashSessionToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

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
});

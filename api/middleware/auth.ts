import { Context, Next } from 'hono';
import { User } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { getSessionCookie, hashSessionToken, clearSessionCookie } from '../utils/auth';

export type AuthContext = {
  authenticatedUser: User;
  sessionId: string;
};

export async function authMiddleware(c: Context, next: Next) {
  const rawToken = getSessionCookie(c);

  if (!rawToken) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
  }

  const tokenHash = hashSessionToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date()) {
    clearSessionCookie(c);
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Session expired or invalid' } }, 401);
  }

  c.set('authenticatedUser', session.user);
  c.set('sessionId', session.id);

  await next();
}

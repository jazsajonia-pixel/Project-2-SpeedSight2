import { Context, Next } from 'hono';
import { User } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { getSessionCookie, hashSessionToken, clearSessionCookie } from '../utils/auth';

export type AuthContext = {
  authenticatedUser: User;
  sessionId: string;
};

/**
 * Validates the session cookie before allowing a protected request to continue.
 * Clears invalid or expired cookies and attempts to delete expired sessions.
 *
 * @param c - Request context populated with the authenticated user and session ID.
 * @param next - Next handler to invoke when the session is valid.
 * @returns A 401 JSON response for missing or invalid sessions, otherwise no value.
 */
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

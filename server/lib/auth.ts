import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { Context } from 'hono';

export const SESSION_COOKIE_NAME = 'speedsight_session';
export const SESSION_EXPIRATION_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function setSessionCookie(c: Context, token: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_EXPIRATION_DAYS);

  setCookie(c, SESSION_COOKIE_NAME, token, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'Lax',
    expires,
  });
}

export function clearSessionCookie(c: Context) {
  deleteCookie(c, SESSION_COOKIE_NAME, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'Lax',
  });
}

export function getSessionCookie(c: Context): string | undefined {
  return getCookie(c, SESSION_COOKIE_NAME);
}

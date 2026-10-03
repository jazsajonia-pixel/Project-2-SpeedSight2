// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import { app, GET, POST, PATCH, DELETE } from '../index';
import { hashPassword, verifyPassword, hashSessionToken } from '../utils/auth';
import { prisma } from '../utils/prisma';

vi.mock('../utils/prisma', () => {
  const model = () => ({ findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(),
    update: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), count: vi.fn(), aggregate: vi.fn() });
  return { prisma: { user: model(), session: model(), monitoringSession: model(), cameraConfiguration: model(),
    calibrationProfile: model(), speedThreshold: model(), vehicleDetection: model(), savedReport: model(), $queryRaw: vi.fn() } };
});
const db = vi.mocked(prisma, true);
const id = '11111111-1111-4111-8111-111111111111';
const user = { id, name: 'Test User', email: 'test@example.com', passwordHash: 'private', createdAt: new Date(), updatedAt: new Date() };
const cookie = 'speedsight_session=synthetic-test-token';
function request(path: string, method = 'GET', data?: unknown, authenticated = true) {
  return app.request(`/api${path}`, { method, headers: {
    'Content-Type': 'application/json', ...(authenticated && { Cookie: cookie }),
  }, ...(data !== undefined && { body: JSON.stringify(data) }) });
}
beforeEach(() => {
  vi.resetAllMocks();
  db.session.delete.mockResolvedValue({} as never);
  db.session.findUnique.mockResolvedValue({ id: 'session', userId: id, tokenHash: hashSessionToken('synthetic-test-token'),
    expiresAt: new Date(Date.now() + 60_000), createdAt: new Date(), updatedAt: new Date(), user } as never);
});
describe('authentication boundaries', () => {
  it('hashes and verifies passwords without storing plaintext', async () => {
    const hash = await hashPassword('ValidPass123!');
    expect(hash).not.toBe('ValidPass123!');
    expect(await verifyPassword('ValidPass123!', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
  it.each([
    ['/auth/register', { name: ' ', email: 'bad', password: 'short' }],
    ['/auth/register', { name: 'User', email: 'u@example.com', password: '😀'.repeat(19) }],
    ['/auth/login', { email: 'bad', password: '' }],
  ])('validates %s', async (path, data) => {
    expect((await request(path, 'POST', data)).status).toBe(400);
    expect(db.user.create).not.toHaveBeenCalled();
    expect(db.session.create).not.toHaveBeenCalled();
  });
  it('normalizes registration and stores only a hashed token with a production cookie', async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockResolvedValue(user);
    vi.stubEnv('NODE_ENV', 'production');
    try {
      const res = await request('/auth/register', 'POST', { name: 'Test User', email: ' TEST@EXAMPLE.COM ', password: 'ValidPass123!' });
      expect(res.status).toBe(201);
      expect(db.user.create.mock.calls[0][0].data.email).toBe('test@example.com');
      expect(await verifyPassword('ValidPass123!', db.user.create.mock.calls[0][0].data.passwordHash)).toBe(true);
      const setCookie = res.headers.get('set-cookie')!;
      for (const attribute of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/', 'Expires=']) expect(setCookie).toContain(attribute);
      const token = setCookie.split(';')[0].split('=')[1];
      expect(db.session.create.mock.calls[0][0].data.tokenHash).toBe(hashSessionToken(token));
      const body = await res.text();
      expect(body).not.toContain('passwordHash'); expect(body).not.toContain(token);
    } finally { vi.unstubAllEnvs(); }
  });
  it('rejects duplicate emails including a concurrent unique constraint conflict', async () => {
    db.user.findUnique.mockResolvedValue(user);
    const data = { name: 'User', email: user.email, password: 'ValidPass123!' };
    expect((await request('/auth/register', 'POST', data)).status).toBe(400);
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('private DB details', { code: 'P2002', clientVersion: '5.22.0' }));
    const res = await request('/auth/register', 'POST', data);
    expect(res.status).toBe(400); expect((await res.json()).error.code).toBe('DUPLICATE_EMAIL');
  });
  it('returns the same generic error for missing users and wrong passwords', async () => {
    db.user.findUnique.mockResolvedValue(null);
    const missing = await request('/auth/login', 'POST', { email: user.email, password: 'wrong' });
    db.user.findUnique.mockResolvedValue({ ...user, passwordHash: await hashPassword('ValidPass123!') });
    const wrong = await request('/auth/login', 'POST', { email: user.email, password: 'wrong' });
    expect(missing.status).toBe(401); expect(wrong.status).toBe(401);
    expect(await wrong.json()).toEqual(await missing.json());
  });
  it('logs in, reads current user, and invalidates logout tokens', async () => {
    db.user.findUnique.mockResolvedValue({ ...user, passwordHash: await hashPassword('ValidPass123!') });
    expect((await request('/auth/login', 'POST', { email: user.email, password: 'ValidPass123!' })).status).toBe(200);
    const me = await request('/auth/me');
    expect(await me.json()).toEqual({ user: { id, name: user.name, email: user.email } });
    const logout = await request('/auth/logout', 'POST');
    expect(logout.status).toBe(200);
    expect(db.session.deleteMany).toHaveBeenCalledWith({ where: { tokenHash: hashSessionToken('synthetic-test-token') } });
    expect(logout.headers.get('set-cookie')).toContain('Max-Age=0');
    db.session.findUnique.mockResolvedValue(null);
    expect((await request('/sessions')).status).toBe(401);
  });
  it('rejects expired sessions on both me and protected routes and clears the cookie', async () => {
    db.session.findUnique.mockResolvedValue({ expiresAt: new Date(0), id: 'expired', user } as never);
    for (const path of ['/auth/me', '/sessions']) {
      const res = await request(path); expect(res.status).toBe(401);
      expect(res.headers.get('set-cookie')).toContain('Max-Age=0');
    }
    expect(db.monitoringSession.findMany).not.toHaveBeenCalled();
  });
  it.each(['/sessions', '/cameras', '/calibrations', '/speed-thresholds', '/detections', '/dashboard/stats', '/reports', '/auth/me'])('protects %s', async (path) => {
    expect((await request(path, 'GET', undefined, false)).status).toBe(401);
  });
  it('does not claim logout succeeded when database invalidation fails', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    db.session.deleteMany.mockRejectedValue(new Error('postgres secret runtime detail'));
    const res = await request('/auth/logout', 'POST');
    expect(res.status).toBe(500); expect(await res.text()).not.toContain('postgres secret');
    expect(log).toHaveBeenCalled(); log.mockRestore();
  });
  it('rejects cross-origin and non-JSON writes and malformed JSON', async () => {
    expect((await app.request('/api/auth/login', { method: 'POST', headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' }, body: '{}' })).status).toBe(403);
    expect((await app.request('/api/auth/login', { method: 'POST', body: '{}' })).status).toBe(415);
    expect((await app.request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status).toBe(400);
  });
});

describe('resource ownership and regressions', () => {
  it.each([
    ['sessions', 'monitoringSession', { name: 'Session' }],
    ['cameras', 'cameraConfiguration', { name: 'Camera' }],
    ['calibrations', 'calibrationProfile', { name: 'Calibration', knownDistance: 50 }],
    ['speed-thresholds', 'speedThreshold', { name: 'Threshold', normalMaximum: 30, warningMaximum: 35 }],
  ] as const)('scopes %s reads, creates and writes to the authenticated owner', async (path, model, data) => {
    const delegate = db[model];
    await request(`/${path}?userId=attacker`);
    expect(delegate.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: id } }));
    await request(`/${path}`, 'POST', { ...data, userId: 'attacker' });
    expect(delegate.create).toHaveBeenCalledWith({ data: expect.objectContaining({ userId: id }) });
    delegate.findFirst.mockResolvedValue(null);
    for (const method of ['GET', 'PATCH', 'DELETE']) {
      expect((await request(`/${path}/${id}`, method, method === 'PATCH' ? data : undefined)).status).toBe(404);
      expect(delegate.findFirst).toHaveBeenLastCalledWith(expect.objectContaining({ where: { id, userId: id } }));
    }
    expect(delegate.update).not.toHaveBeenCalled(); expect(delegate.delete).not.toHaveBeenCalled();
  });
  it('scopes nested detections/reports and refuses report creation for another user', async () => {
    for (const [path, delegate] of [['detections', db.vehicleDetection], ['reports', db.savedReport]] as const) {
      await request(`/${path}`);
      expect(delegate.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { session: { userId: id } } }));
      delegate.findFirst.mockResolvedValue(null);
      expect((await request(`/${path}/${id}`)).status).toBe(404);
      expect(delegate.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id, session: { userId: id } } }));
    }
    expect((await request(`/reports/${id}`, 'DELETE')).status).toBe(404);
    db.monitoringSession.findFirst.mockResolvedValue(null);
    expect((await request('/reports', 'POST', { name: 'Report', sessionId: id })).status).toBe(404);
    expect(db.savedReport.create).not.toHaveBeenCalled(); expect(db.savedReport.delete).not.toHaveBeenCalled();
  });
  it('validates final thresholds on partial PATCH, and guards concurrent updates', async () => {
    db.speedThreshold.findFirst.mockResolvedValue({ id, name: 'Road', normalMaximum: 30, warningMaximum: 35, unit: 'mph' } as never);
    for (const patch of [{ normalMaximum: 40 }, { warningMaximum: 25 }, { normalMaximum: 35 }]) {
      expect((await request(`/speed-thresholds/${id}`, 'PATCH', patch)).status).toBe(400);
    }
    expect(db.speedThreshold.update).not.toHaveBeenCalled();
    expect((await request(`/speed-thresholds/${id}`, 'PATCH', { normalMaximum: 32 })).status).toBe(200);
    expect(db.speedThreshold.update).toHaveBeenCalledWith({ where: { id, userId: id, normalMaximum: 30, warningMaximum: 35 }, data: { normalMaximum: 32 } });
    expect((await request('/speed-thresholds', 'POST', { name: 'Bad', normalMaximum: 40, warningMaximum: 35 })).status).toBe(400);
  });
  it('applies inclusive dates with ownership and validates dates/ranges/limits', async () => {
    const from = '2026-01-01T00:00:00Z', to = '2026-01-02T00:00:00Z';
    await request(`/detections?from=${from}&to=${to}&sessionId=${id}&classification=WARNING&vehicleType=Car&limit=10`);
    expect(db.vehicleDetection.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {
      session: { userId: id }, sessionId: id, classification: 'WARNING', vehicleType: 'Car', detectedAt: { gte: new Date(from), lte: new Date(to) },
    }, take: 10 }));
    for (const query of ['from=bad', 'from=2026-02-30T00:00:00Z', `from=${to}&to=${from}`, 'limit=501', 'classification=INVALID']) {
      expect((await request(`/detections?${query}`)).status).toBe(400);
    }
  });
  it('Vercel Web handlers preserve API methods and the public health route', async () => {
    const health = await GET(new Request('http://localhost/api/health'));
    expect(health.status).toBe(200); expect((await health.json()).service).toBe('speedsight-api');
    for (const [method, handler] of [['POST', POST], ['PATCH', PATCH], ['DELETE', DELETE]] as const) {
      const res = await handler(new Request(`http://localhost/api/sessions/${id}`, { method, headers: { 'Content-Type': 'application/json' } }));
      expect(res.status).toBe(401);
    }
  });
});

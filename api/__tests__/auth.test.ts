import { describe, it, expect } from 'vitest';
import { app } from '../index.js';

describe('API Route Security & Health Verification', () => {
  it('GET /api/health returns a valid health response', async () => {
    const res = await app.request('/api/health');
    expect([200, 503]).toContain(res.status);

    const data = await res.json();
    expect(data).toHaveProperty('status');
    expect(['ok', 'degraded']).toContain(data.status);
    expect(data).toHaveProperty('service', 'speedsight-api');
    expect(data).toHaveProperty('database');
    expect(data).toHaveProperty('timestamp');
  });

  it('POST /api/auth/register rejects malformed JSON without reaching the database', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"email":',
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      error: { code: 'INVALID_JSON' },
    });
  });

  it('POST /api/auth/register returns structured validation errors for invalid input', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'A', email: 'not-an-email', password: 'short' }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: ['name'] }),
      expect.objectContaining({ path: ['email'] }),
      expect.objectContaining({ path: ['password'] }),
    ]));
  });

  it('POST /api/auth/login rejects malformed JSON without exposing database errors', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '',
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      error: { code: 'INVALID_JSON', message: 'Invalid JSON request body' },
    });
  });

  it('GET /api/auth/me returns 401 when the session cookie is missing', async () => {
    const res = await app.request('/api/auth/me');

    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({
      error: { code: 'UNAUTHORIZED' },
    });
  });

  it('POST /api/auth/logout is idempotent without a session cookie', async () => {
    const res = await app.request('/api/auth/logout', { method: 'POST' });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: 'Logged out successfully' });
    expect(res.headers.get('set-cookie')).toContain('speedsight_session=;');
  });

  it('GET /api/sessions unauthenticated returns 401 UNAUTHORIZED', async () => {
    const res = await app.request('/api/sessions');
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/cameras unauthenticated returns 401 UNAUTHORIZED', async () => {
    const res = await app.request('/api/cameras');
    expect(res.status).toBe(401);
  });

  it('GET /api/calibrations unauthenticated returns 401 UNAUTHORIZED', async () => {
    const res = await app.request('/api/calibrations');
    expect(res.status).toBe(401);
  });

  it('GET /api/speed-thresholds unauthenticated returns 401 UNAUTHORIZED', async () => {
    const res = await app.request('/api/speed-thresholds');
    expect(res.status).toBe(401);
  });

  it('GET /api/dashboard/stats unauthenticated returns 401 UNAUTHORIZED', async () => {
    const res = await app.request('/api/dashboard/stats');
    expect(res.status).toBe(401);
  });
});

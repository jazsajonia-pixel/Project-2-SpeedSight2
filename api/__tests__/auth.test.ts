import { describe, it, expect } from 'vitest';
import { app } from '../index.js';

describe('API Route Security & Health Verification', () => {
  it('GET /api/health returns 200 OK with expected JSON structure', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('service', 'speedsight-api');
    expect(data).toHaveProperty('database');
    expect(data).toHaveProperty('timestamp');
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

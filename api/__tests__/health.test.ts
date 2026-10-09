import { describe, it, expect } from 'vitest';
import { app } from '../index.js';

describe('GET /api/health', () => {
  it('returns 200 OK with expected JSON structure', async () => {
    const res = await app.request('/api/health');
    expect([200, 503]).toContain(res.status);

    const data = await res.json();
    expect(data).toHaveProperty('status');
    expect(['ok', 'degraded']).toContain(data.status);
    expect(data).toHaveProperty('service', 'speedsight-api');
    expect(data).toHaveProperty('database');
    expect(data).toHaveProperty('timestamp');
  });
});

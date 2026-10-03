import { describe, it, expect } from 'vitest';
import { app } from '../index.js';

describe('GET /api/health', () => {
  it('returns 200 OK with expected JSON structure', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('service', 'speedsight-api');
    expect(data).toHaveProperty('database');
    expect(data).toHaveProperty('timestamp');
  });
});

import { describe, expect, it } from 'vitest';
import { checkDatabaseHealth } from '../utils/health.js';

describe('checkDatabaseHealth', () => {
  it('reports connected when the query succeeds', async () => {
    await expect(checkDatabaseHealth(async () => undefined)).resolves.toBe('connected');
  });

  it('reports unavailable when the query rejects', async () => {
    await expect(checkDatabaseHealth(async () => {
      throw new Error('database unavailable');
    })).resolves.toBe('unavailable');
  });

  it('reports timeout without waiting for a stuck query', async () => {
    const start = Date.now();
    const result = await checkDatabaseHealth(() => new Promise(() => undefined), 20);

    expect(result).toBe('timeout');
    expect(Date.now() - start).toBeLessThan(250);
  });
});

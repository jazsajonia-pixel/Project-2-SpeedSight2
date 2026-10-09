import { describe, expect, it } from 'vitest';
import { normalizeDatabaseUrl } from '../utils/prisma-url.js';

describe('normalizeDatabaseUrl', () => {
  it('adds a single connection for serverless Prisma instances', () => {
    const normalized = normalizeDatabaseUrl('postgresql://user:pass@db.example/speedsight?sslmode=require');

    expect(normalized).toContain('connection_limit=1');
    expect(normalized).toContain('sslmode=require');
  });

  it('preserves an explicitly configured connection limit', () => {
    const url = 'postgresql://user:pass@db.example/speedsight?connection_limit=5&schema=public';

    expect(normalizeDatabaseUrl(url)).toContain('connection_limit=5');
    expect(normalizeDatabaseUrl(url)).not.toContain('connection_limit=1');
  });

  it('returns malformed URLs unchanged for Prisma to diagnose', () => {
    const malformed = 'not-a-database-url';

    expect(normalizeDatabaseUrl(malformed)).toBe(malformed);
  });
});

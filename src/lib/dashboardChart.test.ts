import { describe, expect, it } from 'vitest';
import { getDashboardTrend } from './dashboardChart';

describe('getDashboardTrend', () => {
  it('returns the requested preset without changing its values', () => {
    expect(getDashboardTrend('6h')).toHaveLength(6);
    expect(getDashboardTrend('12h')).toHaveLength(8);
    expect(getDashboardTrend('24h')).toHaveLength(6);
  });

  it('returns labeled, bounded traffic values', () => {
    for (const point of getDashboardTrend('12h')) {
      expect(point.label).toMatch(/^\d{2}:\d{2}$/);
      expect(point.value).toBeGreaterThanOrEqual(0);
      expect(point.value).toBeLessThanOrEqual(100);
    }
  });
});

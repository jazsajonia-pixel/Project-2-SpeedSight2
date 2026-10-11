export type DashboardRange = '6h' | '12h' | '24h';

export interface DashboardTrendPoint {
  label: string;
  value: number;
}

const TREND_PRESETS: Record<DashboardRange, DashboardTrendPoint[]> = {
  '6h': [
    { label: '08:00', value: 42 },
    { label: '09:00', value: 68 },
    { label: '10:00', value: 54 },
    { label: '11:00', value: 81 },
    { label: '12:00', value: 72 },
    { label: '13:00', value: 92 },
  ],
  '12h': [
    { label: '06:00', value: 35 },
    { label: '08:00', value: 55 },
    { label: '10:00', value: 90 },
    { label: '12:00', value: 60 },
    { label: '14:00', value: 40 },
    { label: '16:00', value: 85 },
    { label: '18:00', value: 100 },
    { label: '20:00', value: 70 },
  ],
  '24h': [
    { label: '00:00', value: 28 },
    { label: '04:00', value: 22 },
    { label: '08:00', value: 74 },
    { label: '12:00', value: 100 },
    { label: '16:00', value: 82 },
    { label: '20:00', value: 58 },
  ],
};

export function getDashboardTrend(range: DashboardRange): DashboardTrendPoint[] {
  return TREND_PRESETS[range];
}

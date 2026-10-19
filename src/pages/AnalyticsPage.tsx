import React from 'react';
import { Activity, BarChart2, Gauge, Car } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { useDashboardStatsQuery, useDetectionsQuery } from '../services/queries/useSpeedSightQueries';

export const AnalyticsPage: React.FC = () => {
  const statsQuery = useDashboardStatsQuery();
  const detectionsQuery = useDetectionsQuery();
  const detections = detectionsQuery.data?.data ?? [];
  const typeCounts = detections.reduce((counts: Record<string, number>, item: any) => {
    const type = item.vehicleType || 'Unknown';
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
  const types = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const measuredSpeeds = detections.map((item: any) => Number(item.estimatedSpeed)).filter((speed: number) => Number.isFinite(speed) && speed > 0);
  const averageSavedSpeed = measuredSpeeds.length
    ? (measuredSpeeds.reduce((sum: number, speed: number) => sum + speed, 0) / measuredSpeeds.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Traffic analytics" subtitle="Aggregates from your saved monitoring records; no sample traffic is included." badge={<Badge variant="neutral">Saved data</Badge>} />
      {(statsQuery.isError || detectionsQuery.isError) && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">Some analytics could not load. Check your connection and try again.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Detections" value={detectionsQuery.isLoading ? '…' : String(statsQuery.data?.data?.vehiclesDetected ?? detections.length)} subtext="Saved vehicle records" icon={<Car className="w-5 h-5" />} />
        <StatCard title="Average recorded speed" value={statsQuery.isLoading ? '…' : averageSavedSpeed ? `${averageSavedSpeed} km/h` : 'Not available'} subtext={averageSavedSpeed ? `${measuredSpeeds.length} measured records` : 'Calibration is not connected'} icon={<Gauge className="w-5 h-5" />} />
        <StatCard title="Speeding records" value={statsQuery.isLoading ? '…' : String(statsQuery.data?.data?.speedingEvents ?? 0)} subtext="As classified by saved records" icon={<Activity className="w-5 h-5" />} />
        <StatCard title="Vehicle classes" value={detectionsQuery.isLoading ? '…' : String(types.length)} subtext="Types in saved detections" icon={<BarChart2 className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Detected vehicle types" subtitle="Counts calculated from saved detection records.">
          {detectionsQuery.isLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading saved detections…</p> : types.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No saved detections yet. Run a monitoring session to build this breakdown.</p> : (
            <div className="space-y-3">
              {types.map(([type, count]) => {
                const share = detections.length ? (count / detections.length) * 100 : 0;
                return <div key={type} className="space-y-1"><div className="flex justify-between text-sm"><span className="font-medium text-slate-800">{type}</span><span className="text-slate-500">{count} · {share.toFixed(0)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-600" style={{ width: `${share}%` }} /></div></div>;
              })}
            </div>
          )}
        </Card>
        <Card title="Speed analysis" subtitle="Speed trends are withheld until real-world calibration is connected to detection measurements.">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
            <strong>Why this is blank:</strong> the current browser model detects and tracks vehicles, but saved records do not yet contain calibrated speed measurements. Showing a distribution now would imply precision the app does not have.
          </div>
          <p className="mt-4 text-xs text-slate-500">Use the calibration guide to understand the measurement steps and current limitations.</p>
        </Card>
      </div>
    </div>
  );
};

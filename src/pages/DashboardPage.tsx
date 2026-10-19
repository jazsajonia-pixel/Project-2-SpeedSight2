import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Car, Gauge, Radio, Video } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useDashboardStatsQuery, useDetectionsQuery } from '../services/queries/useSpeedSightQueries';

export const DashboardPage: React.FC = () => {
  const statsQuery = useDashboardStatsQuery();
  const detectionsQuery = useDetectionsQuery();
  const stats = statsQuery.data?.data;
  const detections = detectionsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic overview"
        subtitle="A summary of records saved from your real monitoring sessions."
        badge={<Badge variant="neutral">Live data</Badge>}
        actions={(
          <Link to="/monitoring">
            <Button size="sm" icon={<Video className="w-4 h-4" />}>Start monitoring</Button>
          </Link>
        )}
      />

      {(statsQuery.isError || detectionsQuery.isError) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
          Could not load some saved traffic data. Check your connection and reload this page.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Saved detections" value={statsQuery.isLoading ? '…' : String(stats?.vehiclesDetected ?? 0)} subtext="From your sessions" icon={<Car className="w-5 h-5" />} />
        <StatCard title="Active sessions" value={statsQuery.isLoading ? '…' : String(stats?.activeSessions ?? 0)} subtext="Currently marked active" icon={<Radio className="w-5 h-5" />} />
        <StatCard title="Speed estimates" value={statsQuery.isLoading ? '…' : stats?.averageSpeed ? `${stats.averageSpeed} km/h` : 'Not available'} subtext={stats?.averageSpeed ? 'Saved measurements only' : 'Calibration is not connected yet'} icon={<Gauge className="w-5 h-5" />} />
        <StatCard title="Detection engine" value="In browser" subtext="COCO-SSD vehicle classes" icon={<Activity className="w-5 h-5" />} />
      </div>

      <Card
        title="Recent vehicle detections"
        subtitle="Actual records saved from browser-based analysis. Speed is shown only when a non-zero estimate exists."
        action={(
          <Link to="/detections">
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>View records</Button>
          </Link>
        )}
      >
        {detectionsQuery.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500" role="status">Loading saved detections…</p>
        ) : detections.length === 0 ? (
          <div className="py-10 text-center">
            <Car className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="font-medium text-slate-800">No saved detections yet</p>
            <p className="mt-1 text-sm text-slate-500">Start a camera or local-video session to create real detection records.</p>
            <Link className="mt-4 inline-block" to="/monitoring"><Button size="sm">Open monitoring</Button></Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Estimated speed</th><th className="px-4 py-3">Confidence</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detections.slice(0, 8).map((detection: any) => (
                  <tr key={detection.id}>
                    <td className="px-4 py-3 text-xs text-slate-500">{detection.detectedAt ? new Date(detection.detectedAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 font-medium">{detection.trackingId || '—'}</td>
                    <td className="px-4 py-3">{detection.vehicleType || '—'}</td>
                    <td className="px-4 py-3">{detection.estimatedSpeed > 0 ? `${detection.estimatedSpeed} ${detection.speedUnit || 'km/h'}` : 'Not calibrated'}</td>
                    <td className="px-4 py-3">{typeof detection.confidence === 'number' ? `${Math.round(detection.confidence * 100)}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

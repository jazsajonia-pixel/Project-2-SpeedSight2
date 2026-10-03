import { DataTable } from '../components/ui/DataTable';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Gauge,
  ShieldAlert,
  Clock,
  Video,
  Play,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { DEMO_DETECTIONS } from '../lib/demoData';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic Overview"
        subtitle="Monitor vehicle activity and estimated speed measurements."
        badge={<Badge variant="info">Demo Data</Badge>}
        actions={
          <div className="flex gap-2">
            <Link to="/monitoring">
              <Button size="sm" icon={<Video className="w-4 h-4" />}>
                Start Monitoring
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Vehicles Detected"
          value="1,821"
          subtext="Total across 4 sessions"
          icon={<Car className="w-5 h-5" />}
          trend={{ value: '+12.4%', positive: true }}
        />
        <StatCard
          title="Average Speed"
          value="36.7 mph"
          subtext="Speed limit threshold: 30 mph"
          icon={<Gauge className="w-5 h-5" />}
        />
        <StatCard
          title="Speeding Events"
          value="151"
          subtext="8.2% violation rate"
          icon={<ShieldAlert className="w-5 h-5" />}
          trend={{ value: '-2.1%', positive: true }}
        />
        <StatCard
          title="Active Sessions"
          value="1 Active"
          subtext="Main St & 4th Ave"
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Monitoring Preview Panel */}
        <div className="lg:col-span-2">
          <Card
            title="Live Monitoring Preview"
            subtitle="Simulated real-time camera feed with object detection overlay"
            action={<StatusIndicator status="active" label="SIMULATED FEED" />}
          >
            <div className="relative min-h-[280px] aspect-video bg-slate-900 rounded-xl overflow-hidden flex flex-col justify-between p-4 border border-slate-800">
              {/* Background Road Graphics Placeholder */}
              <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                <div className="w-full h-1/2 border-y-2 border-dashed border-slate-400 transform -rotate-12"></div>
              </div>

              {/* Bounding Box Mock Overlay 1 */}
              <div className="absolute top-[35%] left-[25%] border-2 border-emerald-400 bg-emerald-500/10 rounded-xs p-1">
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-1 rounded-2xs">
                  Sedan #8492 | 28 mph
                </span>
              </div>

              {/* Bounding Box Mock Overlay 2 (Speeding) */}
              <div className="absolute top-[48%] left-[55%] border-2 border-rose-500 bg-rose-500/20 rounded-xs p-1">
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1 rounded-2xs">
                  SPEEDING #8489 | 48 mph
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-900/80 p-2 rounded-lg backdrop-blur-xs z-10">
                <span className="font-mono">CAM-01: Main St Intersection</span>
                <span className="font-mono">FPS: 59.8 | RES: 1080p</span>
              </div>

              <div className="text-center py-8 z-10">
                <p className="text-sm font-semibold text-slate-300">
                  Camera Feed Preview Container
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Camera input is planned; this preview uses sample values.
                </p>
              </div>

              <div className="flex justify-between items-center z-10">
                <Badge variant="normal">Demo Overlay</Badge>
                <Link to="/monitoring">
                  <Button size="sm" variant="secondary" icon={<Play className="w-3.5 h-3.5" />}>
                    Open Preview
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Traffic Activity Chart Placeholder */}
        <div>
          <Card title="Traffic Volume & Speed Trend" subtitle="Sample hourly vehicle distribution">
            <div className="space-y-4">
              <div className="h-44 bg-slate-50 border border-slate-100 rounded-lg p-3 flex flex-col justify-between">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Vehicles/hr</span>
                  <span className="font-mono">Peak: 240 v/h @ 08:00</span>
                </div>
                {/* Visual Bar Graph Mock */}
                <div className="flex items-end justify-between h-28 gap-1 pt-2">
                  {[35, 55, 90, 60, 40, 85, 100, 70, 45, 60].map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-200 hover:bg-blue-500 transition rounded-t-xs relative group" style={{ height: `${h}%` }}>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1 py-0.5 rounded-2xs pointer-events-none">
                        {h * 2}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-900 flex items-start gap-2.5">
                <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Peak Traffic Observed:</strong> Highest velocity compliance recorded during mid-day hours.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Detections */}
      <Card
        title="Recent Vehicle Detections"
        subtitle="Sample detections — no camera measurements"
        action={
          <Link to="/detections">
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All
            </Button>
          </Link>
        }
      >
        <DataTable caption="Dashboard — sample data" rows={DEMO_DETECTIONS} rowKey={(row) => row.id} columns={[
{ header: 'Time', className: 'text-xs font-mono text-slate-500', cell: (det) => <>{det.timestamp}</> },
{ header: 'Vehicle ID', className: 'font-semibold text-slate-900', cell: (det) => <>{det.vehicleId}</> },
{ header: 'Type', className: 'text-xs text-slate-600', cell: (det) => <>{det.vehicleType}</> },
{ header: 'Estimated Speed', className: 'font-bold text-slate-900', cell: (det) => <>{det.estimatedSpeed} mph</> },
{ header: 'Classification', className: '', cell: (det) => <><Badge classification={det.classification}>
                      {det.classification.toUpperCase()}
                    </Badge></> },
{ header: 'Session', className: 'text-xs text-slate-500 max-w-xs truncate', cell: (det) => <>{det.sessionName}</> }
]} />
      </Card>
    </div>
  );
};

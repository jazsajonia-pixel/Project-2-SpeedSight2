import React, { useState } from 'react';
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
  Radio,
  Clock3,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { DEMO_DETECTIONS } from '../lib/demoData';
import { DashboardRange, getDashboardTrend } from '../lib/dashboardChart';

export const DashboardPage: React.FC = () => {
  const [range, setRange] = useState<DashboardRange>('12h');
  const trend = getDashboardTrend(range);

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
            className="ss-fade-up [animation-delay:120ms]"
            title="Live Monitoring Preview"
            subtitle="Simulated real-time camera feed with object detection overlay"
            action={<StatusIndicator status="active" label="SIMULATED FEED" />}
          >
            <div className="relative aspect-video bg-gradient-to-br from-slate-950 via-[#102a43] to-cyan-950 rounded-xl overflow-hidden flex flex-col justify-between p-4 border border-cyan-900/60 shadow-xl shadow-cyan-950/10">
              {/* Background Road Graphics Placeholder */}
              <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                <div className="w-full h-1/2 border-y-2 border-dashed border-cyan-300 transform -rotate-12"></div>
              </div>

              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_24%),radial-gradient(circle_at_80%_80%,#22d3ee_0,transparent_28%)]" />

              {/* Bounding Box Mock Overlay 1 */}
              <div className="absolute top-[35%] left-[25%] border-2 border-emerald-400 bg-emerald-500/10 rounded-xs p-1 ss-soft-pulse">
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

              <div className="flex justify-between items-center text-xs text-slate-300 bg-slate-950/70 p-2 rounded-lg backdrop-blur-xs z-10 border border-white/10">
                <span className="font-mono flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-cyan-300" /> CAM-01: Main St Intersection</span>
                <span className="font-mono">FPS: 59.8 | RES: 1080p</span>
              </div>

              <div className="text-center py-8 z-10">
                <p className="text-sm font-semibold text-slate-200">
                  Camera Feed Preview Container
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Connect camera or start video stream on the Monitoring page.
                </p>
              </div>

              <div className="flex justify-between items-center z-10">
                <Badge variant="info">Detection Engine Ready</Badge>
                <Link to="/monitoring">
                  <Button size="sm" variant="secondary" icon={<Play className="w-3.5 h-3.5" />}>
                    Open Live Feed
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Traffic Activity Chart Placeholder */}
        <div>
          <Card className="ss-fade-up [animation-delay:220ms]" title="Traffic Volume & Speed Trend" subtitle="Sample hourly vehicle distribution" action={
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1" role="group" aria-label="Traffic trend range">
              {(['6h', '12h', '24h'] as DashboardRange[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={range === option}
                  onClick={() => setRange(option)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-cyan-500 ${range === option ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          }>
            <div className="space-y-4">
              <div className="h-44 bg-gradient-to-b from-cyan-50/60 to-white border border-cyan-100 rounded-lg p-3 flex flex-col justify-between">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Vehicles/hr</span>
                  <span className="font-mono flex items-center gap-1"><Clock3 className="w-3 h-3" /> {range} window</span>
                </div>
                {/* Visual Bar Graph Mock */}
                <div className="flex items-end justify-between h-28 gap-1 pt-2">
                  {trend.map((point, i) => (
                    <div key={point.label} className="flex-1 bg-cyan-200 hover:bg-blue-500 transition rounded-t-xs relative group ss-bar-rise" style={{ height: `${point.value}%`, animationDelay: `${i * 55}ms` }}>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1 py-0.5 rounded-2xs pointer-events-none">
                        {point.value * 2}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                  {trend.filter((_, i) => i === 0 || i === trend.length - 1 || i === Math.floor(trend.length / 2)).map((point) => <span key={point.label}>{point.label}</span>)}
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
        className="ss-fade-up [animation-delay:320ms]"
        title="Recent Vehicle Detections"
        subtitle="Latest estimated speed measurements from active sessions"
        action={
          <Link to="/detections">
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All
            </Button>
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Time</th>
                <th className="py-3 px-4 font-semibold">Vehicle ID</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Estimated Speed</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
                <th className="py-3 px-4 font-semibold">Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_DETECTIONS.map((det) => (
                <tr key={det.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">{det.timestamp}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{det.vehicleId}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">{det.vehicleType}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{det.estimatedSpeed} mph</td>
                  <td className="py-3 px-4">
                    <Badge classification={det.classification}>
                      {det.classification.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                    {det.sessionName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

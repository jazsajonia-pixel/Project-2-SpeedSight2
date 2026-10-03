import React, { useState } from 'react';
import { Video, Play, Square, Pause, Camera, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { DEMO_DETECTIONS, DEMO_CAMERAS } from '../lib/demoData';

export const MonitoringPage: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Monitoring Shell"
        subtitle="Configure video inputs and preview vehicle tracking detection canvas."
        badge={<Badge variant="info">UI Preview Only</Badge>}
        actions={
          <div className="flex items-center gap-2">
            {!isMonitoring ? (
              <Button
                variant="primary"
                size="sm"
                icon={<Play className="w-4 h-4" />}
                onClick={() => {
                  setIsMonitoring(true);
                  setIsPaused(false);
                }}
              >
                Start Monitoring
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Pause className="w-4 h-4" />}
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Square className="w-4 h-4" />}
                  onClick={() => {
                    setIsMonitoring(false);
                    setIsPaused(false);
                  }}
                >
                  Stop
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-950">Phase 2 Frontend Shell Active</p>
          <p className="mt-0.5">
            Actual camera access (`getUserMedia`) and computer vision speed calculations are strictly deferred to Phase 5. No physical webcam or video stream is accessed yet.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Camera Viewport Placeholder */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Viewport Canvas"
            subtitle="Simulated stream workspace"
            action={
              <StatusIndicator
                status={isMonitoring ? (isPaused ? 'warning' : 'active') : 'inactive'}
                label={isMonitoring ? (isPaused ? 'PAUSED' : 'LIVE SIMULATION') : 'STOPPED'}
              />
            }
          >
            <div className="relative min-h-[400px] aspect-video bg-slate-950 rounded-xl overflow-hidden flex flex-col justify-between p-4 border border-slate-800">
              {/* Camera Status Bar Top */}
              <div className="flex justify-between items-center text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span className="font-mono text-white">Cam-01: Main Street Traffic Pole</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                  <span>FPS: {isMonitoring ? '59.9' : '0.0'}</span>
                  <span>RES: 1080p</span>
                </div>
              </div>

              {/* Bounding Box Visual Overlays (Simulated) */}
              {isMonitoring && !isPaused && (
                <>
                  <div className="absolute top-[30%] left-[20%] border-2 border-emerald-400 bg-emerald-500/10 rounded-xs p-1">
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-1 rounded-2xs">
                      Sedan | 29 mph
                    </span>
                  </div>
                  <div className="absolute top-[50%] left-[60%] border-2 border-rose-500 bg-rose-500/20 rounded-xs p-1">
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-1 rounded-2xs">
                      SPEEDING | 46 mph
                    </span>
                  </div>
                </>
              )}

              {/* Viewport Overlay Center Text */}
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-300">
                  {isMonitoring ? 'Simulated Monitoring Session Active' : 'Camera Feed Idle'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {isMonitoring
                    ? 'Displaying placeholder bounding boxes and trajectory data.'
                    : 'Click "Start Monitoring" above to initiate simulated feed controls.'}
                </p>
              </div>

              {/* Viewport Overlay Bottom Telemetry */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="block text-slate-400 text-[10px]">VEHICLE COUNT</span>
                  <span className="font-extrabold text-white text-base">
                    {isMonitoring ? '142' : '0'}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="block text-slate-400 text-[10px]">AVG ESTIMATED SPEED</span>
                  <span className="font-extrabold text-white text-base">
                    {isMonitoring ? '34.2 mph' : '0 mph'}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="block text-slate-400 text-[10px]">SPEEDING EVENTS</span>
                  <span className="font-extrabold text-rose-400 text-base">
                    {isMonitoring ? '18' : '0'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Side Controls & Recent Detections Stream */}
        <div className="space-y-4">
          <Card title="Stream Settings">
            <div className="space-y-3">
              <Select
                label="Camera Source"
                options={DEMO_CAMERAS.map((c) => ({ label: c.name, value: c.id }))}
              />
              <Select
                label="Active Session Target"
                options={[
                  { label: 'Main St & 4th Ave Intersection', value: 'ses-101' },
                  { label: 'Highway 101 Mile 42', value: 'ses-102' },
                ]}
              />
            </div>
          </Card>

          <Card title="Sample Detection Stream" subtitle="Illustrative records only">
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
              {DEMO_DETECTIONS.map((det) => (
                <div
                  key={det.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{det.vehicleId} ({det.vehicleType})</span>
                    <span className="text-slate-500 text-[10px]">{det.timestamp}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block">{det.estimatedSpeed} mph</span>
                    <Badge classification={det.classification}>
                      {det.classification}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

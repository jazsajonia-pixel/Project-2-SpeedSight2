import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Square,
  Pause,
  Camera,
  AlertCircle,
  Upload,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { useMonitoringPipeline } from '../hooks/useMonitoringPipeline';
import { DEMO_DETECTIONS } from '../lib/demoData';
import { api } from '../services/api';
import { DISCLAIMER_MESSAGE } from '../utils/speedMath';

export const MonitoringPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceMode, setSourceMode] = useState<'CAMERA' | 'VIDEO' | 'DEMO'>('CAMERA');
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);

  // Initialize or fetch active monitoring session on page load
  useEffect(() => {
    async function initSession() {
      try {
        const res = await api.getSessions();
        const active = res.data?.find((s: any) => s.status === 'ACTIVE');
        if (active) {
          setActiveSessionId(active.id);
        } else {
          const newSession = await api.createSession({
            name: `Live CV Monitoring ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            description: 'In-browser computer vision detection session',
            status: 'ACTIVE',
          });
          setActiveSessionId(newSession.data.id);
        }
      } catch {
        // Non-fatal if offline/unauthenticated
      }
    }
    initSession();
  }, []);

  const {
    isMonitoring,
    isPaused,
    availableDevices,
    selectedDeviceId,
    videoRef,
    trackedVehicles,
    error,
    modelReady,
    vehicleCount,
    startCameraStream,
    loadVideoFile,
    pauseMonitoring,
    resumeMonitoring,
    stopMonitoring,
    setSelectedDeviceId,
  } = useMonitoringPipeline({ sessionId: activeSessionId });

  const handleStart = async () => {
    if (sourceMode === 'VIDEO') {
      if (!selectedFile) {
        alert('Please select a local video file first.');
        return;
      }
      await loadVideoFile(selectedFile);
    } else if (sourceMode === 'CAMERA') {
      await startCameraStream(selectedDeviceId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Camera & Computer Vision Pipeline"
        subtitle="Real-time browser vehicle detection, tracking, and calibrated speed estimation."
        badge={
          <Badge variant={sourceMode === 'DEMO' ? 'info' : 'normal'}>
            {sourceMode === 'DEMO' ? 'Demo Mode' : 'Browser Computer Vision'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            {!isMonitoring ? (
              <Button
                variant="primary"
                size="sm"
                icon={<Play className="w-4 h-4" />}
                onClick={handleStart}
              >
                Start Monitoring
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Pause className="w-4 h-4" />}
                  onClick={isPaused ? resumeMonitoring : pauseMonitoring}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Square className="w-4 h-4" />}
                  onClick={stopMonitoring}
                >
                  Stop
                </Button>
              </>
            )}
          </div>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-950">Source or Model Initialization Notice</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Disclaimers & Model Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-950">In-Browser Local Computer Vision Processing</p>
          <p className="mt-0.5">{DISCLAIMER_MESSAGE}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Camera Viewport Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Real-Time Detection Viewport"
            subtitle={
              sourceMode === 'DEMO'
                ? 'Displaying simulated baseline overlays'
                : 'Processing browser video feed via TensorFlow.js MobileNet'
            }
            action={
              <StatusIndicator
                status={isMonitoring ? (isPaused ? 'warning' : 'active') : 'inactive'}
                label={
                  isMonitoring
                    ? isPaused
                      ? 'PAUSED'
                      : sourceMode === 'DEMO'
                      ? 'DEMO FEED'
                      : 'LIVE CV ACTIVE'
                    : 'STANDBY'
                }
              />
            }
          >
            <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden flex flex-col justify-between p-4 border border-slate-800">
              {/* Actual HTMLVideoElement */}
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-contain ${
                  sourceMode === 'DEMO' ? 'hidden' : 'block'
                }`}
                playsInline
                muted
              />

              {/* Bounding Box Overlay Canvas Layer */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {sourceMode === 'DEMO' && isMonitoring && !isPaused && (
                  <>
                    <div className="absolute top-[30%] left-[20%] border-2 border-emerald-400 bg-emerald-500/10 rounded-xs p-1">
                      <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-1 rounded-2xs">
                        Sedan | DEMO #8492 | 42 km/h (NORMAL)
                      </span>
                    </div>
                    <div className="absolute top-[50%] left-[60%] border-2 border-rose-500 bg-rose-500/20 rounded-xs p-1">
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-1 rounded-2xs">
                        SUV | DEMO #8489 | 68 km/h (SPEEDING)
                      </span>
                    </div>
                  </>
                )}

                {(sourceMode === 'CAMERA' || sourceMode === 'VIDEO') &&
                  isMonitoring &&
                  !isPaused &&
                  trackedVehicles.map((vehicle) => {
                    const videoEl = videoRef.current;
                    if (!videoEl || !videoEl.videoWidth) return null;

                    // Calculate percentage bounding box relative to container
                    const scaleX = 100 / videoEl.videoWidth;
                    const scaleY = 100 / videoEl.videoHeight;

                    const left = `${vehicle.boundingBox.x * scaleX}%`;
                    const top = `${vehicle.boundingBox.y * scaleY}%`;
                    const width = `${vehicle.boundingBox.width * scaleX}%`;
                    const height = `${vehicle.boundingBox.height * scaleY}%`;

                    const speedText =
                      vehicle.estimatedSpeed > 0
                        ? `${vehicle.estimatedSpeed} ${vehicle.speedUnit}`
                        : vehicle.speedQuality === 'UNAVAILABLE'
                        ? 'Calibration Required'
                        : 'Calculating...';

                    const borderColor =
                      vehicle.classification === 'SPEEDING'
                        ? 'border-rose-500 bg-rose-500/15'
                        : vehicle.classification === 'WARNING'
                        ? 'border-amber-400 bg-amber-500/15'
                        : 'border-blue-400 bg-blue-500/15';

                    const badgeColor =
                      vehicle.classification === 'SPEEDING'
                        ? 'bg-rose-600 text-white'
                        : vehicle.classification === 'WARNING'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-blue-600 text-white';

                    return (
                      <div
                        key={vehicle.trackingId}
                        style={{ left, top, width, height }}
                        className={`absolute border-2 rounded-2xs transition-all duration-75 ${borderColor}`}
                      >
                        <span className={`absolute -top-6 left-0 text-[10px] font-bold px-1.5 py-0.5 rounded-2xs whitespace-nowrap shadow-xs ${badgeColor}`}>
                          {vehicle.vehicleType} | {vehicle.trackingId} | {speedText} ({vehicle.classification})
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Top Viewport Telemetry Bar */}
              <div className="flex justify-between items-center text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 backdrop-blur-xs z-20">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span className="font-mono text-white">
                    {sourceMode === 'CAMERA'
                      ? 'Browser MediaStream Input'
                      : sourceMode === 'VIDEO'
                      ? `File: ${selectedFile?.name || 'Local Video'}`
                      : 'Demo Stream'}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                  <span>MODEL: {modelReady ? 'COCO-SSD Ready' : 'Standby'}</span>
                </div>
              </div>

              {/* Viewport Overlay Center Hint when inactive */}
              {!isMonitoring && (
                <div className="text-center py-16 z-20">
                  <Video className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-300">
                    Camera Feed Standby
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Select a source mode below and click "Start Monitoring" to initiate live vehicle detection.
                  </p>
                </div>
              )}

              {/* Viewport Overlay Bottom Statistics */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs z-20 mt-auto">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="block text-slate-400 text-[10px]">VEHICLES DETECTED (SESSION)</span>
                  <span className="font-extrabold text-white text-base">
                    {isMonitoring ? (sourceMode === 'DEMO' ? '142' : vehicleCount) : '0'}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="block text-slate-400 text-[10px]">CURRENT TRACKED IN FRAME</span>
                  <span className="font-extrabold text-blue-400 text-base">
                    {isMonitoring ? (sourceMode === 'DEMO' ? '2' : trackedVehicles.length) : '0'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Source Control Panel */}
        <div className="space-y-4">
          <Card title="Input Source Selection">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceMode('CAMERA')}
                    className={`px-2 py-2 text-xs font-medium rounded-lg border transition ${
                      sourceMode === 'CAMERA'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceMode('VIDEO')}
                    className={`px-2 py-2 text-xs font-medium rounded-lg border transition ${
                      sourceMode === 'VIDEO'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Video File
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceMode('DEMO')}
                    className={`px-2 py-2 text-xs font-medium rounded-lg border transition ${
                      sourceMode === 'DEMO'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Demo Mode
                  </button>
                </div>
              </div>

              {sourceMode === 'CAMERA' && (
                <Select
                  label="Select Camera Device"
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  options={
                    availableDevices.length > 0
                      ? availableDevices.map((d) => ({ label: d.label || 'Camera Device', value: d.deviceId }))
                      : [{ label: 'Default Camera Device', value: '' }]
                  }
                />
              )}

              {sourceMode === 'VIDEO' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Upload Local Video File
                  </label>
                  <div className="relative flex items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 transition cursor-pointer">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs text-slate-600 block">
                        {selectedFile ? selectedFile.name : 'Choose MP4/WebM video'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Real-time Tracked Vehicles Feed */}
          <Card title="Tracked Vehicle Feed" subtitle="Real-time speed estimation & quality">
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
              {sourceMode === 'DEMO' ? (
                DEMO_DETECTIONS.slice(0, 4).map((det) => (
                  <div
                    key={det.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {det.vehicleId} ({det.vehicleType})
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {det.estimatedSpeed} mph
                      </span>
                    </div>
                    <Badge classification={det.classification}>{det.classification}</Badge>
                  </div>
                ))
              ) : trackedVehicles.length > 0 ? (
                trackedVehicles.map((vehicle) => (
                  <div
                    key={vehicle.trackingId}
                    className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-blue-950 block">
                        {vehicle.trackingId} ({vehicle.vehicleType})
                      </span>
                      <span className="text-slate-600 font-mono text-[11px] block">
                        {vehicle.estimatedSpeed > 0
                          ? `${vehicle.estimatedSpeed} ${vehicle.speedUnit}`
                          : 'Calibration Required'}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Quality: {vehicle.speedQuality}
                      </span>
                    </div>
                    <Badge classification={vehicle.classification.toLowerCase() as any}>
                      {vehicle.classification}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  <Layers className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                  <span>No vehicles currently detected in frame</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

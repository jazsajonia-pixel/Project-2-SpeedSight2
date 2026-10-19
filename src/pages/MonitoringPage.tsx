import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, Download, Gauge, Layers, Maximize2, Minimize2, Pause, Play, ShieldCheck, Square, Upload, Video } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { useMonitoringPipeline } from '../hooks/useMonitoringPipeline';
import { api } from '../services/api';
import { getMonitoringReadiness } from '../services/vision/monitoringReadiness';
import type { TrackedVehicle } from '../services/vision/tracker';

type SourceMode = 'CAMERA' | 'VIDEO';

function downloadTracks(tracks: TrackedVehicle[]) {
  const rows = [['Tracking ID', 'Vehicle type', 'Confidence', 'X', 'Y', 'Width', 'Height'], ...tracks.map((track) => [track.trackingId, track.vehicleType, track.confidence.toFixed(2), track.boundingBox.x.toFixed(1), track.boundingBox.y.toFixed(1), track.boundingBox.width.toFixed(1), track.boundingBox.height.toFixed(1)])];
  const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `speedsight-current-tracks-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export const MonitoringPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceMode, setSourceMode] = useState<SourceMode>('CAMERA');
  const [activeSessionId, setActiveSessionId] = useState<string>();
  const [minConfidence, setMinConfidence] = useState(0.35);
  const [notice, setNotice] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const {
    isMonitoring, isPaused, availableDevices, selectedDeviceId, videoRef, trackedVehicles,
    error, isInitializing, isModelLoading, modelReady, vehicleCount, fps,
    startCameraStream, loadVideoFile, pauseMonitoring, resumeMonitoring,
    stopMonitoring, setSelectedDeviceId, setSessionId,
  } = useMonitoringPipeline({ sessionId: activeSessionId, minConfidence });

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === viewportRef.current);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const readiness = getMonitoringReadiness({ sourceMode, modelReady, modelLoading: isModelLoading, videoSelected: Boolean(selectedFile) });

  const handleStart = async () => {
    setNotice(null);
    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const session = await api.createSession({
          name: `Vehicle analysis ${new Date().toLocaleString()}`,
          description: 'Browser-based camera or local video vehicle detection. Speed is not calibrated.',
          status: 'READY',
        });
        sessionId = session.data.id;
        setActiveSessionId(sessionId);
        setSessionId(sessionId);
      } catch {
        setNotice('The video can still be analyzed locally, but a session could not be saved. Check your sign-in or connection to save detection records.');
      }
    }
    let started = false;
    if (sourceMode === 'VIDEO' && selectedFile) started = await loadVideoFile(selectedFile, sessionId);
    if (sourceMode === 'CAMERA') started = await startCameraStream(selectedDeviceId, sessionId);
    if (!started) {
      setActiveSessionId(undefined);
      setSessionId(undefined);
      return;
    }
    if (sessionId) {
      await api.updateSession(sessionId, { status: 'ACTIVE', startedAt: new Date().toISOString() })
        .catch(() => setNotice('Analysis is running locally, but the saved session status could not be updated.'));
    }
  };

  const handleStop = async () => {
    stopMonitoring();
    if (activeSessionId) {
      await api.updateSession(activeSessionId, { status: 'COMPLETED', endedAt: new Date().toISOString() }).catch(() => undefined);
      setActiveSessionId(undefined);
      setSessionId(undefined);
    }
  };

  const toggleFullscreen = async () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await viewport.requestFullscreen();
    } catch {
      setNotice('Fullscreen mode is unavailable in this browser. Use the video controls at normal size.');
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      setNotice('There is no ready video frame to capture yet. Start or resume the video and try again.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) { setNotice('This browser could not create an image from the current frame.'); return; }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) { setNotice('The current frame could not be saved as an image.'); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `speedsight-frame-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice('Frame saved to your device. It was not uploaded.');
    }, 'image/png');
  };

  const getOverlayStyle = (vehicle: TrackedVehicle): React.CSSProperties => {
    const video = videoRef.current;
    const viewport = viewportRef.current;
    if (!video?.videoWidth || !viewport) return {};
    const rect = viewport.getBoundingClientRect();
    const scale = Math.min(rect.width / video.videoWidth, rect.height / video.videoHeight);
    const renderedWidth = video.videoWidth * scale;
    const renderedHeight = video.videoHeight * scale;
    const offsetX = (rect.width - renderedWidth) / 2;
    const offsetY = (rect.height - renderedHeight) / 2;
    return {
      left: `${(vehicle.boundingBox.x * scale + offsetX) / rect.width * 100}%`,
      top: `${(vehicle.boundingBox.y * scale + offsetY) / rect.height * 100}%`,
      width: `${vehicle.boundingBox.width * scale / rect.width * 100}%`,
      height: `${vehicle.boundingBox.height * scale / rect.height * 100}%`,
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Vehicle monitoring" subtitle="Analyze a browser camera or a video file stored on this device." badge={<Badge variant="neutral">Browser vision</Badge>} actions={(
        <div className="flex flex-wrap items-center gap-2">
          {!isMonitoring ? <Button variant="primary" size="sm" icon={<Play className="h-4 w-4" />} onClick={handleStart} disabled={!readiness.canStart || isInitializing}>{isInitializing ? 'Starting…' : readiness.label}</Button> : <>
            <Button variant="outline" size="sm" icon={<Pause className="h-4 w-4" />} onClick={isPaused ? resumeMonitoring : pauseMonitoring}>{isPaused ? 'Resume' : 'Pause'}</Button>
            <Button variant="danger" size="sm" icon={<Square className="h-4 w-4" />} onClick={handleStop}>Stop session</Button>
          </>}
        </div>
      )} />

      {(error || notice || (!isMonitoring && readiness.reason)) && <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-950'}`} role={error ? 'alert' : 'status'}><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">{error ? 'Monitoring could not start' : 'Notice'}</p><p className="mt-1">{error || notice || readiness.reason}</p></div></div>}

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" /><p><strong>Private by default:</strong> the browser processes video frames locally; video is not uploaded. Saved session records contain detection metadata. Speed is not calibrated and must not be used for enforcement.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card title="Live detection view" subtitle="Bounding boxes appear only when the model detects a supported vehicle." action={<StatusIndicator status={isMonitoring ? (isPaused ? 'warning' : 'active') : 'inactive'} label={isMonitoring ? (isPaused ? 'PAUSED' : 'ANALYZING') : 'STANDBY'} />}>
            <div ref={viewportRef} className={`relative isolate aspect-video overflow-hidden rounded-xl border border-slate-800 bg-slate-950 ${isFullscreen ? 'h-screen w-screen aspect-auto rounded-none' : ''}`}>
              <video ref={videoRef} className="absolute inset-0 h-full w-full object-contain" playsInline muted aria-label="Camera or local video analysis" />
              <div className="pointer-events-none absolute inset-0 z-10">
                {isMonitoring && !isPaused && trackedVehicles.map((vehicle) => <div key={vehicle.trackingId} style={getOverlayStyle(vehicle)} className="absolute rounded-sm border-2 border-cyan-300 bg-cyan-400/10"><span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-cyan-300 px-1.5 py-0.5 text-[10px] font-bold text-slate-950 shadow">{vehicle.vehicleType} · {vehicle.trackingId} · {Math.round(vehicle.confidence * 100)}%</span></div>)}
              </div>
              <div className="absolute left-3 right-3 top-3 z-20 flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-slate-950/80 p-2.5 text-xs text-slate-200 backdrop-blur-sm">
                <span className="flex min-w-0 items-center gap-2 truncate"><Camera className="h-4 w-4 shrink-0 text-cyan-300" />{isMonitoring ? (sourceMode === 'VIDEO' ? selectedFile?.name : 'Browser camera') : 'No source selected'}</span>
                <span className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-slate-300"><span>{isModelLoading ? 'Loading model…' : modelReady ? 'COCO-SSD ready' : 'Model unavailable'}</span>{isMonitoring && <span>{fps} FPS</span>}</span>
              </div>
              <div className="absolute right-3 top-16 z-20 flex gap-2">
                {isMonitoring && <Button variant="secondary" size="sm" icon={<Camera className="h-4 w-4" />} onClick={captureFrame} aria-label="Save current video frame">Save frame</Button>}
                <Button variant="secondary" size="sm" icon={isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />} onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</Button>
              </div>
              {!isMonitoring && <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center"><div><Video className="mx-auto mb-3 h-10 w-10 text-slate-600" /><h3 className="font-semibold text-slate-200">Your video preview will appear here</h3><p className="mt-2 max-w-md text-sm text-slate-400">Choose a camera or select a local video. Start analysis when the model is ready.</p></div></div>}
              {isMonitoring && !isPaused && trackedVehicles.length === 0 && <div className="absolute bottom-16 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/75 px-3 py-1.5 text-xs text-slate-200">No supported vehicles detected in this frame</div>}
              <div className="absolute bottom-3 left-3 right-3 z-20 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg border border-white/10 bg-slate-950/80 p-2"><span className="block text-[10px] uppercase text-slate-400">Tracks in current frame</span><span className="font-bold text-cyan-300">{isMonitoring ? vehicleCount : '—'}</span></div>
                <div className="rounded-lg border border-white/10 bg-slate-950/80 p-2"><span className="block text-[10px] uppercase text-slate-400">Minimum confidence</span><span className="font-bold text-white">{Math.round(minConfidence * 100)}%</span></div>
              </div>
            </div>
          </Card>
          <Card title="Detection confidence" subtitle="Higher values reduce weak detections but can miss smaller or partly hidden vehicles.">
            <label htmlFor="confidence-threshold" className="flex items-center justify-between text-sm font-medium text-slate-800"><span>Minimum confidence</span><span className="font-mono text-blue-700">{Math.round(minConfidence * 100)}%</span></label>
            <input id="confidence-threshold" type="range" min="0.25" max="0.75" step="0.05" value={minConfidence} onChange={(event) => setMinConfidence(Number(event.target.value))} className="mt-3 w-full accent-blue-600" />
            <div className="mt-1 flex justify-between text-xs text-slate-500"><span>More detections</span><span>Fewer, stronger detections</span></div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Choose a video source" subtitle="Video files stay on this device.">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Video source">
                {(['CAMERA', 'VIDEO'] as SourceMode[]).map((mode) => <button key={mode} type="button" disabled={isMonitoring} aria-pressed={sourceMode === mode} onClick={() => setSourceMode(mode)} className={`min-h-11 rounded-lg border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 ${sourceMode === mode ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>{mode === 'CAMERA' ? 'Camera' : 'Video file'}</button>)}
              </div>
              {sourceMode === 'CAMERA' ? <Select label="Camera device" value={selectedDeviceId} onChange={(event) => setSelectedDeviceId(event.target.value)} options={availableDevices.length ? availableDevices.map((device) => ({ label: device.label || `Camera ${device.deviceId.slice(0, 6)}`, value: device.deviceId })) : [{ label: 'Default available camera', value: '' }]} /> : <div><label htmlFor="video-file" className="mb-2 block text-sm font-semibold text-slate-800">Select a local video</label><label htmlFor="video-file" className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-4 text-center hover:border-blue-500"><Upload className="mb-2 h-5 w-5 text-slate-500" /><span className="text-sm text-slate-700">{selectedFile?.name || 'Choose MP4, WebM or Ogg'}</span><span className="mt-1 text-xs text-slate-500">The file is processed in your browser</span></label><input id="video-file" type="file" accept="video/mp4,video/webm,video/ogg" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} className="sr-only" /></div>}
              <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600"><Gauge className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" /><p>The current model labels cars, trucks, buses and motorcycles. It does not calculate speed from calibration.</p></div>
            </div>
          </Card>

          <Card title="Current vehicle tracks" subtitle="Live detections from the selected source." action={trackedVehicles.length > 0 ? <Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => downloadTracks(trackedVehicles)}>Export CSV</Button> : undefined}>
            {trackedVehicles.length === 0 ? <div className="py-6 text-center text-sm text-slate-500"><Layers className="mx-auto mb-2 h-6 w-6 text-slate-300" />{isMonitoring ? 'No vehicles currently detected.' : 'Start analysis to see live tracks.'}</div> : <ul className="max-h-72 space-y-2 overflow-y-auto">{trackedVehicles.map((vehicle) => <li key={vehicle.trackingId} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm"><div><p className="font-semibold text-slate-900">{vehicle.vehicleType}</p><p className="mt-1 text-xs text-slate-500">{vehicle.trackingId} · {Math.round(vehicle.confidence * 100)}% confidence</p></div><Badge variant="info">LIVE</Badge></li>)}</ul>}
          </Card>

          <Card title="Calibration status"><div className="space-y-3"><p className="text-sm leading-6 text-slate-600">Vehicle detection works independently from calibration. Speed estimates are not currently calculated from detected tracks.</p><a href="/calibration" className="inline-flex text-sm font-semibold text-blue-700 underline underline-offset-2">Learn how calibration works</a></div></Card>
        </div>
      </div>
    </div>
  );
};

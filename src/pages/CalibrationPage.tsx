import React, { useState, useRef } from 'react';
import { Sliders, CheckCircle, Info, RotateCcw, AlertTriangle, Video, Camera } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { calibrationService, ActiveCalibrationProfile } from '../services/calibration';
import { calculatePixelDistance, calculateCalibrationScale, Point2D, DistanceUnit, SpeedUnit, DISCLAIMER_MESSAGE } from '../utils/speedMath';
import { useMonitoringPipeline } from '../hooks/useMonitoringPipeline';

export const CalibrationPage: React.FC = () => {
  const { videoRef, startCameraStream, loadVideoFile, isMonitoring } = useMonitoringPipeline();

  const [profile, setProfile] = useState<ActiveCalibrationProfile>(() => {
    return calibrationService.getActiveProfile() || calibrationService.saveProfile({
      id: 'active-two-point',
      name: 'Active Two-Point Calibration',
      method: 'TWO_POINT',
      data: {
        pointA: { x: 200, y: 350 },
        pointB: { x: 800, y: 350 },
        knownDistance: 50,
        distanceUnit: 'FEET',
        pixelDistance: 600,
        scale: 50 / 600,
      },
      speedUnit: 'MPH',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  const [pointA, setPointA] = useState<Point2D>(profile.data.pointA);
  const [pointB, setPointB] = useState<Point2D>(profile.data.pointB);
  const [knownDistance, setKnownDistance] = useState<number>(profile.data.knownDistance);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(profile.data.distanceUnit);
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>(profile.speedUnit);

  const [activePointSelection, setActivePointSelection] = useState<'A' | 'B' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  const pixelDistance = Math.round(calculatePixelDistance(pointA, pointB));
  const scale = calculateCalibrationScale(pixelDistance, knownDistance);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = Math.round(((clientX - rect.left) / rect.width) * 1000);
    const y = Math.round(((clientY - rect.top) / rect.height) * 600);

    if (activePointSelection === 'A') {
      setPointA({ x, y });
      setActivePointSelection('B');
    } else if (activePointSelection === 'B') {
      setPointB({ x, y });
      setActivePointSelection(null);
    } else {
      // Default toggle logic if neither explicitly selected
      setPointA({ x, y });
      setActivePointSelection('B');
    }
  };

  const handleSave = () => {
    setError(null);
    setSaveSuccess(false);

    if (knownDistance <= 0) {
      setError('Known distance must be greater than zero.');
      return;
    }

    if (pixelDistance <= 5) {
      setError('Point A and Point B are too close to provide a valid calibration.');
      return;
    }

    const updatedProfile: ActiveCalibrationProfile = {
      id: 'active-two-point',
      name: `Two-Point Calibration (${knownDistance} ${distanceUnit})`,
      method: 'TWO_POINT',
      data: {
        pointA,
        pointB,
        knownDistance,
        distanceUnit,
        pixelDistance,
        scale,
      },
      speedUnit,
      createdAt: profile.createdAt,
      updatedAt: new Date().toISOString(),
    };

    calibrationService.saveProfile(updatedProfile);
    setProfile(updatedProfile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setPointA({ x: 200, y: 350 });
    setPointB({ x: 800, y: 350 });
    setKnownDistance(50);
    setDistanceUnit('FEET');
    setSpeedUnit('MPH');
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadVideoFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distance & Perspective Calibration"
        subtitle="Define physical road distance markers (A to B) to establish physical scale for speed estimation."
        badge={<Badge variant="info">Active Calibration</Badge>}
      />

      {/* Safety Educational Disclaimer */}
      <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>{DISCLAIMER_MESSAGE}</span>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Calibration profile saved successfully! Monitoring speed estimation updated.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Overlay Preview Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Two-Point Calibration Canvas"
            subtitle="Touch or click anywhere on the canvas to place Marker A and Marker B across known road markers."
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={activePointSelection === 'A' ? 'primary' : 'outline'}
                    onClick={() => setActivePointSelection('A')}
                  >
                    Set Point A
                  </Button>
                  <Button
                    size="sm"
                    variant={activePointSelection === 'B' ? 'primary' : 'outline'}
                    onClick={() => setActivePointSelection('B')}
                  >
                    Set Point B
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
                    Reset
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startCameraStream()}
                    icon={<Camera className="w-3.5 h-3.5" />}
                  >
                    Live Feed
                  </Button>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50">
                      <Video className="w-3.5 h-3.5 mr-1.5" />
                      Video File
                    </span>
                    <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Viewport Canvas */}
              <div
                ref={canvasContainerRef}
                onClick={handleCanvasClick}
                onTouchStart={handleCanvasClick}
                className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden cursor-crosshair select-none border border-slate-800"
              >
                {/* Embedded Video Element for Live/Video preview */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover ${isMonitoring ? 'block' : 'hidden'}`}
                />

                {!isMonitoring && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                    <Sliders className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-xs font-semibold text-slate-400">Static Calibration Overlay Mode</p>
                    <p className="text-[11px] text-slate-600 max-w-xs mt-1">
                      Start live camera or load video file above for real-time video calibration.
                    </p>
                  </div>
                )}

                {/* SVG Line & Markers */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600">
                  {/* Connecting Calibration Line */}
                  <line
                    x1={pointA.x}
                    y1={pointA.y}
                    x2={pointB.x}
                    y2={pointB.y}
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeDasharray="8 4"
                  />

                  {/* Marker A */}
                  <g transform={`translate(${pointA.x}, ${pointA.y})`}>
                    <circle r="16" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2" />
                    <circle r="8" fill="#f59e0b" />
                    <text y="4" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
                      A
                    </text>
                  </g>

                  {/* Marker B */}
                  <g transform={`translate(${pointB.x}, ${pointB.y})`}>
                    <circle r="16" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2" />
                    <circle r="8" fill="#f59e0b" />
                    <text y="4" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
                      B
                    </text>
                  </g>

                  {/* Distance Text Banner */}
                  <g transform={`translate(${(pointA.x + pointB.x) / 2}, ${(pointA.y + pointB.y) / 2 - 15})`}>
                    <rect x="-70" y="-12" width="140" height="24" rx="12" fill="#0f172a" fillOpacity="0.9" stroke="#f59e0b" strokeWidth="1" />
                    <text y="4" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">
                      {knownDistance} {distanceUnit} ({pixelDistance} px)
                    </text>
                  </g>
                </svg>

                {/* Footer status overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-xs text-slate-300 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800">
                  <span>Method: Basic Two-Point Known Distance</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    Scale: {scale.toFixed(5)} {distanceUnit.toLowerCase()}/px
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Calibration Settings Panel */}
        <div className="space-y-4">
          <Card title="Distance Configuration">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Known Physical Distance</label>
                <input
                  type="number"
                  min="1"
                  value={knownDistance}
                  onChange={(e) => setKnownDistance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Distance Unit</label>
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 transition"
                >
                  <option value="FEET">Feet (ft)</option>
                  <option value="METERS">Meters (m)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Speed Display Unit</label>
                <select
                  value={speedUnit}
                  onChange={(e) => setSpeedUnit(e.target.value as SpeedUnit)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 transition"
                >
                  <option value="MPH">Miles Per Hour (MPH)</option>
                  <option value="KMH">Kilometers Per Hour (km/h)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 text-slate-600 font-mono">
                <div>Measured Pixel Distance: <span className="font-bold text-slate-900">{pixelDistance} px</span></div>
                <div>Calculated Scale: <span className="font-bold text-slate-900">{scale.toFixed(6)}</span> {distanceUnit}/px</div>
              </div>

              <Button size="md" onClick={handleSave} className="w-full" icon={<CheckCircle className="w-4 h-4" />}>
                Save Active Calibration
              </Button>
            </div>
          </Card>

          <Card title="Calibration Method Limitations">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Two-Point Scale Accuracy</span>
              </div>
              <p>
                Basic 2-point calibration assumes a perpendicular camera angle to the road. Perspective distortion from high poles or angled cameras affects measurements on distant road lanes.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

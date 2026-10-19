import React from 'react';
import { AlertTriangle, ArrowRight, Camera, CircleHelp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const steps = [
  { number: '1', title: 'Choose a fixed camera view', text: 'Keep the camera still. Use a view where the road surface and the vehicle path are clearly visible.' },
  { number: '2', title: 'Mark two points on the road', text: 'Choose points A and B along the same lane and on the same road plane. Measure the real distance between those points.' },
  { number: '3', title: 'Measure crossing time', text: 'For one vehicle, record the time it takes to travel from A to B. The timer must use timestamps from the same video or camera.' },
  { number: '4', title: 'Calculate and validate', text: 'Speed = distance ÷ time. Repeat with a known test or reference before trusting any result.' },
];

export const CalibrationPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="Understand calibration" subtitle="Calibration connects distances and timestamps in a fixed camera view. It does not make a camera-based estimate automatically accurate." badge={<Badge variant="neutral">Guide · not configured</Badge>} actions={<Link to="/monitoring"><Button size="sm" icon={<Camera className="h-4 w-4" />}>Open monitoring</Button></Link>} />

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card title="How calibration works" subtitle="A practical sequence for understanding the measurement." >
          <ol className="space-y-5">{steps.map((step) => <li key={step.number} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">{step.number}</span><div><h3 className="font-semibold text-slate-900">{step.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{step.text}</p></div></li>)}</ol>
        </Card>
        <Card title="Worked example" subtitle="Illustration only — these are not measured values from your camera.">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-600">If A and B are <strong>15 metres</strong> apart and a vehicle takes <strong>0.75 seconds</strong> to travel between them:</p>
            <p className="mt-3 font-mono text-lg font-bold text-slate-900">15 m ÷ 0.75 s = 20 m/s = 72 km/h</p>
            <p className="mt-2 text-xs text-slate-500">Small distance or timing errors can change the estimated speed considerably.</p>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="What is supported today">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><p><strong>Not connected to speed results yet.</strong> The current vision pipeline detects and tracks vehicles. It does not yet use a saved calibration to calculate their speed.</p></div>
          <p className="mt-4 text-sm leading-6 text-slate-600">The old “default ratio” display was not backed by a saved profile and has been removed. There is no active calibration to apply.</p>
        </Card>
        <Card title="Why camera angle matters">
          <div className="space-y-3 text-sm leading-6 text-slate-600"><p>In a perspective view, the same real-world distance occupies fewer pixels farther from the camera. A single pixels-per-metre ratio is only a rough scale for a small, consistent road region.</p><p>Wide/high-angle views generally need perspective correction using known ground-plane points. That correction is not implemented here.</p></div>
        </Card>
        <Card title="Before using measurements">
          <div className="flex items-start gap-3"><CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" /><p className="text-sm leading-6 text-slate-600">Use a stable camera, measure reference distances carefully, validate timing and compare results against a trusted reference. SpeedSight is for exploratory analytics, not enforcement.</p></div>
          <Link to="/monitoring" className="mt-4 inline-flex"><Button variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>Review live detections</Button></Link>
        </Card>
      </div>
    </div>
  </div>
);

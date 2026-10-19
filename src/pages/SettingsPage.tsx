import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const SettingsPage: React.FC = () => (
  <div className="max-w-4xl space-y-6">
    <PageHeader title="Privacy and system status" subtitle="A clear summary of what the current application does and does not store." badge={<Badge variant="neutral">System information</Badge>} />
    <Card title="Video privacy">
      <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /><div className="space-y-2 text-sm leading-6 text-slate-700"><p>Camera and local video frames are processed in the browser and are not uploaded as video files.</p><p>If you are signed in and session creation succeeds, detection metadata such as vehicle class, confidence and bounding box can be saved to the account.</p></div></div>
    </Card>
    <Card title="Measurement status">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><p className="text-sm leading-6 text-amber-950"><strong>Speed measurement is not calibrated.</strong> The current vision pipeline detects and tracks vehicles, but saved detections do not contain calibrated speed values. Do not use this app for enforcement decisions.</p></div>
    </Card>
    <p className="text-xs text-slate-500">Appearance and measurement-unit preferences are not persisted in this version.</p>
  </div>
);

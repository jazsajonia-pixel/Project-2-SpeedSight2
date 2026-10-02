import React from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DEMO_CAMERAS } from '../lib/demoData';

export const CameraProfilesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Camera Configurations"
        subtitle="Manage camera streams, resolution, and frame rates for speed monitoring."
        badge={<Badge variant="info">Demo Profiles</Badge>}
        actions={
          <Button size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Camera Profile
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_CAMERAS.map((cam) => (
          <Card key={cam.id} title={cam.name} subtitle={cam.location}>
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Camera Type</span>
                <span className="font-semibold text-slate-900">{cam.type}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Resolution</span>
                <span className="font-mono text-slate-900">{cam.resolution}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Frame Rate</span>
                <span className="font-mono text-slate-900">{cam.frameRate} FPS</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Quality Preset</span>
                <span className="font-semibold text-slate-900">{cam.quality}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 font-medium">Status</span>
                <Badge variant={cam.status === 'Online' ? 'normal' : 'neutral'}>
                  {cam.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

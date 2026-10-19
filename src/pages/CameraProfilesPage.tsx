import React from 'react';
import { Camera } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useCamerasQuery } from '../services/queries/useSpeedSightQueries';

export const CameraProfilesPage: React.FC = () => {
  const { data, isLoading, isError } = useCamerasQuery();
  const cameras = data?.data ?? [];
  return (
    <div className="space-y-6">
      <PageHeader title="Camera profiles" subtitle="Camera configurations saved to your account." badge={<Badge variant="neutral">Saved profiles</Badge>} />
      {isLoading ? <Card><p className="py-8 text-center text-sm text-slate-500" role="status">Loading camera profiles…</p></Card> : isError ? <Card><p className="py-8 text-center text-sm text-rose-700" role="alert">Could not load camera profiles. Check your connection and try again.</p></Card> : cameras.length === 0 ? (
        <Card><div className="py-10 text-center"><Camera className="mx-auto mb-3 h-8 w-8 text-slate-300" /><p className="font-medium text-slate-800">No saved camera profiles</p><p className="mt-1 text-sm text-slate-500">Choose a browser camera directly on the Monitoring page. Persistent camera profiles are not configured yet.</p></div></Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cameras.map((camera: any) => <Card key={camera.id} title={camera.name || 'Unnamed camera'} subtitle={camera.location || 'Location not set'}>
            <div className="space-y-3 pt-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-medium">{camera.type || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Resolution</span><span>{camera.resolution || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Frame rate</span><span>{camera.frameRate ? `${camera.frameRate} FPS` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status</span><Badge variant="neutral">{camera.status || 'Saved'}</Badge></div>
            </div>
          </Card>)}
        </div>
      )}
    </div>
  );
};

import { DataTable } from '../components/ui/DataTable';
import React from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DEMO_DETECTIONS } from '../lib/demoData';

export const DetectionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Detection Records"
        subtitle="Historical vehicle speed detection audit logs."
        badge={<Badge variant="info">Demo Log</Badge>}
      />

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Input icon={<Search className="w-4 h-4" />} placeholder="Search Vehicle ID..." />
          <Select
            options={[
              { label: 'All Classifications', value: 'all' },
              { label: 'Normal', value: 'normal' },
              { label: 'Warning', value: 'warning' },
              { label: 'Speeding', value: 'speeding' },
            ]}
          />
          <Select
            options={[
              { label: 'All Sessions', value: 'all' },
              { label: 'Main St & 4th Ave', value: 'ses-101' },
              { label: 'Highway 101', value: 'ses-102' },
            ]}
          />
        </div>

        <DataTable caption="Detections — sample data" rows={DEMO_DETECTIONS} rowKey={(row) => row.id} columns={[
{ header: 'Timestamp', className: 'text-xs font-mono text-slate-500', cell: (det) => <>{det.timestamp}</> },
{ header: 'Vehicle ID', className: 'font-semibold text-slate-900', cell: (det) => <>{det.vehicleId}</> },
{ header: 'Type', className: 'text-xs text-slate-600', cell: (det) => <>{det.vehicleType}</> },
{ header: 'Estimated Speed', className: 'font-bold text-slate-900', cell: (det) => <>{det.estimatedSpeed} mph</> },
{ header: 'Speed Limit', className: 'text-xs text-slate-500', cell: (det) => <>{det.speedLimit} mph</> },
{ header: 'Classification', className: '', cell: (det) => <><Badge classification={det.classification}>
                      {det.classification.toUpperCase()}
                    </Badge></> },
{ header: 'Confidence', className: 'text-xs font-mono text-slate-600', cell: (det) => <>{(det.confidence * 100).toFixed(0)}%</> }
]} />
      </Card>
    </div>
  );
};

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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Vehicle ID</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Estimated Speed</th>
                <th className="py-3 px-4 font-semibold">Speed Limit</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
                <th className="py-3 px-4 font-semibold">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_DETECTIONS.map((det) => (
                <tr key={det.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-500">{det.timestamp}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{det.vehicleId}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">{det.vehicleType}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{det.estimatedSpeed} mph</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">{det.speedLimit} mph</td>
                  <td className="py-3.5 px-4">
                    <Badge classification={det.classification}>
                      {det.classification.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                    {(det.confidence * 100).toFixed(0)}%
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

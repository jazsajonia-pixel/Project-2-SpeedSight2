import React from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DataTable, Column } from '../components/ui/DataTable';
import { useDetectionsQuery } from '../services/queries/useSpeedSightQueries';
import { DEMO_DETECTIONS } from '../lib/demoData';

interface DetectionRow {
  id: string;
  timestamp: string;
  vehicleId: string;
  vehicleType: string;
  estimatedSpeed: string;
  classification: 'normal' | 'warning' | 'speeding';
  confidence: string;
  isRealCv: boolean;
}

export const DetectionsPage: React.FC = () => {
  const { data: realDetectionsRes } = useDetectionsQuery();

  const realRows: DetectionRow[] = (realDetectionsRes?.data || []).map((det: any) => ({
    id: det.id,
    timestamp: new Date(det.detectedAt).toLocaleTimeString(),
    vehicleId: det.trackingId,
    vehicleType: det.vehicleType,
    estimatedSpeed: det.estimatedSpeed ? `${det.estimatedSpeed} mph` : 'N/A (Phase 5 CV)',
    classification: (det.classification?.toLowerCase() || 'normal') as any,
    confidence: det.confidence ? `${(det.confidence * 100).toFixed(0)}%` : 'N/A',
    isRealCv: true,
  }));

  const demoRows: DetectionRow[] = DEMO_DETECTIONS.map((det) => ({
    id: det.id,
    timestamp: det.timestamp,
    vehicleId: det.vehicleId,
    vehicleType: det.vehicleType,
    estimatedSpeed: `${det.estimatedSpeed} mph`,
    classification: det.classification,
    confidence: `${(det.confidence * 100).toFixed(0)}%`,
    isRealCv: false,
  }));

  const allRows = [...realRows, ...demoRows];

  const columns: Column<DetectionRow>[] = [
    {
      header: 'Source',
      cell: (row) => (
        <Badge variant={row.isRealCv ? 'info' : 'neutral'}>
          {row.isRealCv ? 'Real CV' : 'Demo Data'}
        </Badge>
      ),
    },
    { header: 'Timestamp', accessorKey: 'timestamp', className: 'font-mono text-slate-500' },
    { header: 'Vehicle ID', accessorKey: 'vehicleId', className: 'font-semibold text-slate-900' },
    { header: 'Type', accessorKey: 'vehicleType' },
    { header: 'Speed', accessorKey: 'estimatedSpeed' },
    {
      header: 'Classification',
      cell: (row) => <Badge classification={row.classification}>{row.classification.toUpperCase()}</Badge>,
    },
    { header: 'CV Confidence', accessorKey: 'confidence', className: 'font-mono' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detection Records Audit Log"
        subtitle="View both real browser computer-vision tracking logs and demo records."
        badge={<Badge variant="info">All Detection Records</Badge>}
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
              { label: 'All Sources', value: 'all' },
              { label: 'Real Computer Vision Only', value: 'real' },
              { label: 'Demo Data Only', value: 'demo' },
            ]}
          />
        </div>

        <DataTable columns={columns} data={allRows} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DataTable, Column } from '../components/ui/DataTable';
import { useDetectionsQuery } from '../services/queries/useSpeedSightQueries';

interface DetectionRow {
  id: string;
  timestamp: string;
  vehicleId: string;
  vehicleType: string;
  estimatedSpeed: string;
  classification: 'normal' | 'warning' | 'speeding';
  confidence: string;
}

export const DetectionsPage: React.FC = () => {
  const { data, isLoading, isError } = useDetectionsQuery();
  const [search, setSearch] = useState('');
  const [classification, setClassification] = useState('all');
  const rows: DetectionRow[] = (data?.data || []).map((det: any) => ({
    id: det.id,
    timestamp: det.detectedAt ? new Date(det.detectedAt).toLocaleString() : '—',
    vehicleId: det.trackingId || '—',
    vehicleType: det.vehicleType || 'Unknown',
    estimatedSpeed: det.estimatedSpeed > 0 ? `${det.estimatedSpeed} ${det.speedUnit || 'km/h'}` : 'Not calibrated',
    classification: (det.classification?.toLowerCase() || 'normal') as DetectionRow['classification'],
    confidence: typeof det.confidence === 'number' ? `${Math.round(det.confidence * 100)}%` : '—',
  }));
  const visibleRows = useMemo(() => rows.filter((row) => {
    const matchesSearch = `${row.vehicleId} ${row.vehicleType}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (classification === 'all' || row.classification === classification);
  }), [rows, search, classification]);

  const columns: Column<DetectionRow>[] = [
    { header: 'Timestamp', accessorKey: 'timestamp', className: 'text-slate-500' },
    { header: 'Vehicle ID', accessorKey: 'vehicleId', className: 'font-semibold text-slate-900' },
    { header: 'Type', accessorKey: 'vehicleType' },
    { header: 'Speed', accessorKey: 'estimatedSpeed' },
    { header: 'Classification', cell: (row) => <Badge classification={row.classification}>{row.classification}</Badge> },
    { header: 'Confidence', accessorKey: 'confidence', className: 'font-mono' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Vehicle detections" subtitle="Only records saved from actual camera or local-video analysis appear here." badge={<Badge variant="neutral">Saved records</Badge>} />
      <Card>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input icon={<Search className="w-4 h-4" />} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vehicle ID or type" aria-label="Search detections" />
          <Select aria-label="Filter by classification" value={classification} onChange={(event) => setClassification(event.target.value)} options={[{ label: 'All classifications', value: 'all' }, { label: 'Normal', value: 'normal' }, { label: 'Warning', value: 'warning' }, { label: 'Speeding', value: 'speeding' }]} />
        </div>
        {isLoading ? <p className="py-8 text-center text-sm text-slate-500" role="status">Loading saved detections…</p> : isError ? <p className="py-8 text-center text-sm text-rose-700" role="alert">Could not load saved detections. Check your connection and reload.</p> : rows.length === 0 ? <div className="py-10 text-center"><p className="font-medium text-slate-800">No detection records yet</p><p className="mt-1 text-sm text-slate-500">Start a real monitoring session to record detections.</p></div> : visibleRows.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No records match these filters.</p> : <DataTable columns={columns} data={visibleRows} keyExtractor={(row) => row.id} />}
      </Card>
    </div>
  );
};

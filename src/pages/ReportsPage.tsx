import { DataTable } from '../components/ui/DataTable';
import React from 'react';
import { FileText, Download, Plus } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DEMO_REPORTS } from '../lib/demoData';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic Audit Reports"
        subtitle="Exportable summaries of session vehicle count and speed compliance."
        badge={<Badge variant="info">Demo Reports</Badge>}
        actions={
          <Button size="sm" icon={<Plus className="w-4 h-4" />}>
            Generate Report
          </Button>
        }
      />

      <Card>
        <DataTable caption="Reports — sample data" rows={DEMO_REPORTS} rowKey={(row) => row.id} columns={[
{ header: 'Report Title', className: 'font-semibold text-slate-900', cell: (rep) => <><div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{rep.name}</span>
                    </div></> },
{ header: 'Date', className: 'text-xs font-mono text-slate-500', cell: (rep) => <>{rep.date}</> },
{ header: 'Session', className: 'text-xs text-slate-600 max-w-xs truncate', cell: (rep) => <>{rep.sessionName}</> },
{ header: 'Vehicles', className: 'font-bold text-slate-900', cell: (rep) => <>{rep.totalVehicles}</> },
{ header: 'Avg Speed', className: 'text-slate-900', cell: (rep) => <>{rep.avgSpeed} mph</> },
{ header: 'Violations', className: 'font-bold text-rose-600', cell: (rep) => <>{rep.speedingViolations}</> },
{ header: 'Status', className: '', cell: (rep) => <><Badge variant="normal">{rep.status}</Badge></> },
{ header: 'Action', className: 'text-right', cell: () => <><Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                      Export
                    </Button></> }
]} />
      </Card>
    </div>
  );
};

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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Report Title</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Session</th>
                <th className="py-3 px-4 font-semibold">Vehicles</th>
                <th className="py-3 px-4 font-semibold">Avg Speed</th>
                <th className="py-3 px-4 font-semibold">Violations</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_REPORTS.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{rep.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-500">{rep.date}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">{rep.sessionName}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{rep.totalVehicles}</td>
                  <td className="py-3.5 px-4 text-slate-900">{rep.avgSpeed} mph</td>
                  <td className="py-3.5 px-4 font-bold text-rose-600">{rep.speedingViolations}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="normal">{rep.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                      Export
                    </Button>
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

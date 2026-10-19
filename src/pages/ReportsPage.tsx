import React from 'react';
import { Download, FileText } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useReportsQuery } from '../services/queries/useSpeedSightQueries';

function downloadRecord(record: any) {
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${String(record.name || record.id || 'traffic-report').replace(/[^a-z0-9-_]+/gi, '-')}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export const ReportsPage: React.FC = () => {
  const { data, isLoading, isError } = useReportsQuery();
  const reports = data?.data ?? [];
  return (
    <div className="space-y-6">
      <PageHeader title="Traffic reports" subtitle="Saved report records from your account. No sample reports are shown." badge={<Badge variant="neutral">Saved reports</Badge>} />
      <Card>
        {isLoading ? <p className="py-8 text-center text-sm text-slate-500" role="status">Loading saved reports…</p> : isError ? <p className="py-8 text-center text-sm text-rose-700" role="alert">Could not load reports. Check your connection and try again.</p> : reports.length === 0 ? <div className="py-10 text-center"><FileText className="mx-auto mb-3 h-8 w-8 text-slate-300" /><p className="font-medium text-slate-800">No reports saved</p><p className="mt-1 text-sm text-slate-500">There are no generated reports in this account yet.</p></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Report</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Session</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Download</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{reports.map((report: any) => <tr key={report.id}><td className="px-4 py-3 font-medium">{report.name || 'Untitled report'}</td><td className="px-4 py-3 text-slate-500">{report.createdAt ? new Date(report.createdAt).toLocaleString() : report.date || '—'}</td><td className="px-4 py-3">{report.session?.name || report.sessionName || '—'}</td><td className="px-4 py-3"><Badge variant="neutral">{report.status || 'Saved'}</Badge></td><td className="px-4 py-3 text-right"><Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => downloadRecord(report)}>Download JSON</Button></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

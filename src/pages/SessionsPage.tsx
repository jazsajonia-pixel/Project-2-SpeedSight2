import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useSessionsQuery } from '../services/queries/useSpeedSightQueries';

export const SessionsPage: React.FC = () => {
  const { data, isLoading, isError } = useSessionsQuery();
  const [search, setSearch] = useState('');
  const sessions = data?.data ?? [];
  const filtered = useMemo(() => sessions.filter((session: any) => `${session.name || ''} ${session.description || ''}`.toLowerCase().includes(search.toLowerCase())), [sessions, search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Monitoring sessions" subtitle="Session records saved to your account." badge={<Badge variant="neutral">Saved sessions</Badge>} />
      <Card>
        <div className="mb-6 max-w-lg"><Input icon={<Search className="h-4 w-4" />} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sessions by name or description" aria-label="Search sessions" /></div>
        {isLoading ? <p className="py-8 text-center text-sm text-slate-500" role="status">Loading saved sessions…</p> : isError ? <p className="py-8 text-center text-sm text-rose-700" role="alert">Could not load sessions. Check your connection and try again.</p> : sessions.length === 0 ? <div className="py-10 text-center"><p className="font-medium text-slate-800">No sessions saved</p><p className="mt-1 text-sm text-slate-500">Start a camera or local-video analysis to create a session.</p></div> : filtered.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No sessions match your search.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Session</th><th className="px-4 py-3">Started</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Description</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{filtered.map((session: any) => <tr key={session.id}><td className="px-4 py-3 font-medium text-slate-900">{session.name || 'Unnamed session'}</td><td className="px-4 py-3 text-slate-500">{session.createdAt ? new Date(session.createdAt).toLocaleString() : '—'}</td><td className="px-4 py-3"><Badge variant={session.status === 'ACTIVE' ? 'normal' : 'neutral'}>{session.status || 'Unknown'}</Badge></td><td className="px-4 py-3 text-slate-600">{session.description || '—'}</td></tr>)}</tbody>
          </table></div>
        )}
      </Card>
    </div>
  );
};

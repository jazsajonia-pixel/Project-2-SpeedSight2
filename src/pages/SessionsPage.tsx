import { DataTable } from '../components/ui/DataTable';
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DEMO_SESSIONS } from '../lib/demoData';

export const SessionsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const rows = DEMO_SESSIONS.filter((row) => `${row.name} ${row.location}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring Sessions"
        subtitle="Manage and view historical traffic monitoring sessions."
        badge={<Badge variant="info">Demo Sessions</Badge>}
        actions={
          <Button size="sm" icon={<Plus className="w-4 h-4" />}>
            Create Session
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input aria-label="Search demo sessions" value={search} onChange={(event) => setSearch(event.target.value)} icon={<Search className="w-4 h-4" />} placeholder="Search session by name or location..." />
          </div>
        </div>

        <DataTable caption="Sessions — sample data" rows={rows} rowKey={(row) => row.id} columns={[
{ header: 'Session Name', className: 'font-semibold text-slate-900', cell: (ses) => <><div>{ses.name}</div>
                    <span className="text-xs font-normal text-slate-500">{ses.location}</span></> },
{ header: 'Date', className: 'text-xs font-mono text-slate-600', cell: (ses) => <>{ses.date}</> },
{ header: 'Duration', className: 'text-xs font-mono text-slate-600', cell: (ses) => <>{ses.duration}</> },
{ header: 'Vehicles', className: 'font-bold text-slate-900', cell: (ses) => <>{ses.vehicleCount}</> },
{ header: 'Avg Speed', className: 'text-slate-900', cell: (ses) => <>{ses.averageSpeed} mph</> },
{ header: 'Speeding Violations', className: 'font-bold text-rose-600', cell: (ses) => <>{ses.speedingEvents}</> },
{ header: 'Status', className: '', cell: (ses) => <><Badge variant={ses.status === 'Active' ? 'normal' : 'neutral'}>
                      {ses.status}
                    </Badge></> },
{ header: 'Actions', className: 'text-right space-x-2', cell: () => <><Button variant="ghost" size="sm">
                      View
                    </Button></> }
]} />
      </Card>
    </div>
  );
};

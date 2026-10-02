import React from 'react';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DEMO_SESSIONS } from '../lib/demoData';

export const SessionsPage: React.FC = () => {
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
            <Input icon={<Search className="w-4 h-4" />} placeholder="Search session by name or location..." />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Session Name</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">Vehicles</th>
                <th className="py-3 px-4 font-semibold">Avg Speed</th>
                <th className="py-3 px-4 font-semibold">Speeding Violations</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_SESSIONS.map((ses) => (
                <tr key={ses.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div>{ses.name}</div>
                    <span className="text-xs font-normal text-slate-500">{ses.location}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">{ses.date}</td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">{ses.duration}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{ses.vehicleCount}</td>
                  <td className="py-3.5 px-4 text-slate-900">{ses.averageSpeed} mph</td>
                  <td className="py-3.5 px-4 font-bold text-rose-600">{ses.speedingEvents}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={ses.status === 'Active' ? 'normal' : 'neutral'}>
                      {ses.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Button variant="ghost" size="sm">
                      View
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

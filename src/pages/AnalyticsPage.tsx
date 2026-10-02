import React from 'react';
import { BarChart2, TrendingUp, PieChart, Activity } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic Analytics"
        subtitle="Aggregated speed statistics, traffic density, and distribution breakdowns."
        badge={<Badge variant="info">Demo Analytics</Badge>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Average Speed" value="34.8 mph" subtext="Target Limit: 30.0 mph" icon={<Activity className="w-5 h-5" />} />
        <StatCard title="Max Estimated Speed" value="58.2 mph" subtext="Recorded Oct 02, 08:14" icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard title="Speeding Rate" value="9.4%" subtext="171 total violation instances" icon={<BarChart2 className="w-5 h-5" />} />
        <StatCard title="Peak Volume Hour" value="08:00 - 09:00" subtext="284 vehicles recorded" icon={<PieChart className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Speed Distribution (mph Histogram)" subtitle="Vehicle velocity distribution across active monitoring sessions">
          <div className="space-y-3 pt-2">
            {[
              { range: '15 - 25 mph', count: 180, percentage: '15%' },
              { range: '26 - 35 mph (Compliant)', count: 850, percentage: '68%' },
              { range: '36 - 45 mph (Warning)', count: 180, percentage: '12%' },
              { range: '46+ mph (Speeding)', count: 71, percentage: '5%' },
            ].map((item) => (
              <div key={item.range} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>{item.range}</span>
                  <span className="font-mono text-slate-500">{item.count} vehicles ({item.percentage})</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: item.percentage }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Vehicle Type Breakdown" subtitle="Distribution by detected vehicle classification">
          <div className="grid grid-cols-2 gap-4 py-4">
            {[
              { type: 'Passenger Cars', count: '1,120', share: '61.5%' },
              { type: 'SUVs & Crossovers', count: '410', share: '22.5%' },
              { type: 'Light Trucks & Vans', count: '210', share: '11.5%' },
              { type: 'Buses & Heavy Transport', count: '81', share: '4.5%' },
            ].map((v) => (
              <div key={v.type} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-xs text-slate-500 font-semibold uppercase">{v.type}</span>
                <p className="text-xl font-bold text-slate-900">{v.count}</p>
                <span className="text-xs text-blue-600 font-medium">{v.share} of total</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

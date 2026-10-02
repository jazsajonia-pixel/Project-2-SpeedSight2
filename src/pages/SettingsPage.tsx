import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Application Settings"
        subtitle="Preferences, speed unit defaults, privacy controls, and system parameters."
        badge={<Badge variant="info">Demo Settings</Badge>}
      />

      <Card title="Appearance & Preferences">
        <div className="space-y-4">
          <Select
            label="Speed Measurement Unit"
            options={[
              { label: 'Miles per hour (mph)', value: 'mph' },
              { label: 'Kilometers per hour (km/h)', value: 'kmh' },
            ]}
          />
          <Select
            label="Theme Interface"
            options={[
              { label: 'System Default (Light)', value: 'light' },
              { label: 'Dark Mode', value: 'dark' },
            ]}
          />
        </div>
      </Card>

      <Card title="Speed Limits & Thresholds">
        <div className="space-y-4">
          <Input label="Default Speed Limit (mph)" defaultValue="30" type="number" />
          <Input label="Warning Threshold Margin (mph above limit)" defaultValue="5" type="number" />
          <Input label="Speeding Violation Threshold Margin (mph above limit)" defaultValue="10" type="number" />
        </div>
      </Card>

      <Card title="Privacy & Data Management">
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Configure local storage retention options for detection logs and session statistics.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Clear Demo Data Cache
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

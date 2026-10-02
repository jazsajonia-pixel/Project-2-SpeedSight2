import React from 'react';
import { Sliders, CheckCircle, Info } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';

export const CalibrationPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Distance & Perspective Calibration"
        subtitle="Establish physical road distance markers to calculate accurate estimated vehicle speed."
        badge={<Badge variant="info">Calibration Shell</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Overlay Preview Canvas */}
        <div className="lg:col-span-2">
          <Card title="Calibration Canvas Preview" subtitle="Define physical road markers (A & B)">
            <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden flex flex-col justify-between p-4 border border-slate-800">
              {/* Distance Line Indicator */}
              <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                <div className="w-3/4 border-b-2 border-dashed border-amber-400 relative flex items-center justify-between">
                  <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center -top-2 relative">
                    A
                  </div>
                  <div className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold text-xs">
                    50.0 FT (KNOWN DISTANCE)
                  </div>
                  <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center -top-2 relative">
                    B
                  </div>
                </div>
              </div>

              <div className="text-center py-16 z-10">
                <Sliders className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">
                  Interactive Calibration Canvas Placeholder
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Drag markers A and B on camera stream to set pixel-to-distance ratio.
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 z-10">
                <span>Calibration Status: Pre-calibrated (Default Profile)</span>
                <span className="font-mono text-emerald-400">Ratio: 12.4 px/ft</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Calibration Settings */}
        <div className="space-y-4">
          <Card title="Distance Configuration">
            <div className="space-y-4">
              <Input label="Known Distance" defaultValue="50" type="number" />
              <Select
                label="Measurement Unit"
                options={[
                  { label: 'Feet (ft)', value: 'ft' },
                  { label: 'Meters (m)', value: 'm' },
                ]}
              />
              <Button size="sm" className="w-full" icon={<CheckCircle className="w-4 h-4" />}>
                Save Calibration
              </Button>
            </div>
          </Card>

          <Card title="Advanced Perspective Correction">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Info className="w-4 h-4 text-blue-600" />
                <span>4-Point Polygon Warping</span>
              </div>
              <p>
                Perspective transformation compensates for camera angle inclination on high-mounted camera poles.
              </p>
              <Button variant="outline" size="sm" disabled className="w-full mt-2">
                Configure 4-Point Polygon (Phase 5)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

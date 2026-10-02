import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Clock,
  Zap,
  BarChart2,
  FileText,
  Camera,
  Sliders,
  Settings,
  Activity,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Monitoring', path: '/monitoring', icon: Video },
  { label: 'Sessions', path: '/sessions', icon: Clock },
  { label: 'Detections', path: '/detections', icon: Zap },
  { label: 'Analytics', path: '/analytics', icon: BarChart2 },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Camera Profiles', path: '/camera-profiles', icon: Camera },
  { label: 'Calibration', path: '/calibration', icon: Sliders },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col shrink-0 border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-200 gap-2.5">
        <div className="p-1.5 bg-blue-600 rounded-lg text-white">
          <Activity className="w-5 h-5" />
        </div>
        <span className="font-extrabold text-lg text-slate-900 tracking-tight">SpeedSight</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-900">Demo Environment</p>
          <p className="mt-0.5">Frontend Phase 2 UI Shell active. All data shown is sample data.</p>
        </div>
      </div>
    </aside>
  );
};

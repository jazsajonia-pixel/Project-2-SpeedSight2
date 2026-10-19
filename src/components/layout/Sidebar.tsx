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

export const Sidebar: React.FC = () => (
  <aside className="hidden shrink-0 flex-col border-r border-slate-200 bg-white md:flex md:w-64">
    <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-6"><div className="rounded-lg bg-blue-600 p-1.5 text-white"><Activity className="h-5 w-5" /></div><span className="text-lg font-extrabold tracking-tight text-slate-900">SpeedSight</span></div>
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">{NAV_ITEMS.map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="h-4 w-4 shrink-0" /><span>{item.label}</span></NavLink>; })}</nav>
    <div className="border-t border-slate-200 p-4"><div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"><p className="font-semibold text-slate-900">Analysis status</p><p className="mt-0.5">Video runs in your browser. Speed is not calibrated.</p></div></div>
  </aside>
);

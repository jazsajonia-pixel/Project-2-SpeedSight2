import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Activity } from 'lucide-react';
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

export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900">SpeedSight</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <nav id="mobile-navigation" className="border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </header>
  );
};

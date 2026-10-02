import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Badge } from '../ui/Badge';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav />
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Environment
            </span>
            <Badge variant="info">Frontend Shell (Demo Mode)</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Public Landing Page
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

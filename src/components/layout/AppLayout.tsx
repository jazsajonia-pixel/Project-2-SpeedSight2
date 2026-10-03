import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../features/auth/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [logoutError, setLogoutError] = useState('');
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch { setLogoutError('Unable to log out. Please try again.'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav />
        <header className="flex flex-wrap gap-3 min-h-16 py-3 bg-white border-b border-slate-200 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Environment
            </span>
            <Badge variant="info">Authenticated Session</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Public Landing
            </Link>
            {user && (
              <div className="flex flex-wrap items-center gap-3 border-l border-slate-200 pl-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                  <div className="p-1 bg-slate-100 rounded-full">
                    <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <span className="max-w-40 truncate">{user.name || user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  icon={<LogOut className="w-3.5 h-3.5 text-slate-500" />}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </header>
        <div className="px-4 md:px-8 pt-4 text-xs text-slate-600">Sample data preview — values are illustrative, not camera measurements or your saved records.</div>
        {logoutError && <p role="alert" className="px-4 text-red-600">{logoutError}</p>}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

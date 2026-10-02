import React from 'react';
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
            <Badge variant="info">Authenticated Session</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Public Landing
            </Link>
            {user && (
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                  <div className="p-1 bg-slate-100 rounded-full">
                    <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <span>{user.name || user.email}</span>
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
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

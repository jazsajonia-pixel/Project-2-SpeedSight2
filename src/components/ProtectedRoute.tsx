import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Activity } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, isLoading, error, retry } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <Activity className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Authenticating session...</p>
        </div>
      </div>
    );
  }

  // If there's an active user state already, stay on page even if a background refetch fails
  if (!user) {
    if (error) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-100 p-8 text-center" role="alert">
          <div className="space-y-4 max-w-md bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-bold text-white">Session Check Warning</h2>
            <p className="text-sm text-slate-400">Unable to check your authentication session. Please check your network connection and try again.</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition" onClick={retry}>
              Retry Session Check
            </button>
          </div>
        </div>
      );
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

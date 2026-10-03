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

  if (error) {
    return <div className="p-8 text-center" role="alert">
      <p>Unable to check your session. Please try again.</p>
      <button className="mt-4 text-blue-600 underline" onClick={retry}>Retry</button>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

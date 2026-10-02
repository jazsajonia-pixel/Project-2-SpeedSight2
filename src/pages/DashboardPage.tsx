import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto text-center space-y-6">
      <div className="flex justify-center items-center space-x-3">
        <LayoutDashboard className="w-10 h-10 text-emerald-600" />
        <h1 className="text-4xl font-bold tracking-tight">Dashboard Placeholder</h1>
      </div>
      <p className="text-lg text-gray-600">
        Welcome to the SpeedSight Dashboard shell.
      </p>
      <div>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

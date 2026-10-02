import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto text-center space-y-6">
      <div className="flex justify-center items-center space-x-3">
        <Activity className="w-10 h-10 text-blue-600" />
        <h1 className="text-4xl font-bold tracking-tight">SpeedSight</h1>
      </div>
      <p className="text-lg text-gray-600">
        Browser-based vehicle speed monitoring and traffic analytics.
      </p>
      <div>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

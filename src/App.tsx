import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
          <header className="border-b bg-white border-slate-200 py-4 px-8 flex justify-between items-center shadow-xs">
            <span className="font-bold text-xl tracking-tight text-blue-600">
              SpeedSight
            </span>
            <nav className="flex space-x-6 font-medium">
              <Link to="/" className="hover:text-blue-600 transition">
                Home
              </Link>
              <Link to="/dashboard" className="hover:text-blue-600 transition">
                Dashboard
              </Link>
            </nav>
          </header>
          <main className="flex-1 flex items-center justify-center p-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

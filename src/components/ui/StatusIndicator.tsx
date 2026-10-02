import React from 'react';

interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'warning' | 'error';
  label?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => {
  const colors = {
    active: 'bg-emerald-500',
    inactive: 'bg-slate-400',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
  };

  return (
    <div className="inline-flex items-center space-x-2">
      <span className="relative flex h-2.5 w-2.5">
        {status === 'active' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors[status]}`}></span>
      </span>
      {label && <span className="text-xs font-medium text-slate-700">{label}</span>}
    </div>
  );
};

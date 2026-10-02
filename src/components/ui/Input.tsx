import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-slate-400 pointer-events-none">{icon}</span>}
        <input
          className={`w-full bg-white border ${
            error ? 'border-red-500' : 'border-slate-300'
          } text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block ${
            icon ? 'pl-9' : 'pl-3'
          } pr-3 py-2 transition`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

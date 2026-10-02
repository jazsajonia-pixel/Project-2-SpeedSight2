import React from 'react';
import { SpeedClassification } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'normal' | 'warning' | 'speeding' | 'info' | 'neutral';
  classification?: SpeedClassification;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  classification,
  className = '',
}) => {
  const activeVariant = classification || variant || 'neutral';

  const styles = {
    normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    speeding: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[activeVariant]} ${className}`}
    >
      {children}
    </span>
  );
};

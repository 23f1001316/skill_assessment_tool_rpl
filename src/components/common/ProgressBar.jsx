import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  valueText,
  color = 'teal', // 'teal' | 'emerald' | 'amber' | 'blue' | 'rose'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = ''
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const colorClasses = {
    teal: 'bg-teal-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    blue: 'bg-sky-600',
    rose: 'bg-rose-500'
  };

  const trackHeights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5'
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || valueText) && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          {label && <span className="text-slate-700">{label}</span>}
          <span className="text-slate-900 font-bold">{valueText || `${percentage}%`}</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${trackHeights[size]} border border-slate-200/60`}>
        <div
          className={`${colorClasses[color] || colorClasses.teal} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

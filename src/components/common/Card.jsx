import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  footer,
  onClick,
  hoverable = false
}) => {
  const hoverClass = hoverable ? 'hover:border-teal-400 hover:shadow-md transition-all cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 ${hoverClass} ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-100">
          <div>
            {title && <h3 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
};

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'neutral' | 'success' | 'warning' | 'info' | 'cyan' | 'blue' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60',
    neutral: 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800',
    success: 'bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/50',
    warning: 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/50',
    danger: 'bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/50',
    info: 'bg-slate-100 dark:bg-cyan-950/30 text-slate-800 dark:text-cyan-300 border-slate-200 dark:border-cyan-900/40',
    blue: 'bg-slate-100 dark:bg-cyan-950/30 text-slate-800 dark:text-cyan-300 border-slate-200 dark:border-cyan-900/40',
    cyan: 'bg-cyan-50/80 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-900/40',
  }[variant] || 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60';

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[11px] font-mono',
    md: 'px-2 py-0.5 text-xs font-mono',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded border ${variantClasses} ${sizeClasses} ${className}`}>
      {children}
    </span>
  );
};

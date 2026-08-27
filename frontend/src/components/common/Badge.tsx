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
    default: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    neutral: 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
    success: 'bg-slate-100 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-700',
    warning: 'bg-slate-100 dark:bg-slate-800/80 text-amber-600 dark:text-amber-400 border-slate-200 dark:border-slate-700',
    danger: 'bg-slate-100 dark:bg-slate-800/80 text-rose-600 dark:text-rose-400 border-slate-200 dark:border-slate-700',
    info: 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-cyan-400 border-slate-200 dark:border-slate-700',
    blue: 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-cyan-400 border-slate-200 dark:border-slate-700',
    cyan: 'bg-slate-100 dark:bg-slate-800/80 text-cyan-600 dark:text-cyan-400 border-slate-200 dark:border-slate-700',
  }[variant] || 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

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

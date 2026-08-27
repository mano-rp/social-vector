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
    default: 'text-slate-600 dark:text-slate-400',
    neutral: 'text-slate-500 dark:text-slate-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-rose-600 dark:text-rose-400',
    info: 'text-blue-600 dark:text-cyan-400',
    blue: 'text-blue-600 dark:text-cyan-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
  }[variant] || 'text-slate-600 dark:text-slate-400';

  const sizeClasses = {
    sm: 'text-[11px] font-mono font-medium',
    md: 'text-xs font-mono font-medium',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 ${variantClasses} ${sizeClasses} ${className}`}>
      {children}
    </span>
  );
};

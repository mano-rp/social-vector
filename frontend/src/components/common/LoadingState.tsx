import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading observations...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="relative w-6 h-6 mb-3">
        <div className="w-6 h-6 border-2 border-slate-200 dark:border-slate-800 border-t-slate-800 dark:border-t-cyan-400 rounded-full animate-spin" />
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
};

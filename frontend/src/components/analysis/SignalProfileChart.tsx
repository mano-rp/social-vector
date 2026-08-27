import React from 'react';
import { SignalScore } from '../../types/dataset';

interface SignalProfileChartProps {
  signals: SignalScore[];
  onSelectSignal?: (signalId: string) => void;
  selectedSignalId?: string | null;
}

export const SignalProfileChart: React.FC<SignalProfileChartProps> = ({
  signals,
  onSelectSignal,
  selectedSignalId,
}) => {
  const getSignalColor = (score: number) => {
    if (score >= 0.7) return 'bg-rose-500 dark:bg-rose-400';
    if (score >= 0.4) return 'bg-amber-500 dark:bg-amber-400';
    return 'bg-blue-600 dark:bg-cyan-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 0.7) return 'text-rose-600 dark:text-rose-400';
    if (score >= 0.4) return 'text-amber-600 dark:text-amber-400';
    return 'text-blue-600 dark:text-cyan-400';
  };

  return (
    <div className="space-y-2.5">
      {signals.map((sig) => {
        const isSelected = selectedSignalId === sig.signal_id;
        const weightedScore = sig.score * sig.weight;

        return (
          <div
            key={sig.signal_id}
            onClick={() => onSelectSignal?.(sig.signal_id)}
            className={`p-2.5 rounded-lg border transition-all ${
              onSelectSignal ? 'cursor-pointer' : ''
            } ${
              isSelected
                ? 'border-slate-900 dark:border-cyan-400 bg-slate-50 dark:bg-cyan-950/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                  {sig.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  (weight: {(sig.weight * 100).toFixed(0)}%)
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-slate-400">
                  contrib: +{(weightedScore * 100).toFixed(1)}%
                </span>
                <span
                  className={`text-[11px] font-mono font-bold ${getScoreBadge(
                    sig.score
                  )}`}
                >
                  {(sig.score * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getSignalColor(sig.score)}`}
                style={{ width: `${Math.max(3, sig.score * 100)}%` }}
              />
            </div>

            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <p className="line-clamp-1">{sig.summary}</p>
              {sig.evidence_items.length > 0 && (
                <span className="shrink-0 text-[10px] font-mono text-slate-400 pl-2">
                  {sig.evidence_items.length} items
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

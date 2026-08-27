import React, { useState } from 'react';
import { TimelineBin } from '../../types/dataset';
import { Clock } from 'lucide-react';

interface TemporalTimelineChartProps {
  timeline: TimelineBin[];
  burstCount?: number;
  syncRatio?: number;
}

export const TemporalTimelineChart: React.FC<TemporalTimelineChartProps> = ({
  timeline,
  burstCount = 0,
  syncRatio = 0,
}) => {
  const [hoveredBin, setHoveredBin] = useState<TimelineBin | null>(null);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-500">
        No temporal distribution data available for this analysis scope.
      </div>
    );
  }

  const maxPostCount = Math.max(...timeline.map((b) => b.post_count), 1);
  const chartHeight = 160;

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Temporal Activity & Burst Timeline
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <div>
            Bursts: <strong className="text-slate-900 dark:text-slate-100">{burstCount}</strong>
          </div>
          <div>
            Sync Ratio: <strong className="text-slate-900 dark:text-slate-100">{(syncRatio * 100).toFixed(1)}%</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 dark:bg-rose-400" />
            <span>Synchronized Burst</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500 dark:bg-cyan-500" />
            <span>Organic Activity</span>
          </div>
        </div>
      </div>

      {/* SVG Timeline Histogram */}
      <div className="relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c]">
        {/* Tooltip display */}
        <div className="h-6 mb-2 flex items-center justify-between text-xs font-mono">
          {hoveredBin ? (
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {new Date(hoveredBin.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(hoveredBin.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span>Posts: <strong className="text-blue-600 dark:text-cyan-400">{hoveredBin.post_count}</strong></span>
              <span>Accounts: <strong className="text-slate-900 dark:text-slate-100">{hoveredBin.user_count}</strong></span>
              {hoveredBin.is_burst && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[10px] font-bold">
                  BURST SPIKE
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">Hover over timeline bars to inspect time windows</span>
          )}
        </div>

        {/* Bar Chart Area */}
        <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
            <div className="border-b border-slate-400 w-full" />
            <div className="border-b border-slate-400 w-full" />
            <div className="border-b border-slate-400 w-full" />
          </div>

          <div className="relative h-full flex items-end gap-1 sm:gap-1.5">
            {timeline.map((bin) => {
              const heightPct = Math.max(6, (bin.post_count / maxPostCount) * 100);
              const isHovered = hoveredBin?.bin_index === bin.bin_index;

              return (
                <div
                  key={bin.bin_index}
                  onMouseEnter={() => setHoveredBin(bin)}
                  onMouseLeave={() => setHoveredBin(null)}
                  className="flex-1 h-full flex items-end justify-center group cursor-pointer relative"
                >
                  <div
                    className={`w-full rounded-t transition-all duration-200 ${
                      bin.is_burst
                        ? isHovered
                          ? 'bg-rose-600 dark:bg-rose-300'
                          : 'bg-rose-500 dark:bg-rose-400'
                        : isHovered
                        ? 'bg-blue-700 dark:bg-cyan-300'
                        : 'bg-blue-500/80 dark:bg-cyan-500/80'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />

                  {bin.is_burst && (
                    <span className="absolute -top-2 w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>{new Date(timeline[0].start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          <span>{new Date(timeline[Math.floor(timeline.length / 2)].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>{new Date(timeline[timeline.length - 1].end_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

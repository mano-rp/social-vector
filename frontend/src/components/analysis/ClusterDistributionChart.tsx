import React from 'react';
import { CoordinatedCluster } from '../../types/dataset';
import { Badge } from '../common/Badge';
import { ChevronRight, Hash, Globe } from 'lucide-react';

interface ClusterDistributionChartProps {
  clusters: CoordinatedCluster[];
  selectedClusterId: string | null;
  onSelectCluster: (clusterId: string) => void;
}

export const ClusterDistributionChart: React.FC<ClusterDistributionChartProps> = ({
  clusters,
  selectedClusterId,
  onSelectCluster,
}) => {
  if (!clusters || clusters.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-500">
        No multi-account coordination clusters were detected in this analysis run.
      </div>
    );
  }

  const maxAccounts = Math.max(...clusters.map((c) => c.size_users), 1);

  return (
    <div className="space-y-3">
      {clusters.map((cluster, idx) => {
        const isSelected = selectedClusterId === cluster.cluster_id;
        const widthPct = Math.max(8, (cluster.size_users / maxAccounts) * 100);

        return (
          <div
            key={cluster.cluster_id}
            onClick={() => onSelectCluster(cluster.cluster_id)}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              isSelected
                ? 'border-slate-900 dark:border-cyan-400 bg-slate-50 dark:bg-cyan-950/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-[10px] text-slate-700 dark:text-cyan-400">
                  {idx + 1}
                </span>
                <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                  {cluster.cluster_id.toUpperCase()}
                </span>
                <Badge
                  variant={
                    cluster.coordination_score >= 0.75
                      ? 'danger'
                      : cluster.coordination_score >= 0.5
                      ? 'warning'
                      : 'blue'
                  }
                  size="sm"
                >
                  Cohesion: {(cluster.coordination_score * 100).toFixed(0)}%
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>{cluster.size_users} accounts</span>
                <span>{cluster.size_posts} posts</span>
                <span>{cluster.temporal_span?.duration_minutes ?? 0}m span</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90 text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Relative Account Count Bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-blue-600 dark:bg-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${widthPct}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mb-2">
              {cluster.summary}
            </p>

            {/* Signature tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
              {cluster.shared_domains.map((d) => (
                <span
                  key={d}
                  className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/60 text-blue-700 dark:text-cyan-300 flex items-center gap-1"
                >
                  <Globe className="w-2.5 h-2.5" />
                  {d}
                </span>
              ))}

              {cluster.dominant_hashtags.slice(0, 4).map((h) => (
                <span
                  key={h}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1"
                >
                  <Hash className="w-2.5 h-2.5" />
                  {h}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

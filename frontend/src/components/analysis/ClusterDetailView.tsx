import React from 'react';
import { CoordinatedCluster } from '../../types/dataset';
import { Badge } from '../common/Badge';
import { useNavigate } from 'react-router-dom';
import { Users, Globe, Hash, ExternalLink } from 'lucide-react';

interface ClusterDetailViewProps {
  cluster: CoordinatedCluster;
  datasetId: string;
}

export const ClusterDetailView: React.FC<ClusterDetailViewProps> = ({
  cluster,
  datasetId,
}) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-4">
      {/* Cluster Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-400">
            Selected Cluster
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-0.5">
            <span>{cluster.cluster_id.toUpperCase()}</span>
            <Badge variant="danger" size="sm">
              Cohesion: {(cluster.coordination_score * 100).toFixed(1)}%
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div>Accounts: <strong className="text-slate-900 dark:text-slate-100">{cluster.size_users}</strong></div>
          <div>Posts: <strong className="text-slate-900 dark:text-slate-100">{cluster.size_posts}</strong></div>
          <div>Span: <strong className="text-slate-900 dark:text-slate-100">{cluster.temporal_span?.duration_minutes ?? 0} min</strong></div>
        </div>
      </div>

      {/* Rationale & Signatures */}
      <div className="space-y-2 text-xs">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {cluster.summary}
        </p>

        {cluster.signatures && cluster.signatures.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {cluster.signatures.map((sig) => (
              <span
                key={sig}
                className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-[10px] font-mono"
              >
                {sig.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Participating Accounts Grid */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span>Participating Accounts ({cluster.participating_user_ids.length})</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {cluster.participating_user_ids.map((uid) => (
            <button
              key={uid}
              onClick={() => navigate(`/datasets/${datasetId}/users/${uid}`)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors flex items-center justify-between group"
            >
              <span className="font-mono text-xs text-slate-800 dark:text-cyan-400 truncate">
                {uid}
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Domains & Hashtags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="space-y-1.5">
          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Shared Domains ({cluster.shared_domains.length})</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {cluster.shared_domains.length > 0 ? (
              cluster.shared_domains.map((d) => (
                <span
                  key={d}
                  className="px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/60 text-blue-700 dark:text-cyan-300 font-mono text-[11px]"
                >
                  {d}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-[11px]">None identified</span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span>Dominant Hashtags ({cluster.dominant_hashtags.length})</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {cluster.dominant_hashtags.length > 0 ? (
              cluster.dominant_hashtags.map((h) => (
                <span
                  key={h}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
                >
                  #{h}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-[11px]">None identified</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

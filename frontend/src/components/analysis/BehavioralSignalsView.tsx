import React from 'react';
import { BehavioralStats } from '../../types/dataset';
import { Badge } from '../common/Badge';
import { Smartphone, Users, UserX, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BehavioralSignalsViewProps {
  stats: BehavioralStats;
  datasetId: string;
}

export const BehavioralSignalsView: React.FC<BehavioralSignalsViewProps> = ({
  stats,
  datasetId,
}) => {
  const navigate = useNavigate();

  const totalClients = Object.values(stats.client_distribution || {}).reduce((a, b) => a + b, 0);
  const totalAsym = Object.values(stats.asymmetry_distribution || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Batch Creation Score</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {(stats.creation_clustering_score * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Temporal registration clustering concentration
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Client Homogeneity</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {(stats.client_homogeneity_score * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Concentration of identical automation clients
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Mean Follower Asymmetry</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {stats.follower_asymmetry_mean.toFixed(2)}x
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Average following-to-follower ratio
          </p>
        </div>
      </div>

      {/* 2 Detailed Visual Distribution Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Device/Client Distribution */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Device / API Client Concentration</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(stats.client_distribution || {}).map(([client, count]) => {
              const pct = totalClients > 0 ? (count / totalClients) * 100 : 0;

              return (
                <div key={client} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-700 dark:text-slate-300">{client}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {count} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-cyan-400 rounded-full"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Follower Asymmetry Bracket Distribution */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Users className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Follower / Following Ratio Distribution</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(stats.asymmetry_distribution || {}).map(([bracket, count]) => {
              const pct = totalAsym > 0 ? (count / totalAsym) * 100 : 0;
              const isOutlier = bracket.includes('> 5.0') || bracket.includes('Outlier');

              return (
                <div key={bracket} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={`font-mono ${isOutlier ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                      {bracket}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {count} accounts
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isOutlier ? 'bg-rose-500 dark:bg-rose-400' : 'bg-blue-600 dark:bg-cyan-400'}`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Flagged Anomalous Persona Accounts */}
      {stats.anomalous_users && stats.anomalous_users.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <UserX className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Flagged Outlier Personas ({stats.anomalous_users.length})</span>
            </div>
            <Badge variant="danger" size="sm">
              High Ratio Outliers
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {stats.anomalous_users.map((uid) => (
              <button
                key={uid}
                onClick={() => navigate(`/datasets/${datasetId}/users/${uid}`)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors flex items-center justify-between group"
              >
                <span className="font-mono text-xs text-rose-700 dark:text-rose-400 truncate">
                  {uid}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

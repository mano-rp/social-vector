import React, { useState } from 'react';
import { ContentStats } from '../../types/dataset';
import { Badge } from '../common/Badge';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContentReuseViewProps {
  stats: ContentStats;
  datasetId: string;
}

export const ContentReuseView: React.FC<ContentReuseViewProps> = ({
  stats,
  datasetId,
}) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const navigate = useNavigate();

  const groups = stats.duplicate_groups || [];

  return (
    <div className="space-y-4">
      {/* Header Metric */}
      <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-400">Verbatim Reuse Metrics</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-0.5">
            <span className="font-mono text-blue-600 dark:text-cyan-400">
              {(stats.verbatim_reuse_ratio * 100).toFixed(1)}%
            </span>
            <span className="text-xs font-normal text-slate-500">of observed posts contain exact duplicate templates</span>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Template Clusters: <strong className="text-slate-900 dark:text-slate-100">{groups.length}</strong>
        </div>
      </div>

      {/* Duplicate Template Groups List */}
      <div className="space-y-2.5">
        {groups.length > 0 ? (
          groups.map((group) => {
            const isExpanded = expandedGroup === group.group_id;

            return (
              <div
                key={group.group_id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-2 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="font-mono font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {group.group_id.toUpperCase()}
                    </span>
                    <Badge variant="blue" size="sm">
                      {group.repetition_count} exact duplicates
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span>{group.user_count} unique accounts</span>
                    <button
                      onClick={() => setExpandedGroup(isExpanded ? null : group.group_id)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Text Snippet */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
                  "{group.sample_text}"
                </div>

                {/* Expanded Details: Participating Accounts */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Accounts Amplifying This Message:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.participating_users.map((uid) => (
                        <button
                          key={uid}
                          onClick={() => navigate(`/datasets/${datasetId}/users/${uid}`)}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-mono text-slate-700 dark:text-cyan-400 transition-colors"
                        >
                          {uid}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-500">
            No verbatim duplicate message clusters identified in this dataset.
          </div>
        )}
      </div>
    </div>
  );
};

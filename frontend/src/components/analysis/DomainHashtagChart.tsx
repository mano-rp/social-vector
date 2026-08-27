import React, { useState } from 'react';
import { Globe, Hash, Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DomainItem {
  domain: string;
  sharer_count: number;
  user_ids: string[];
}

interface HashtagItem {
  hashtag: string;
  sharer_count: number;
  user_ids: string[];
}

interface DomainHashtagChartProps {
  domains: DomainItem[];
  hashtags: HashtagItem[];
  datasetId: string;
}

export const DomainHashtagChart: React.FC<DomainHashtagChartProps> = ({
  domains,
  hashtags,
  datasetId,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'domain' | 'hashtag'; label: string; user_ids: string[] } | null>(
    domains.length > 0
      ? { type: 'domain', label: domains[0].domain, user_ids: domains[0].user_ids }
      : hashtags.length > 0
      ? { type: 'hashtag', label: hashtags[0].hashtag, user_ids: hashtags[0].user_ids }
      : null
  );

  const navigate = useNavigate();

  const maxDomainCount = Math.max(...domains.map((d) => d.sharer_count), 1);
  const maxHashtagCount = Math.max(...hashtags.map((h) => h.sharer_count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left 2 Cols: Ranked Lists */}
      <div className="lg:col-span-2 space-y-6">
        {/* Top Shared Domains */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Globe className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Top Shared External Domains ({domains.length})</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Ranked by Unique Sharer Accounts</span>
          </div>

          <div className="space-y-2">
            {domains.length > 0 ? (
              domains.slice(0, 7).map((dom) => {
                const widthPct = Math.max(6, (dom.sharer_count / maxDomainCount) * 100);
                const isSelected = selectedEntity?.type === 'domain' && selectedEntity?.label === dom.domain;

                return (
                  <div
                    key={dom.domain}
                    onClick={() => setSelectedEntity({ type: 'domain', label: dom.domain, user_ids: dom.user_ids })}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 dark:border-cyan-400 bg-blue-50/40 dark:bg-cyan-950/20'
                        : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                        {dom.domain}
                      </span>
                      <span className="font-mono text-[11px] text-blue-600 dark:text-cyan-400 font-bold">
                        {dom.sharer_count} accounts
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-cyan-400 rounded-full"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-2">No external campaign domains shared across multiple accounts.</p>
            )}
          </div>
        </div>

        {/* Top Coordinated Hashtags */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Hash className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Top Coordinated Hashtags ({hashtags.length})</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Ranked by Unique Sharer Accounts</span>
          </div>

          <div className="space-y-2">
            {hashtags.length > 0 ? (
              hashtags.slice(0, 7).map((ht) => {
                const widthPct = Math.max(6, (ht.sharer_count / maxHashtagCount) * 100);
                const isSelected = selectedEntity?.type === 'hashtag' && selectedEntity?.label === ht.hashtag;

                return (
                  <div
                    key={ht.hashtag}
                    onClick={() => setSelectedEntity({ type: 'hashtag', label: ht.hashtag, user_ids: ht.user_ids })}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 dark:border-cyan-400 bg-blue-50/40 dark:bg-cyan-950/20'
                        : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                        #{ht.hashtag}
                      </span>
                      <span className="font-mono text-[11px] text-blue-600 dark:text-cyan-400 font-bold">
                        {ht.sharer_count} accounts
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-cyan-400 rounded-full"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-2">No synchronized hashtags found across multiple accounts.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Col: Sharer Accounts Drill-down */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-4">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="text-[10px] font-mono uppercase text-slate-400">Inspecting Entity</div>
          {selectedEntity ? (
            <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
              {selectedEntity.type === 'domain' ? <Globe className="w-4 h-4 text-blue-600 dark:text-cyan-400" /> : <Hash className="w-4 h-4 text-blue-600 dark:text-cyan-400" />}
              <span>{selectedEntity.type === 'hashtag' ? `#${selectedEntity.label}` : selectedEntity.label}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-1">Select a domain or hashtag to view accounts</p>
          )}
        </div>

        {selectedEntity && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Amplifying Accounts ({selectedEntity.user_ids.length})</span>
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {selectedEntity.user_ids.map((uid) => (
                <button
                  key={uid}
                  onClick={() => navigate(`/datasets/${datasetId}/users/${uid}`)}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-left transition-colors flex items-center justify-between group"
                >
                  <span className="font-mono text-xs text-slate-800 dark:text-cyan-400">{uid}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

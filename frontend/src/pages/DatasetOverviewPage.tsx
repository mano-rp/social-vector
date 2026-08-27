import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import {
  Radio,
  Users,
  Activity,
  Hash,
  Globe,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const DatasetOverviewPage: React.FC = () => {
  const { activeDataset, isLoadingActiveDataset, openAnalysis } = useDataset();
  const navigate = useNavigate();
  const { datasetId } = useParams<{ datasetId: string }>();

  if (isLoadingActiveDataset || !activeDataset) {
    return <LoadingState message="Loading dataset overview..." />;
  }

  const meta = activeDataset.metadata;
  const users = activeDataset.users;
  const posts = activeDataset.posts;

  const tagCounts = new Map<string, number>();
  const domainCounts = new Map<string, number>();
  const clientCounts = new Map<string, number>();

  for (const p of posts) {
    for (const t of p.entities.hashtags) {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    }
    for (const u of p.entities.urls) {
      const domain = u.replace(/^https?:\/\//, '').split('/')[0];
      if (domain) domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    }
    if (p.client_source) {
      clientCounts.set(p.client_source, (clientCounts.get(p.client_source) || 0) + 1);
    }
  }

  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const topDomains = Array.from(domainCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" size="sm">
            Schema v{meta.schema_version}
          </Badge>
          <Badge variant="info" size="sm">
            {meta.scenario.replace(/_/g, ' ')}
          </Badge>
          <span className="text-[11px] font-mono text-slate-400">
            Seed: {meta.seed}
          </span>
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {meta.scenario.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            ID: {meta.dataset_id} · Generated: {new Date(meta.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Button
            variant="primary"
            size="sm"
            icon={<Radio className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/datasets/${datasetId}/feed`)}
          >
            Explore Social Feed
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Activity className="w-3.5 h-3.5" />}
            onClick={() => openAnalysis('dataset', meta.dataset_id)}
          >
            Analyse Dataset
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Users className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/datasets/${datasetId}/users`)}
          >
            Browse Users ({users.length})
          </Button>
        </div>
      </div>

      {/* Unified 4-Metric Summary Strip */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
        <div className="sm:px-4 sm:first:pl-0">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500">Observed Users</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {users.length.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Participating personas</p>
        </div>

        <div className="sm:px-4">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500">Total Posts</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {posts.length.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Timeline publications</p>
        </div>

        <div className="sm:px-4">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500">Domains Linked</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {domainCounts.size.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{Array.from(domainCounts.values()).reduce((a, b) => a + b, 0)} total links</p>
        </div>

        <div className="sm:px-4 sm:last:pr-0">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500">Unique Hashtags</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {tagCounts.size.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Discourse campaign tags</p>
        </div>
      </div>

      {/* Content Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>Top Observed Hashtags</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">{topTags.length} tags</span>
          </div>

          {topTags.length > 0 ? (
            <div className="space-y-2">
              {topTags.map(([tag, count]) => {
                const maxTagCount = topTags[0][1] || 1;
                const widthPct = Math.max(8, (count / maxTagCount) * 100);
                return (
                  <div
                    key={tag}
                    onClick={() => navigate(`/datasets/${datasetId}/feed`)}
                    className="py-1 cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-blue-600 dark:text-cyan-400 font-medium group-hover:underline">#{tag}</span>
                      <span className="text-slate-500">{count} posts</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 dark:bg-cyan-400 rounded-full transition-all duration-300" style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center">No hashtags in this dataset.</p>
          )}
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Top External Domains</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">{topDomains.length} domains</span>
          </div>

          {topDomains.length > 0 ? (
            <div className="space-y-2">
              {topDomains.map(([domain, count]) => {
                const maxDomCount = topDomains[0][1] || 1;
                const widthPct = Math.max(8, (count / maxDomCount) * 100);
                return (
                  <div
                    key={domain}
                    className="py-1 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{domain}</span>
                      <span className="text-slate-500 shrink-0">{count} references</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-600 dark:bg-slate-400 rounded-full transition-all duration-300" style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center">No external domains linked in this dataset.</p>
          )}
        </div>
      </div>

      {/* Provenance & Parameters */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          Dataset Provenance & Generation Parameters
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <span className="text-slate-400 block text-[10px]">GENERATOR ENGINE</span>
            <span className="text-slate-700 dark:text-slate-300">
              {meta.generator_name} (v{meta.generator_version})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">CONTENT PROFILE</span>
            <span className="text-slate-700 dark:text-slate-300 capitalize">
              {meta.parameters?.content_profile || 'realistic'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">DETERMINISTIC SEED</span>
            <span className="text-slate-700 dark:text-slate-300">{meta.seed}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

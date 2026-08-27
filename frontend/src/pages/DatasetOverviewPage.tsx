import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import {
  Radio,
  Users,
  MessageSquare,
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
    <div className="space-y-8 max-w-5xl">
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" size="md">
            Schema v{meta.schema_version}
          </Badge>
          <Badge variant="info" size="md">
            Scenario: {meta.scenario.replace(/_/g, ' ')}
          </Badge>
          <Badge variant="neutral" size="md">
            Seed: {meta.seed}
          </Badge>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {meta.scenario.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </h1>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Dataset ID: {meta.dataset_id} · Generated: {new Date(meta.created_at).toLocaleString()}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            icon={<Radio className="w-4 h-4" />}
            onClick={() => navigate(`/datasets/${datasetId}/feed`)}
          >
            Explore Social Feed
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={<Activity className="w-4 h-4" />}
            onClick={() => openAnalysis('dataset', meta.dataset_id)}
          >
            Analyse Dataset
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={<Users className="w-4 h-4" />}
            onClick={() => navigate(`/datasets/${datasetId}/users`)}
          >
            Browse Users ({users.length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-[11px] font-mono uppercase">Observed Users</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {users.length.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[11px] font-mono uppercase">Total Posts</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {posts.length.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
            <Globe className="w-4 h-4" />
            <span className="text-[11px] font-mono uppercase">URLs Linked</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {Array.from(domainCounts.values()).reduce((a, b) => a + b, 0).toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
            <Hash className="w-4 h-4" />
            <span className="text-[11px] font-mono uppercase">Unique Hashtags</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {tagCounts.size.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-lg bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            Top Observed Hashtags
          </h3>
          {topTags.length > 0 ? (
            <div className="space-y-2">
              {topTags.map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between text-xs font-mono">
                  <span
                    onClick={() => navigate(`/datasets/${datasetId}/feed`)}
                    className="text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer font-medium"
                  >
                    #{tag}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">{count} posts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No hashtags in this dataset.</p>
          )}
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            Top Observed Domains & Infrastructure
          </h3>
          {topDomains.length > 0 ? (
            <div className="space-y-2">
              {topDomains.map(([domain, count]) => (
                <div key={domain} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{domain}</span>
                  <span className="text-slate-400 dark:text-slate-500 shrink-0 ml-2">{count} references</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No external domains linked in this dataset.</p>
          )}
        </div>
      </div>

      <div className="p-5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
          Dataset Provenance & Parameters
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">GENERATOR</span>
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
            <span className="text-slate-400 block text-[10px]">RANDOM SEED</span>
            <span className="text-slate-700 dark:text-slate-300">{meta.seed}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

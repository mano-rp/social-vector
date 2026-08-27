import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import {
  Database,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DatasetsPage: React.FC = () => {
  const { datasets, activeDatasetId, selectDataset, openGenerator, isLoadingDatasets } = useDataset();
  const [tab, setTab] = useState<'all' | 'bundled' | 'user_generated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredDatasets = datasets.filter((d) => {
    if (tab === 'bundled' && d.type !== 'bundled') return false;
    if (tab === 'user_generated' && d.type !== 'user_generated') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        d.scenario.toLowerCase().includes(q) ||
        d.datasetId.toLowerCase().includes(q) ||
        d.filename.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenDataset = async (filename: string, id: string) => {
    await selectDataset(filename);
    navigate(`/datasets/${id}/overview`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Observation Datasets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Select an observation environment to explore feeds, inspect user behaviors, and run analytical investigations.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={openGenerator}
        >
          Generate Dataset
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-md text-xs font-medium self-start">
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1 rounded transition-colors ${
              tab === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All ({datasets.length})
          </button>
          <button
            onClick={() => setTab('bundled')}
            className={`px-3 py-1 rounded transition-colors ${
              tab === 'bundled'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Benchmarks
          </button>
          <button
            onClick={() => setTab('user_generated')}
            className={`px-3 py-1 rounded transition-colors ${
              tab === 'user_generated'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Generated
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
          />
        </div>
      </div>

      {isLoadingDatasets ? (
        <LoadingState message="Discovering observation datasets..." />
      ) : filteredDatasets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDatasets.map((d) => {
            const isActive = activeDatasetId === d.id || activeDatasetId === d.filename;
            const formattedDate = new Date(d.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={d.filename}
                onClick={() => handleOpenDataset(d.filename, d.id)}
                className={`p-4 rounded-lg border bg-white dark:bg-[#0f141c] hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between group ${
                  isActive
                    ? 'border-slate-800 dark:border-cyan-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant={d.type === 'bundled' ? 'default' : 'info'} size="sm">
                      {d.type === 'bundled' ? 'Benchmark' : 'Generated'}
                    </Badge>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-cyan-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors mb-0.5">
                    {d.scenario.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </h3>

                  <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mb-3 truncate">
                    {d.filename}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-t border-slate-100 dark:border-slate-800/80 mb-3 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">USERS</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {d.totalUsers.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">POSTS</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {d.totalPosts.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">PROFILE</span>
                      <span className="text-slate-700 dark:text-slate-300 capitalize text-xs">
                        {d.contentProfile}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">SEED</span>
                      <span className="text-slate-700 dark:text-slate-300 text-xs">{d.seed}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </span>

                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-cyan-400 flex items-center gap-1 transition-colors">
                    <span>{isActive ? 'Open Feed' : 'Select'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Database className="w-6 h-6" />}
          title="No datasets found"
          description="No observation datasets match your current filter criteria."
          actionLabel="Generate Dataset"
          onAction={openGenerator}
        />
      )}
    </div>
  );
};

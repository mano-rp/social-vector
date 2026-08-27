import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { Badge } from '../components/common/Badge';
import {
  Cpu,
  ArrowRight,
  Radio,
  FileSearch,
  Play,
  CheckCircle2,
  Database,
  Sliders,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const AnalysisPage: React.FC = () => {
  const { activeDataset, activeDatasetMeta, activeDatasetId, isLoadingActiveDataset, openAnalysis, latestAnalysisResult } = useDataset();
  const navigate = useNavigate();
  const { datasetId } = useParams<{ datasetId: string }>();

  const [threshold, setThreshold] = useState<number>(0.78);
  const [eps, setEps] = useState<number>(0.38);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  if (isLoadingActiveDataset || !activeDataset) {
    return <LoadingState message="Loading analysis lab..." />;
  }

  const dsMeta = activeDatasetMeta || {
    scenario: activeDataset.metadata.scenario,
    totalUsers: activeDataset.users.length,
    totalPosts: activeDataset.posts.length,
    hasGroundTruth: !!activeDataset.ground_truth,
    hasCoordination: activeDataset.ground_truth?.has_coordination ?? false,
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Analysis Lab
          </h1>
        </div>

        {latestAnalysisResult && (
          <Button
            variant="primary"
            size="sm"
            icon={<FileSearch className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/datasets/${datasetId}/investigations`)}
          >
            Open Investigation Workspace
          </Button>
        )}
      </div>

      {/* 1. Target Observation Scope */}
      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>Target Observation Scope</span>
          </div>
          <Badge variant={dsMeta.hasCoordination ? 'danger' : 'neutral'} size="sm">
            {dsMeta.scenario.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">DATASET ID</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
              {activeDataset.metadata.dataset_id}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">TOTAL USERS</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
              {dsMeta.totalUsers.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">TOTAL POSTS</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
              {dsMeta.totalPosts.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">SEED</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
              {activeDataset.metadata.seed}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Analytical Engine Triggers */}
      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
            <Cpu className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>Analytical Engine Triggers</span>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-[11px] font-mono text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <Sliders className="w-3 h-3" />
            <span>{showConfig ? 'Hide Parameters' : 'Tune Parameters'}</span>
          </button>
        </div>

        {/* Optional Parameter Configuration */}
        {showConfig && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                <span>Semantic Cosine Threshold:</span>
                <strong className="text-blue-600 dark:text-cyan-400">{threshold}</strong>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                <span>DBSCAN Epsilon Distance:</span>
                <strong className="text-blue-600 dark:text-cyan-400">{eps}</strong>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.8"
                step="0.01"
                value={eps}
                onChange={(e) => setEps(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                Complete Dataset Analysis
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Full 9-stage pipeline across all {dsMeta.totalPosts} posts
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Play className="w-3.5 h-3.5" />}
              onClick={() => openAnalysis('dataset', datasetId || activeDatasetId || activeDataset.metadata.dataset_id)}
            >
              Run Pipeline
            </Button>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                Feed Scope Analysis
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Targeted evaluation of active chronological feed
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Radio className="w-3.5 h-3.5" />}
              onClick={() => openAnalysis('feed', datasetId || activeDatasetId || activeDataset.metadata.dataset_id)}
            >
              Analyze Feed
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Latest Run Summary */}
      {latestAnalysisResult ? (
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Latest Pipeline Run Summary</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Executed in {latestAnalysisResult.total_duration_ms.toFixed(1)} ms
            </span>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-400">Risk Score</div>
              <div className="text-lg font-bold font-mono text-blue-600 dark:text-cyan-400 mt-0.5">
                {(latestAnalysisResult.overall_coordination_score * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-400">Classification</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                {latestAnalysisResult.confidence_assessment.replace(/_/g, ' ').toUpperCase()}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-400">Clusters Discovered</div>
              <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                {latestAnalysisResult.clusters.length}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-400">Analyzed Accounts</div>
              <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                {latestAnalysisResult.total_users_analyzed}
              </div>
            </div>
          </div>

          {/* Action to Workspace */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Full evidence dossier, signals, bursts, and graph topology ready.</span>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/datasets/${datasetId}/investigations`)}
            >
              Open Campaign Investigation Workspace
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No analysis has been executed for this dataset in the current session.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={<Play className="w-3.5 h-3.5" />}
            onClick={() => openAnalysis('dataset', datasetId || activeDatasetId || activeDataset.metadata.dataset_id)}
          >
            Run Initial Dataset Analysis
          </Button>
        </div>
      )}
    </div>
  );
};

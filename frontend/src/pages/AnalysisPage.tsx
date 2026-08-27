import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { Badge } from '../components/common/Badge';
import {
  Activity,
  Cpu,
  ArrowRight,
  Database,
  Radio,
  FileSearch,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const AnalysisPage: React.FC = () => {
  const { activeDataset, activeDatasetMeta, isLoadingActiveDataset, openAnalysis, latestAnalysisResult } = useDataset();
  const navigate = useNavigate();
  const { datasetId } = useParams<{ datasetId: string }>();

  if (isLoadingActiveDataset || !activeDataset) {
    return <LoadingState message="Loading analysis lab..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Analysis Lab
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Observable analytical investigation interface executing the canonical Python multi-signal coordination pipeline.
          </p>
        </div>

        {latestAnalysisResult && (
          <Button
            variant="outline"
            size="sm"
            icon={<FileSearch className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/datasets/${datasetId}/investigations`)}
          >
            View Active Dossier
          </Button>
        )}
      </div>

      {latestAnalysisResult && (
        <div className="p-4 rounded-xl border border-blue-200 dark:border-cyan-900/60 bg-blue-50/40 dark:bg-cyan-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 dark:bg-cyan-400 text-white dark:text-slate-950 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Active Investigation: {latestAnalysisResult.analysis_id}</span>
                <Badge variant="blue" size="sm">
                  Score: {(latestAnalysisResult.overall_coordination_score * 100).toFixed(1)}%
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                {latestAnalysisResult.clusters.length} clusters identified across {latestAnalysisResult.total_users_analyzed} accounts.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/datasets/${datasetId}/investigations`)}
          >
            Open Dossier
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Entire Dataset Analysis
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Execute full multi-signal pipeline: semantic embeddings, temporal burst synchrony, verbatim repetition, shared infrastructure, and DBSCAN clustering across all {activeDataset.posts.length} posts.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={() => openAnalysis('dataset', activeDataset.metadata.dataset_id)}
          >
            Launch Dataset Analysis
          </Button>
        </div>

        <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Individual Feed Analysis
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Target an individual account feed from the Users Directory or Social Feed to evaluate diurnal consistency, linguistic shifts, and outbound link signatures.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/datasets/${datasetId}/users`)}
          >
            Select User from Directory
          </Button>
        </div>
      </div>

      <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161d28] space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <Cpu className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
          <span>Unified Canonical Engine Architecture</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The web application is an investigation and visualization client communicating directly with the canonical SocialVector Python analytical engine. Any analysis triggered in the browser executes the exact same mathematical algorithms, thresholds, and evidence heuristics available through the <code className="font-mono text-slate-800 dark:text-cyan-400">sv analyze</code> CLI.
        </p>
      </div>
    </div>
  );
};

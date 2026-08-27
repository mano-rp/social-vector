import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import {
  Activity,
  Cpu,
  ArrowRight,
  Database,
  Radio,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const AnalysisPage: React.FC = () => {
  const { activeDataset, isLoadingActiveDataset, openAnalysis } = useDataset();
  const navigate = useNavigate();
  const { datasetId } = useParams<{ datasetId: string }>();

  if (isLoadingActiveDataset || !activeDataset) {
    return <LoadingState message="Loading analysis lab..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-5 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Analysis Lab
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Analytical interface boundary connecting observed social feeds with the future SocialVector analytical engine.
        </p>
      </div>

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
              Evaluate cross-user correlation, temporal burst synchronization, shared domain infrastructure, and multi-actor narrative progression across all {activeDataset.posts.length} posts.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Activity className="w-3.5 h-3.5" />}
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
          <span>Analytical Engine Integration Architecture</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The frontend workflow explicitly decouples observation ingestion from the analytical scoring engine. Real campaign clustering, semantic cosine similarity matrices, risk confidence assessments, and attribution inference will be plugged in as standalone backend pipelines.
        </p>
      </div>
    </div>
  );
};

import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { Badge } from '../components/common/Badge';
import {
  Cpu,
  ArrowRight,
  Radio,
  FileSearch,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const AnalysisPage: React.FC = () => {
  const { activeDataset, isLoadingActiveDataset, openAnalysis, latestAnalysisResult } = useDataset();
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

      {/* Scope Analysis Card */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Cpu className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Dataset Analytical Engine Trigger</span>
          </div>
          <Badge variant="blue" size="sm">
            Observable Pipeline
          </Badge>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Execute multi-signal coordination analysis across dense semantic embeddings (TF-IDF SVD),
          temporal burst detection, SHA-256 verbatim fingerprints, domain reuse, and precomputed DBSCAN clustering.
        </p>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="primary"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={() => openAnalysis('dataset', datasetId || activeDataset.metadata.dataset_id)}
          >
            Run Complete Dataset Analysis
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Radio className="w-3.5 h-3.5" />}
            onClick={() => openAnalysis('feed', datasetId || activeDataset.metadata.dataset_id)}
          >
            Run Target Feed Analysis
          </Button>
        </div>
      </div>

      {/* Latest Analysis Results Section */}
      {latestAnalysisResult && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Latest Analysis Execution Summary</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Completed in {latestAnalysisResult.total_duration_ms.toFixed(1)} ms
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c]">
              <div className="text-[10px] font-mono uppercase text-slate-400">Overall Coordination</div>
              <div className="text-2xl font-bold font-mono text-blue-600 dark:text-cyan-400 mt-1">
                {(latestAnalysisResult.overall_coordination_score * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {latestAnalysisResult.confidence_assessment.replace(/_/g, ' ').toUpperCase()}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c]">
              <div className="text-[10px] font-mono uppercase text-slate-400">Clusters Discovered</div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                {latestAnalysisResult.clusters.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Across {latestAnalysisResult.total_users_analyzed} accounts analyzed
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c]">
              <div className="text-[10px] font-mono uppercase text-slate-400">Observable Stages</div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                {latestAnalysisResult.stages.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                All stages finished successfully
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Detailed Investigation Workspace
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect participating users, verbatim evidence, shared domains, and relational graph topology.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/datasets/${datasetId}/investigations`)}
            >
              Open Workspace
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

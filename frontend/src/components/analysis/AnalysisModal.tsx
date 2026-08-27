import React, { useState, useEffect } from 'react';
import { useDataset } from '../../context/DatasetContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { runAnalysis } from '../../services/api';
import { AnalysisResult } from '../../types/dataset';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Sliders,
} from 'lucide-react';

export const AnalysisModal: React.FC = () => {
  const { analysisTarget, closeAnalysis, activeDatasetId, activeDatasetMeta, setLatestAnalysisResult } = useDataset();
  const navigate = useNavigate();

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (analysisTarget) {
      setAnalysisResult(null);
      setError(null);
      handleRunAnalysis();
    }
  }, [analysisTarget]);

  if (!analysisTarget) return null;

  const isFeed = analysisTarget.scope === 'feed' || analysisTarget.scope === 'user';
  const targetName = isFeed
    ? analysisTarget.user
      ? `@${analysisTarget.user.username} Feed`
      : 'Target Social Feed'
    : activeDatasetMeta?.scenario?.replace(/_/g, ' ') || 'Complete Observation Dataset';

  const handleRunAnalysis = async () => {
    if (!activeDatasetId) return;
    setIsRunning(true);
    setError(null);

    try {
      const response = await runAnalysis({
        dataset_id: activeDatasetId,
        scope: analysisTarget.scope,
        target_id: analysisTarget.targetId,
      });

      if (response.success && response.result) {
        setAnalysisResult(response.result);
        setLatestAnalysisResult(response.result);
      } else {
        throw new Error('Analysis completed with empty results');
      }
    } catch (err: any) {
      console.error('Analysis execution failed:', err);
      setError(err.message || 'Failed to execute analytical pipeline');
    } finally {
      setIsRunning(false);
    }
  };

  const handleOpenInvestigation = () => {
    if (activeDatasetId) {
      closeAnalysis();
      navigate(`/datasets/${activeDatasetId}/investigations`);
    }
  };

  return (
    <Modal
      isOpen={!!analysisTarget}
      onClose={closeAnalysis}
      title={
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>Analytical Investigation Pipeline</span>
        </div>
      }
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {analysisResult && (
              <span>
                Completed in <strong className="font-mono text-slate-700 dark:text-slate-200">{analysisResult.total_duration_ms.toFixed(1)}ms</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={closeAnalysis}>
              Close
            </Button>
            {analysisResult && (
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={handleOpenInvestigation}
              >
                Open in Investigations Workspace
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Scope Header */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Investigation Scope: {analysisTarget.scope.toUpperCase()}
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-0.5">
              <span>{targetName}</span>
              <Badge variant="blue" size="sm">
                Canonical Python Engine
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              disabled={isRunning}
              onClick={handleRunAnalysis}
            >
              {isRunning ? 'Analyzing...' : 'Re-Run Pipeline'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Pipeline Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Pipeline Execution Stages */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Observable Pipeline Stages</span>
            {isRunning && (
              <span className="text-[11px] font-normal text-blue-600 dark:text-cyan-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Executing multi-signal engine...
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {analysisResult?.stages ? (
              analysisResult.stages.map((stage, idx) => (
                <div
                  key={stage.stage_id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] text-xs transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{idx + 1}. {stage.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                      {stage.duration_ms.toFixed(1)} ms
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-5.5">
                    {stage.description}
                  </p>

                  {/* Stage Metrics */}
                  {Object.keys(stage.metrics).length > 0 && (
                    <div className="mt-2 pl-5.5 flex flex-wrap gap-1.5">
                      {Object.entries(stage.metrics).map(([k, v]) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300"
                        >
                          {k.replace(/_/g, ' ')}: <strong className="text-slate-900 dark:text-cyan-400">{typeof v === 'number' ? Number.isInteger(v) ? v : v.toFixed(3) : String(v)}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : isRunning ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Executing Python analytical pipeline across semantic, temporal, and clustering stages...
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Analysis Synthesis & Scores */}
        {analysisResult && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Overall Coordination Score
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-blue-600 dark:text-cyan-400">
                    {(analysisResult.overall_coordination_score * 100).toFixed(1)}%
                  </span>
                  <Badge
                    variant={
                      analysisResult.confidence_assessment.includes('high')
                        ? 'danger'
                        : analysisResult.confidence_assessment.includes('moderate')
                        ? 'warning'
                        : 'success'
                    }
                    size="md"
                  >
                    {analysisResult.confidence_assessment.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="text-right sm:text-right text-xs text-slate-500 dark:text-slate-400">
                <div>Total Users: <strong className="text-slate-700 dark:text-slate-200 font-mono">{analysisResult.total_users_analyzed}</strong></div>
                <div>Total Posts: <strong className="text-slate-700 dark:text-slate-200 font-mono">{analysisResult.total_posts_analyzed}</strong></div>
                <div>Clusters Found: <strong className="text-slate-700 dark:text-slate-200 font-mono">{analysisResult.clusters.length}</strong></div>
              </div>
            </div>

            {/* Assessment Rationale */}
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#0f141c] p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Assessment Rationale: </span>
              {analysisResult.assessment_rationale}
            </div>

            {/* Signals Summary Bars */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                Signal Vector Breakdown
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysisResult.signals.map(sig => (
                  <div
                    key={sig.signal_id}
                    className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f141c] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{sig.name}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-cyan-400">
                        {(sig.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, sig.score * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {sig.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

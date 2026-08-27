import React, { useState, useEffect, useRef } from 'react';
import { useDataset } from '../../context/DatasetContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { runAnalysisStream } from '../../services/api';
import { AnalysisResult, PipelineStageResult } from '../../types/dataset';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

interface StageDisplayState {
  stage_id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration_ms?: number;
  metrics?: Record<string, any>;
  warnings?: string[];
}

const INITIAL_STAGES: StageDisplayState[] = [
  { stage_id: 'ingestion', name: 'Dataset Ingestion & Scoping', description: 'Loads observation dataset and applies user/feed filters', status: 'pending' },
  { stage_id: 'preprocessing', name: 'Entity Tokenization & Normalization', description: 'Extracts URLs, hashtags, mentions, and parses timestamps', status: 'pending' },
  { stage_id: 'semantic_similarity', name: 'Semantic Embedding & Cosine Similarity', description: 'Generates TF-IDF SVD embeddings and cross-account cosine similarity', status: 'pending' },
  { stage_id: 'temporal_analysis', name: 'Temporal Burst & Synchronization Analysis', description: 'Identifies synchronized cross-account posting spikes within sliding windows', status: 'pending' },
  { stage_id: 'content_analysis', name: 'Verbatim Repetition & Domain Sharing', description: 'Detects exact duplicate templates and shared infrastructure domains', status: 'pending' },
  { stage_id: 'behavioral_analysis', name: 'Account Demographics & Behavioral Profiling', description: 'Evaluates registration batching, client concentration, and follower asymmetry', status: 'pending' },
  { stage_id: 'clustering', name: 'Multi-Signal DBSCAN Clustering', description: 'Precomputed multi-dimensional distance matrix clustering', status: 'pending' },
  { stage_id: 'graph_construction', name: 'Interaction & Coordination Graph Construction', description: 'Builds relational NetworkX network topology', status: 'pending' },
  { stage_id: 'signal_fusion', name: 'Signal Fusion & Transparent Assessment', description: 'Synthesizes normalized signals into final coordination risk score', status: 'pending' },
];

export const AnalysisModal: React.FC = () => {
  const {
    analysisTarget,
    closeAnalysis,
    activeDatasetId,
    activeDatasetMeta,
    latestAnalysisResult,
    setLatestAnalysisResult,
  } = useDataset();
  const navigate = useNavigate();

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stages, setStages] = useState<StageDisplayState[]>(INITIAL_STAGES);
  const [localResult, setLocalResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanupStreamRef = useRef<(() => void) | null>(null);

  const isFeed = analysisTarget?.scope === 'feed' || analysisTarget?.scope === 'user';
  const targetName = isFeed
    ? analysisTarget?.user
      ? `@${analysisTarget.user.username} Feed`
      : 'Target Social Feed'
    : activeDatasetMeta?.scenario?.replace(/_/g, ' ') || 'Complete Observation Dataset';

  const startAnalysis = () => {
    if (!analysisTarget) return;
    const datasetIdToUse = activeDatasetId || analysisTarget.targetId;
    if (!datasetIdToUse) return;

    if (cleanupStreamRef.current) {
      cleanupStreamRef.current();
    }

    setIsRunning(true);
    setError(null);
    setLocalResult(null);

    // Initialize stages with first stage running
    const initialStages = INITIAL_STAGES.map((s, idx) => ({
      ...s,
      status: (idx === 0 ? 'running' : 'pending') as 'running' | 'pending',
      duration_ms: undefined,
      metrics: undefined,
    }));
    setStages(initialStages);

    const cleanup = runAnalysisStream(
      {
        dataset_id: datasetIdToUse,
        scope: analysisTarget.scope,
        target_id: analysisTarget.targetId,
      },
      {
        onStage: (incomingStage: PipelineStageResult) => {
          setStages((prevStages) => {
            const currentIdx = prevStages.findIndex((s) => s.stage_id === incomingStage.stage_id);
            return prevStages.map((s, idx) => {
              if (s.stage_id === incomingStage.stage_id) {
                return {
                  ...s,
                  status: 'completed',
                  duration_ms: incomingStage.duration_ms,
                  metrics: incomingStage.metrics,
                  warnings: incomingStage.warnings,
                };
              }
              if (idx === currentIdx + 1 && s.status === 'pending') {
                return { ...s, status: 'running' };
              }
              return s;
            });
          });
        },
        onResult: (res: AnalysisResult) => {
          setLocalResult(res);
          setLatestAnalysisResult(res);
          setIsRunning(false);
          // Mark all stages completed
          setStages((prev) =>
            prev.map((s) => ({
              ...s,
              status: s.status === 'failed' ? 'failed' : 'completed',
            }))
          );
        },
        onError: (errMsg: string) => {
          setError(errMsg);
          setIsRunning(false);
          setStages((prev) =>
            prev.map((s) => (s.status === 'running' ? { ...s, status: 'failed' } : s))
          );
        },
      }
    );

    cleanupStreamRef.current = cleanup;
  };

  useEffect(() => {
    if (analysisTarget) {
      startAnalysis();
    }
    return () => {
      if (cleanupStreamRef.current) {
        cleanupStreamRef.current();
      }
    };
  }, [analysisTarget]);

  if (!analysisTarget) return null;

  const handleOpenInvestigation = () => {
    const datasetIdToUse = activeDatasetId || analysisTarget.targetId;
    if (datasetIdToUse) {
      closeAnalysis();
      navigate(`/datasets/${datasetIdToUse}/investigations`);
    }
  };

  const analysisResult = localResult || latestAnalysisResult;

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
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {analysisResult && (
              <span>
                Completed in <strong className="text-slate-700 dark:text-slate-200">{analysisResult.total_duration_ms.toFixed(1)}ms</strong>
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
      <div className="space-y-4">
        {/* Scope Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">
              Scope: {analysisTarget.scope.toUpperCase()}
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {targetName}
            </div>
          </div>

          <button
            onClick={startAnalysis}
            disabled={isRunning}
            title="Re-run pipeline"
            aria-label="Re-run pipeline"
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50 transition-colors"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Pipeline Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Observable 9-Stage Progress Timeline */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Observable Pipeline Stages</span>
            {isRunning && (
              <span className="text-[11px] font-normal text-blue-600 dark:text-cyan-400 flex items-center gap-1.5 font-mono">
                <Loader2 className="w-3 h-3 animate-spin" /> Executing live Python pipeline...
              </span>
            )}
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {stages.map((stage, idx) => {
              const isCompleted = stage.status === 'completed';
              const isStageRunning = stage.status === 'running';
              const isFailed = stage.status === 'failed';

              return (
                <div
                  key={stage.stage_id}
                  className={`px-3 py-2 rounded-md border transition-all text-xs flex items-center justify-between ${
                    isStageRunning
                      ? 'border-slate-800 dark:border-cyan-400 bg-slate-50 dark:bg-cyan-950/20 shadow-xs'
                      : isCompleted
                      ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c]'
                      : 'border-slate-100 dark:border-slate-900 bg-slate-50/40 dark:bg-slate-900/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : isStageRunning ? (
                      <Loader2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 animate-spin shrink-0" />
                    ) : isFailed ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                    )}
                    <span className={`font-medium truncate ${isStageRunning ? 'text-slate-900 dark:text-cyan-200 font-semibold' : 'text-slate-800 dark:text-slate-200'}`}>
                      {idx + 1}. {stage.name}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 shrink-0 pl-2">
                    {stage.duration_ms !== undefined ? `${stage.duration_ms.toFixed(1)} ms` : isStageRunning ? 'running...' : 'pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Percentage Report Banner */}
        {analysisResult && (
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Coordination Risk Score
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
                <span className={analysisResult.overall_coordination_score >= 0.5 ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-cyan-400'}>
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
                  size="sm"
                >
                  {analysisResult.confidence_assessment.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-500 dark:text-slate-400">
              <div>{analysisResult.total_users_analyzed} accounts · {analysisResult.total_posts_analyzed} posts</div>
              <div>{analysisResult.clusters.length} clusters detected</div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  FileSearch,
  Activity,
  ShieldAlert,
  RotateCcw,
  Download,
  Layers,
  Clock,
  Globe,
  Share2,
  ListChecks,
  BarChart3,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { SignalProfileChart } from '../components/analysis/SignalProfileChart';
import { TemporalTimelineChart } from '../components/analysis/TemporalTimelineChart';
import { ClusterDistributionChart } from '../components/analysis/ClusterDistributionChart';
import { ClusterDetailView } from '../components/analysis/ClusterDetailView';
import { DomainHashtagChart } from '../components/analysis/DomainHashtagChart';
import { ContentReuseView } from '../components/analysis/ContentReuseView';
import { BehavioralSignalsView } from '../components/analysis/BehavioralSignalsView';
import { InteractiveGraphView } from '../components/analysis/InteractiveGraphView';

export const InvestigationsPage: React.FC = () => {
  const { activeDatasetMeta, activeDatasetId, latestAnalysisResult, openAnalysis } = useDataset();
  const navigate = useNavigate();
  const { datasetId } = useParams<{ datasetId: string }>();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'signals' | 'clusters' | 'timeline' | 'infrastructure' | 'network' | 'evidence'
  >('overview');

  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  if (!activeDatasetMeta) {
    return (
      <EmptyState
        icon={<FileSearch className="w-8 h-8 text-slate-400 dark:text-slate-500" />}
        title="No Dataset Selected"
        description="Select an active dataset from the catalog to view structured investigation dossiers and coordination clusters."
        action={
          <Button variant="primary" onClick={() => navigate('/datasets')}>
            Browse Datasets
          </Button>
        }
      />
    );
  }

  if (!latestAnalysisResult) {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Investigation Dossier
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Campaign Investigation Workspace
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Structured intelligence dossiers, multi-signal coordination clusters, and relational graph topology.
          </p>
        </div>

        <EmptyState
          icon={<ShieldAlert className="w-10 h-10 text-blue-600 dark:text-cyan-400" />}
          title="Analysis Required to Generate Investigation Dossier"
          description={`Run the SocialVector multi-signal analytical engine over ${activeDatasetMeta.scenario.replace(/_/g, ' ')} to discover coordinated clusters, verbatim duplicates, and shared infrastructure.`}
          action={
            <Button
              variant="primary"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => openAnalysis('dataset', activeDatasetId || datasetId || '')}
            >
              Run Pipeline Now
            </Button>
          }
        />
      </div>
    );
  }

  const res = latestAnalysisResult;
  const currentDatasetId = activeDatasetId || datasetId || res.dataset_id;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `investigation_dossier_${res.analysis_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const selectedCluster = res.clusters.find((c) => c.cluster_id === selectedClusterId) || res.clusters[0];

  return (
    <div className="space-y-6">
      {/* Dossier Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Investigation Dossier: {res.analysis_id}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
            Campaign Investigation Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Canonical multi-signal intelligence for{' '}
            <strong className="text-slate-900 dark:text-slate-200">
              {activeDatasetMeta.scenario.replace(/_/g, ' ')}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportJson}
          >
            Export Dossier
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => openAnalysis('dataset', currentDatasetId)}
          >
            Re-Run Engine
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('signals')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'signals'
              ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Signals ({res.signals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clusters')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'clusters'
              ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Clusters ({res.clusters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'infrastructure'
              ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Infrastructure</span>
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'network'
              ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Topology ({res.graph?.nodes.length ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'evidence'
              ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5" />
          <span>Evidence ({res.evidence.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Top Score & Assessment Banner */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Coordination Assessment
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5 mt-0.5">
                  <span className="font-mono text-blue-600 dark:text-cyan-400">
                    {(res.overall_coordination_score * 100).toFixed(1)}%
                  </span>
                  <Badge
                    variant={
                      res.confidence_assessment.includes('high')
                        ? 'danger'
                        : res.confidence_assessment.includes('moderate')
                        ? 'warning'
                        : 'success'
                    }
                    size="sm"
                  >
                    {res.confidence_assessment.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                <div className="text-center sm:text-right">
                  <div className="text-[10px] uppercase text-slate-400">Accounts</div>
                  <strong className="text-slate-900 dark:text-slate-100 text-sm">{res.total_users_analyzed}</strong>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-[10px] uppercase text-slate-400">Posts</div>
                  <strong className="text-slate-900 dark:text-slate-100 text-sm">{res.total_posts_analyzed}</strong>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-[10px] uppercase text-slate-400">Clusters</div>
                  <strong className="text-slate-900 dark:text-slate-100 text-sm">{res.clusters.length}</strong>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3 rounded border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-slate-100">Assessment Rationale: </strong>
              {res.assessment_rationale}
            </div>
          </div>

          {/* Side by side: Signal Profile & Key Clusters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <BarChart3 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Signal Profile Vector</span>
                </div>
                <button
                  onClick={() => setActiveTab('signals')}
                  className="text-[11px] font-mono text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  View Details
                </button>
              </div>

              <SignalProfileChart
                signals={res.signals}
                onSelectSignal={() => setActiveTab('signals')}
              />
            </div>

            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Discovered Clusters ({res.clusters.length})</span>
                </div>
                <button
                  onClick={() => setActiveTab('clusters')}
                  className="text-[11px] font-mono text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  Inspect All
                </button>
              </div>

              <ClusterDistributionChart
                clusters={res.clusters.slice(0, 4)}
                selectedClusterId={selectedClusterId}
                onSelectCluster={(cid) => {
                  setSelectedClusterId(cid);
                  setActiveTab('clusters');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Signals */}
      {activeTab === 'signals' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Multi-Signal Convergence Analysis
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Weighted contributions across semantic, temporal, verbatim, domain, hashtag, and behavioral dimensions.
              </p>
            </div>
          </div>

          <SignalProfileChart signals={res.signals} />
        </div>
      )}

      {/* Tab 3: Clusters */}
      {activeTab === 'clusters' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Coordinated Clusters ({res.clusters.length})</span>
              <span className="text-[10px] font-mono text-slate-400">Click a cluster to inspect details</span>
            </div>

            <ClusterDistributionChart
              clusters={res.clusters}
              selectedClusterId={selectedCluster?.cluster_id ?? null}
              onSelectCluster={(cid) => setSelectedClusterId(cid)}
            />
          </div>

          <div>
            {selectedCluster ? (
              <ClusterDetailView cluster={selectedCluster} datasetId={currentDatasetId} />
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                Select a cluster on the left to inspect participating accounts and signatures.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <TemporalTimelineChart
            timeline={res.timeline || []}
            burstCount={res.stages.find((s) => s.stage_id === 'temporal_analysis')?.metrics?.burst_windows_detected}
            syncRatio={res.stages.find((s) => s.stage_id === 'temporal_analysis')?.metrics?.synchronization_ratio}
          />
        </div>
      )}

      {/* Tab 5: Infrastructure & Content */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6">
          {/* Domains & Hashtags */}
          <DomainHashtagChart
            domains={res.content_stats?.top_domains || []}
            hashtags={res.content_stats?.top_hashtags || []}
            datasetId={currentDatasetId}
          />

          {/* Verbatim Content Reuse */}
          <ContentReuseView
            stats={res.content_stats || { top_domains: [], top_hashtags: [], duplicate_groups: [], verbatim_reuse_ratio: 0 }}
            datasetId={currentDatasetId}
          />

          {/* Behavioral Profiling */}
          {res.behavioral_stats && (
            <BehavioralSignalsView stats={res.behavioral_stats} datasetId={currentDatasetId} />
          )}
        </div>
      )}

      {/* Tab 6: Network Topology */}
      {activeTab === 'network' && (
        <div className="space-y-4">
          {res.graph ? (
            <InteractiveGraphView
              graphData={res.graph}
              datasetId={currentDatasetId}
              onSelectCluster={(cid) => {
                setSelectedClusterId(cid);
                setActiveTab('clusters');
              }}
            />
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
              No relational graph topology generated for this run.
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Evidence Items */}
      {activeTab === 'evidence' && (
        <div className="space-y-2.5">
          {res.evidence.length > 0 ? (
            res.evidence.map((ev) => (
              <div
                key={ev.evidence_id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        ev.severity === 'critical' || ev.severity === 'high'
                          ? 'danger'
                          : ev.severity === 'medium'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {ev.severity.toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {ev.title}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase">
                    Category: {ev.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ev.description}
                </p>

                {ev.affiliated_user_ids.length > 0 && (
                  <div className="pt-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                    <span>Affiliated accounts:</span>
                    {ev.affiliated_user_ids.map((uid) => (
                      <button
                        key={uid}
                        onClick={() => navigate(`/datasets/${currentDatasetId}/users/${uid}`)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-cyan-400 transition-colors"
                      >
                        {uid}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-400">
              No evidence items flagged for this observation scope.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

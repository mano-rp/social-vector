import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  FileSearch,
  Activity,
  Layers,
  Share2,
  Calendar,
  ExternalLink,
  ShieldAlert,
  Users,
  MessageSquare,
  Sparkles,
  Download,
  Terminal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const InvestigationsPage: React.FC = () => {
  const { activeDataset, activeDatasetMeta, activeDatasetId, latestAnalysisResult, openAnalysis } = useDataset();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'clusters' | 'evidence' | 'graph' | 'signals'>('clusters');

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
              icon={<Sparkles className="w-4 h-4" />}
              onClick={() => openAnalysis('dataset', activeDatasetMeta.id)}
            >
              Run Investigation Pipeline
            </Button>
          }
        />
      </div>
    );
  }

  const res = latestAnalysisResult;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <span>Investigation ID: {res.analysis_id}</span>
            <span>·</span>
            <span>{res.total_users_analyzed} Users Analyzed</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Investigation Dossier: {activeDatasetMeta.scenario.replace(/_/g, ' ')}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => {
              const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `investigation_${res.analysis_id}.json`;
              a.click();
            }}
          >
            Export Dossier JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={() => openAnalysis('dataset', activeDatasetMeta.id)}
          >
            Re-Run Analysis
          </Button>
        </div>
      </div>

      {/* Synthesis Summary Banner */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Confidence Assessment
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-0.5">
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
                size="md"
              >
                {res.confidence_assessment.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">
            <div>Clusters Formed: <strong className="font-mono text-slate-800 dark:text-slate-200">{res.clusters.length}</strong></div>
            <div>Evidence Items: <strong className="font-mono text-slate-800 dark:text-slate-200">{res.evidence.length}</strong></div>
            <div>Execution Time: <strong className="font-mono text-slate-800 dark:text-slate-200">{res.total_duration_ms.toFixed(1)}ms</strong></div>
          </div>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-slate-100">Assessment Rationale: </strong>
          {res.assessment_rationale}
        </p>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('clusters')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'clusters'
                ? 'bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Coordinated Clusters ({res.clusters.length})
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'evidence'
                ? 'bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Key Evidence ({res.evidence.length})
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'signals'
                ? 'bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Signal Vector Scores ({res.signals.length})
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'graph'
                ? 'bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Graph Topology ({res.graph?.nodes.length ?? 0} nodes)
          </button>
        </div>

        {/* Tab 1: Coordinated Clusters */}
        {activeTab === 'clusters' && (
          <div className="space-y-3">
            {res.clusters.length > 0 ? (
              res.clusters.map((c, idx) => (
                <div
                  key={c.cluster_id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-50 dark:bg-cyan-950 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {c.cluster_id.toUpperCase()}
                      </span>
                      <Badge variant="blue" size="sm">
                        Cohesion: {(c.coordination_score * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {c.size_users} accounts · {c.size_posts} posts · {c.temporal_span.duration_minutes}m span
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {c.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] uppercase">
                        Participating Accounts ({c.size_users}):
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {c.participating_user_ids.map(uid => (
                          <button
                            key={uid}
                            onClick={() => navigate(`/datasets/${activeDatasetId}/users/${uid}`)}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-mono text-slate-700 dark:text-cyan-400 transition-colors"
                          >
                            {uid}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] uppercase">
                        Signatures & Domains:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {c.shared_domains.map(d => (
                          <span
                            key={d}
                            className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/60 text-[10px] font-mono text-blue-700 dark:text-cyan-300"
                          >
                            {d}
                          </span>
                        ))}
                        {c.dominant_hashtags.map(h => (
                          <span
                            key={h}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300"
                          >
                            #{h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={<Activity className="w-8 h-8 text-slate-400" />}
                title="No Coordination Clusters Detected"
                description="The analytical clustering engine did not find statistically significant multi-account coordination groups in this dataset."
              />
            )}
          </div>
        )}

        {/* Tab 2: Evidence Dossier */}
        {activeTab === 'evidence' && (
          <div className="space-y-3">
            {res.evidence.length > 0 ? (
              res.evidence.map(ev => (
                <div
                  key={ev.evidence_id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-2"
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

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {ev.description}
                  </p>

                  {ev.affiliated_user_ids.length > 0 && (
                    <div className="pt-2 text-[10px] font-mono text-slate-500">
                      Affiliated accounts: {ev.affiliated_user_ids.join(', ')}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <EmptyState
                icon={<FileSearch className="w-8 h-8 text-slate-400" />}
                title="No Evidence Items Flagged"
                description="No suspicious indicators crossed analytical significance thresholds."
              />
            )}
          </div>
        )}

        {/* Tab 3: Signals */}
        {activeTab === 'signals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {res.signals.map(sig => (
              <div
                key={sig.signal_id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {sig.name}
                  </span>
                  <span className="font-mono font-bold text-sm text-blue-600 dark:text-cyan-400">
                    {(sig.score * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-cyan-400 rounded-full"
                    style={{ width: `${Math.max(4, sig.score * 100)}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {sig.summary}
                </p>

                {sig.evidence_items.length > 0 && (
                  <ul className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    {sig.evidence_items.map((e, idx) => (
                      <li key={idx}>• {e}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Graph Topology */}
        {activeTab === 'graph' && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-4">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Relational Network Topology</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                {res.graph?.node_count} nodes · {res.graph?.edge_count} edges · density: {res.graph?.density}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-center">
                <div className="text-[10px] font-mono uppercase text-slate-400">Account Nodes</div>
                <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                  {res.graph?.nodes.filter(n => n.type === 'user').length || 0}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-center">
                <div className="text-[10px] font-mono uppercase text-slate-400">Domain Infrastructure</div>
                <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                  {res.graph?.nodes.filter(n => n.type === 'domain').length || 0}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-center">
                <div className="text-[10px] font-mono uppercase text-slate-400">Coordinated Clusters</div>
                <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                  {res.graph?.nodes.filter(n => n.type === 'cluster').length || 0}
                </div>
              </div>
            </div>

            {/* Edge list preview */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <div className="text-[10px] font-mono uppercase text-slate-400">Key Co-ordination & Semantic Edges:</div>
              {res.graph?.edges.slice(0, 15).map((e, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-[11px] flex items-center justify-between"
                >
                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate">
                    {e.source} &harr; {e.target}
                  </span>
                  <Badge variant="blue" size="sm">
                    {e.relationship} ({e.weight.toFixed(2)})
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

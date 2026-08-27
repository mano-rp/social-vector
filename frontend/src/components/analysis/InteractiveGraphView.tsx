import React, { useState, useMemo } from 'react';
import { GraphData, GraphNode } from '../../types/dataset';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Search, ZoomIn, ZoomOut, RotateCcw, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InteractiveGraphViewProps {
  graphData: GraphData;
  datasetId: string;
  onSelectCluster?: (clusterId: string) => void;
}

export const InteractiveGraphView: React.FC<InteractiveGraphViewProps> = ({
  graphData,
  datasetId,
  onSelectCluster,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'user' | 'domain' | 'cluster'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const navigate = useNavigate();

  const rawNodes = graphData?.nodes || [];
  const rawEdges = graphData?.edges || [];

  // Filter nodes
  const filteredNodes = useMemo(() => {
    return rawNodes.filter((node) => {
      if (filterType !== 'all' && node.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return node.id.toLowerCase().includes(q) || node.label.toLowerCase().includes(q);
      }
      return true;
    });
  }, [rawNodes, filterType, searchQuery]);

  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  // Filter edges connected to visible nodes
  const filteredEdges = useMemo(() => {
    return rawEdges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  }, [rawEdges, visibleNodeIds]);

  // Layout node coordinates deterministically in a radial force circle
  const layoutPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const width = 680;
    const height = 480;
    const centerX = width / 2;
    const centerY = height / 2;

    const clusters = filteredNodes.filter((n) => n.type === 'cluster');
    const domains = filteredNodes.filter((n) => n.type === 'domain');
    const users = filteredNodes.filter((n) => n.type === 'user');

    // Place clusters in inner circle
    clusters.forEach((c, idx) => {
      const angle = (idx / Math.max(1, clusters.length)) * 2 * Math.PI;
      const radius = 90;
      positions[c.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    // Place domains in middle circle
    domains.forEach((d, idx) => {
      const angle = (idx / Math.max(1, domains.length)) * 2 * Math.PI + 0.3;
      const radius = 160;
      positions[d.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    // Place users in outer perimeter
    users.forEach((u, idx) => {
      const angle = (idx / Math.max(1, users.length)) * 2 * Math.PI;
      const radius = 220 + (idx % 3) * 15;
      positions[u.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    return positions;
  }, [filteredNodes]);

  // Find connections for selected or hovered node
  const activeNodeId = selectedNode?.id || hoveredNodeId;
  const connectedNodeIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const ids = new Set<string>([activeNodeId]);
    filteredEdges.forEach((e) => {
      if (e.source === activeNodeId) ids.add(e.target);
      if (e.target === activeNodeId) ids.add(e.source);
    });
    return ids;
  }, [activeNodeId, filteredEdges]);

  const getNodeColor = (type: string, isDimmed: boolean) => {
    if (isDimmed) return 'fill-slate-300 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-700';
    if (type === 'cluster') return 'fill-purple-500 stroke-purple-600 dark:fill-purple-400 dark:stroke-purple-300';
    if (type === 'domain') return 'fill-amber-500 stroke-amber-600 dark:fill-amber-400 dark:stroke-amber-300';
    return 'fill-blue-600 stroke-blue-700 dark:fill-cyan-400 dark:stroke-cyan-300';
  };

  const getEdgeColor = (rel: string, isHighlighted: boolean) => {
    if (isHighlighted) return 'stroke-blue-600 dark:stroke-cyan-400 stroke-2';
    if (rel === 'shared_domain') return 'stroke-amber-400/40 dark:stroke-amber-500/30';
    if (rel === 'temporal_burst') return 'stroke-rose-400/40 dark:stroke-rose-500/30';
    return 'stroke-slate-300 dark:stroke-slate-700/60';
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Node type filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">Filter:</span>
          {(['all', 'user', 'domain', 'cluster'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterType === type
                  ? 'bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {type === 'all' ? 'All Entities' : type === 'user' ? 'Accounts' : type === 'domain' ? 'Domains' : 'Clusters'}
            </button>
          ))}
        </div>

        {/* Search & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search node ID or label..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 w-44 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden bg-slate-50 dark:bg-slate-900">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2, z + 0.15))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setZoomLevel(1); setSearchQuery(''); setSelectedNode(null); }}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspector Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Graph Viewport */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f17] relative overflow-hidden flex items-center justify-center min-h-[460px]">
          {/* Legend */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-3 p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/80 dark:border-slate-800 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400" />
              <span>Accounts ({filteredNodes.filter((n) => n.type === 'user').length})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400" />
              <span>Domains ({filteredNodes.filter((n) => n.type === 'domain').length})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 dark:bg-purple-400" />
              <span>Clusters ({filteredNodes.filter((n) => n.type === 'cluster').length})</span>
            </div>
          </div>

          <svg
            viewBox="0 0 680 480"
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}
          >
            {/* Edges */}
            <g className="edges">
              {filteredEdges.map((edge, idx) => {
                const src = layoutPositions[edge.source];
                const tgt = layoutPositions[edge.target];
                if (!src || !tgt) return null;

                const isConnected =
                  activeNodeId && (edge.source === activeNodeId || edge.target === activeNodeId);

                return (
                  <line
                    key={idx}
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    className={`transition-all ${getEdgeColor(edge.relationship, !!isConnected)}`}
                    strokeWidth={isConnected ? 2 : 1}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {filteredNodes.map((node) => {
                const pos = layoutPositions[node.id];
                if (!pos) return null;

                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isConnected = !activeNodeId || connectedNodeIds.has(node.id);
                const radius = node.type === 'cluster' ? 12 : node.type === 'domain' ? 9 : 6;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="cursor-pointer group"
                  >
                    <circle
                      r={radius + (isSelected || isHovered ? 3 : 0)}
                      className={`stroke-2 transition-all ${getNodeColor(node.type, !isConnected)}`}
                    />

                    {/* Label for clusters/domains or hovered node */}
                    {(node.type !== 'user' || isSelected || isHovered || filteredNodes.length < 30) && (
                      <text
                        dy={radius + 10}
                        textAnchor="middle"
                        className="text-[9px] font-mono fill-slate-700 dark:fill-slate-300 pointer-events-none font-medium"
                      >
                        {node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Node Inspector Side Panel */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Entity Inspector
            </div>
            {selectedNode && (
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Node Type</span>
                <div className="mt-0.5">
                  <Badge variant={selectedNode.type === 'cluster' ? 'danger' : selectedNode.type === 'domain' ? 'warning' : 'blue'}>
                    {selectedNode.type.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Identifier / Label</span>
                <div className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5 break-all">
                  {selectedNode.label}
                </div>
              </div>

              {selectedNode.type === 'user' && selectedNode.attributes && (
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div>Followers: <strong className="font-mono text-slate-900 dark:text-slate-100">{selectedNode.attributes.followers ?? 0}</strong></div>
                  <div>Following: <strong className="font-mono text-slate-900 dark:text-slate-100">{selectedNode.attributes.following ?? 0}</strong></div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    icon={<ExternalLink className="w-3 h-3" />}
                    onClick={() => navigate(`/datasets/${datasetId}/users/${selectedNode.attributes.user_id || selectedNode.id.replace('user:', '')}`)}
                  >
                    View Account Timeline
                  </Button>
                </div>
              )}

              {selectedNode.type === 'cluster' && (
                <div className="space-y-2">
                  <div className="text-slate-600 dark:text-slate-300">
                    Accounts: <strong className="font-mono text-slate-900 dark:text-slate-100">{selectedNode.attributes.size_users}</strong>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => onSelectCluster?.(selectedNode.attributes.cluster_id || selectedNode.id.replace('cluster:', ''))}
                  >
                    Drill into Cluster
                  </Button>
                </div>
              )}

              {selectedNode.type === 'domain' && (
                <div className="text-slate-600 dark:text-slate-300">
                  Sharer Count: <strong className="font-mono text-slate-900 dark:text-slate-100">{selectedNode.attributes.sharer_count ?? 0} accounts</strong>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 leading-relaxed">
              Click any node in the topology canvas to inspect metadata, connections, and drill-down shortcuts.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

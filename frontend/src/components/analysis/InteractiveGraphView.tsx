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
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = React.useRef<SVGSVGElement | null>(null);
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

    // Place clusters in layered inner orbits
    const clustersPerLayer = Math.min(8, Math.max(5, Math.ceil(clusters.length / 3)));
    clusters.forEach((c, idx) => {
      const layer = Math.floor(idx / clustersPerLayer);
      const layerIdx = idx % clustersPerLayer;
      const countInLayer = Math.min(clustersPerLayer, clusters.length - layer * clustersPerLayer);
      const angle = (layerIdx / Math.max(1, countInLayer)) * 2 * Math.PI + layer * 0.4;
      const radius = 45 + layer * 32;
      positions[c.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    const maxClusterRadius = 45 + Math.ceil(clusters.length / clustersPerLayer) * 32;
    const domainRadius = Math.max(120, maxClusterRadius + 28);

    // Place domains in middle orbit
    domains.forEach((d, idx) => {
      const angle = (idx / Math.max(1, domains.length)) * 2 * Math.PI + 0.2;
      positions[d.id] = {
        x: centerX + domainRadius * Math.cos(angle),
        y: centerY + domainRadius * Math.sin(angle),
      };
    });

    // Place users in outer orbit within 205px bounds
    const userRadius = domainRadius + 42;
    users.forEach((u, idx) => {
      const angle = (idx / Math.max(1, users.length)) * 2 * Math.PI;
      const r = Math.min(215, userRadius + (idx % 3) * 12);
      positions[u.id] = {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
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

  // Map cluster indices
  const clusterIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    const clusters = filteredNodes.filter((n) => n.type === 'cluster');
    clusters.forEach((c, idx) => map.set(c.id, idx + 1));
    return map;
  }, [filteredNodes]);

  const getNodeColor = (type: string, isDimmed: boolean) => {
    if (isDimmed) return 'fill-slate-200 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700 opacity-40';
    if (type === 'cluster') return 'fill-purple-600 stroke-purple-700 dark:fill-purple-500 dark:stroke-purple-400';
    if (type === 'domain') return 'fill-amber-500 stroke-amber-600 dark:fill-amber-400 dark:stroke-amber-300';
    return 'fill-blue-600 stroke-blue-700 dark:fill-cyan-400 dark:stroke-cyan-300';
  };

  // Drag and Pan handlers with constraints
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const maxPanX = 300 * Math.max(1, zoomLevel);
    const maxPanY = 220 * Math.max(1, zoomLevel);

    const newX = Math.max(-maxPanX, Math.min(maxPanX, e.clientX - dragStart.x));
    const newY = Math.max(-maxPanY, Math.min(maxPanY, e.clientY - dragStart.y));
    setPan({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.0012;
    setZoomLevel((prev) => Math.max(0.4, Math.min(3.5, prev + zoomDelta)));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
    setSearchQuery('');
    setSelectedNode(null);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Node type filters */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">Filter:</span>
          {(['all', 'user', 'domain', 'cluster'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                filterType === type
                  ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {type === 'all' ? 'All' : type === 'user' ? 'Accounts' : type === 'domain' ? 'Domains' : 'Clusters'}
            </button>
          ))}
        </div>

        {/* Search & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search node ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 w-40 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
            />
          </div>

          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-slate-50 dark:bg-slate-900">
            <button
              onClick={() => setZoomLevel((z) => Math.min(3.5, z + 0.2))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.2))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Reset view (Pan & Zoom)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspector Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5">
        {/* SVG Graph Viewport */}
        <div className="lg:col-span-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f17] relative overflow-hidden flex items-center justify-center min-h-[480px]">
          {/* Legend & Navigation Hint */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-3 p-1.5 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200/80 dark:border-slate-800 text-[10px] font-mono pointer-events-none">
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
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-400 dark:text-slate-500">Drag to Pan • Scroll to Zoom</span>
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 680 480"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            className={`w-full h-full select-none touch-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Transform Group with Pan & Zoom */}
            <g
              transform={`translate(${pan.x}, ${pan.y}) translate(340, 240) scale(${zoomLevel}) translate(-340, -240)`}
              style={{ transition: isDragging ? 'none' : 'transform 0.15s ease-out' }}
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
                      className={`transition-all ${
                        isConnected
                          ? 'stroke-blue-600 dark:stroke-cyan-400 opacity-100 stroke-[1.5]'
                          : activeNodeId
                          ? 'stroke-slate-200 dark:stroke-slate-800/40 opacity-10 stroke-[0.5]'
                          : 'stroke-slate-300 dark:stroke-slate-700/40 opacity-20 stroke-[0.75]'
                      }`}
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
                  const radius = node.type === 'cluster' ? 10 : node.type === 'domain' ? 8 : 5;

                  const shouldShowLabel =
                    isSelected ||
                    isHovered ||
                    (filteredNodes.length < 25) ||
                    (node.type === 'domain' && isConnected && !activeNodeId && filteredNodes.length < 50);

                  const clusterNumber = clusterIndexMap.get(node.id);

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node);
                      }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className="cursor-pointer group"
                    >
                      <circle
                        r={radius + (isSelected || isHovered ? 3 : 0)}
                        className={`stroke-2 transition-all ${getNodeColor(node.type, !isConnected)}`}
                      />

                      {/* Compact index number inside cluster circle */}
                      {node.type === 'cluster' && clusterNumber && !shouldShowLabel && (
                        <text
                          dy={3}
                          textAnchor="middle"
                          className="text-[8px] font-mono fill-white pointer-events-none font-bold"
                        >
                          {clusterNumber}
                        </text>
                      )}

                      {/* Interactive label on hover / select */}
                      {shouldShowLabel && (
                        <g className="pointer-events-none">
                          <rect
                            x={-(node.label.length * 3 + 6)}
                            y={radius + 3}
                            width={node.label.length * 6 + 12}
                            height={14}
                            rx={3}
                            className="fill-slate-900/90 dark:fill-black/90"
                          />
                          <text
                            dy={radius + 13}
                            textAnchor="middle"
                            className="text-[9px] font-mono fill-white font-medium"
                          >
                            {node.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
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

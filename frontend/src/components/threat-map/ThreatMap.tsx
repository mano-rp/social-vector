import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LocationThreatData } from '../../utils/geoCoordinates';
import {
  WORLD_LANDMASS_PATHS,
  GRATICULE_GRID_LINES,
  WORLD_VIEWBOX,
  projectLatLngToXY,
} from './worldMapData';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ThreatMapProps {
  locations: LocationThreatData[];
  selectedLocationId: string | null;
  onSelectLocation: (loc: LocationThreatData | null) => void;
  hoveredLocationId?: string | null;
  onHoverLocation?: (loc: LocationThreatData | null) => void;
}

export const ThreatMap: React.FC<ThreatMapProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  hoveredLocationId,
  onHoverLocation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [localHovered, setLocalHovered] = useState<LocationThreatData | null>(null);

  // Maximum user count for scaling radius
  const maxUsers = Math.max(...locations.map((l) => l.userCount), 1);

  // Reset view to default
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(3.5, z * 1.3));
  const handleZoomOut = () => setZoom((z) => Math.max(0.8, z / 1.3));

  // Pan interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((z) => Math.max(0.8, Math.min(3.8, z * zoomFactor)));
  };

  // Focus on selected location if changed
  useEffect(() => {
    if (selectedLocationId) {
      const loc = locations.find((l) => l.locationId === selectedLocationId);
      if (loc) {
        const xy = projectLatLngToXY(loc.coordinates.lat, loc.coordinates.lng);
        // Center the selected point
        const targetX = (WORLD_VIEWBOX.width / 2 - xy.x) * zoom;
        const targetY = (WORLD_VIEWBOX.height / 2 - xy.y) * zoom;
        setPan({ x: targetX, y: targetY });
      }
    }
  }, [selectedLocationId]);

  const activeHover = localHovered || (hoveredLocationId ? locations.find((l) => l.locationId === hoveredLocationId) : null);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b0f17] overflow-hidden select-none"
      style={{ height: '480px' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Controls Overlay */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-white/90 dark:bg-[#0f141c]/90 backdrop-blur-sm p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in map"
          className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom out map"
          className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          aria-label="Reset map view"
          className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/90 dark:bg-[#0f141c]/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 space-y-1 shadow-sm">
        <div className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1">
          Observed Density
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
            <span>High Density / Threat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Elevated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-cyan-400" />
            <span>Baseline</span>
          </div>
        </div>
      </div>

      {/* Interactive Tooltip Card */}
      {activeHover && (
        <div
          className="absolute z-30 pointer-events-none bg-slate-900/95 dark:bg-[#0f141c]/95 text-white backdrop-blur-md p-2.5 rounded-lg border border-slate-700 dark:border-slate-800 text-xs shadow-lg space-y-1 max-w-xs transition-opacity"
          style={{
            left: `${Math.min(
              (containerRef.current?.clientWidth || 600) - 200,
              Math.max(20, projectLatLngToXY(activeHover.coordinates.lat, activeHover.coordinates.lng).x * (zoom * (containerRef.current?.clientWidth || 1000) / 1000) + pan.x + 15)
            )}px`,
            top: `${Math.min(
              (containerRef.current?.clientHeight || 480) - 100,
              Math.max(20, projectLatLngToXY(activeHover.coordinates.lat, activeHover.coordinates.lng).y * (zoom * (containerRef.current?.clientHeight || 500) / 500) + pan.y - 45)
            )}px`,
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-100">{activeHover.name}</span>
            <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
              activeHover.threatLevel === 'critical' || activeHover.threatLevel === 'high'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : activeHover.threatLevel === 'medium'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-blue-500/20 text-cyan-300 border border-cyan-500/30'
            }`}>
              {activeHover.threatLevel}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 flex items-center gap-3 font-mono">
            <span>Users: <strong className="text-white">{activeHover.userCount}</strong></span>
            <span>Posts: <strong className="text-white">{activeHover.postCount}</strong></span>
            <span>Coord: <strong className="text-cyan-400">{(activeHover.coordinationScore * 100).toFixed(0)}%</strong></span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {activeHover.country} · [{activeHover.coordinates.lat.toFixed(1)}°, {activeHover.coordinates.lng.toFixed(1)}°]
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${WORLD_VIEWBOX.width} ${WORLD_VIEWBOX.height}`}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ transformOrigin: 'center center', transition: isDragging ? 'none' : 'transform 0.15s ease-out' }}
        >
          {/* Subtle Graticule Grid */}
          <g className="graticules opacity-20 dark:opacity-10 pointer-events-none">
            {GRATICULE_GRID_LINES.map((grid, idx) => (
              <path
                key={idx}
                d={grid.path}
                fill="none"
                stroke="currentColor"
                strokeWidth={grid.type === 'equator' ? 1.2 : 0.8}
                strokeDasharray={grid.type === 'tropic' ? '4,4' : undefined}
                className="text-slate-400 dark:text-slate-600"
              />
            ))}
          </g>

          {/* World Landmasses */}
          <g className="landmasses">
            {WORLD_LANDMASS_PATHS.map((feature) => (
              <path
                key={feature.id}
                d={feature.path}
                className="fill-slate-200 dark:fill-[#1e293b] stroke-slate-300 dark:stroke-[#334155] transition-colors"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* Density Markers */}
          <g className="markers">
            {locations.map((loc) => {
              const { x, y } = projectLatLngToXY(loc.coordinates.lat, loc.coordinates.lng);
              const isSelected = selectedLocationId === loc.locationId;
              const isHovered = activeHover?.locationId === loc.locationId;

              // Size radius proportional to user count
              const baseRadius = 4.5 + Math.sqrt(loc.userCount / maxUsers) * 11;
              const radius = isSelected || isHovered ? baseRadius + 3 : baseRadius;

              const isCritical = loc.threatLevel === 'critical' || loc.threatLevel === 'high';
              const isMedium = loc.threatLevel === 'medium';

              return (
                <g
                  key={loc.locationId}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLocation(isSelected ? null : loc);
                  }}
                  onMouseEnter={() => {
                    setLocalHovered(loc);
                    onHoverLocation?.(loc);
                  }}
                  onMouseLeave={() => {
                    setLocalHovered(null);
                    onHoverLocation?.(null);
                  }}
                >
                  {/* Outer Pulsing Halo on Critical/High threat */}
                  {isCritical && (
                    <circle
                      r={radius + 6}
                      className="fill-rose-500/20 dark:fill-rose-400/20 animate-ping opacity-60 pointer-events-none"
                    />
                  )}

                  {/* Selected Location Ring */}
                  {isSelected && (
                    <circle
                      r={radius + 5}
                      fill="none"
                      className="stroke-blue-600 dark:stroke-cyan-400 stroke-2 animate-pulse"
                    />
                  )}

                  {/* Core Marker Circle */}
                  <circle
                    r={radius}
                    className={`stroke-2 transition-all duration-200 ${
                      isCritical
                        ? 'fill-rose-500 stroke-white dark:stroke-slate-900 shadow-md'
                        : isMedium
                        ? 'fill-amber-500 stroke-white dark:stroke-slate-900'
                        : 'fill-blue-600 dark:fill-cyan-400 stroke-white dark:stroke-slate-900'
                    }`}
                  />

                  {/* User Count Indicator in Center if large enough */}
                  {radius >= 9 && (
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      className="text-[9px] font-mono font-bold fill-white dark:fill-slate-950 pointer-events-none select-none"
                    >
                      {loc.userCount}
                    </text>
                  )}

                  {/* Always visible label on selected marker or hovered marker */}
                  {(isSelected || isHovered) && (
                    <g transform={`translate(0, ${-(radius + 8)})`}>
                      <rect
                        x="-45"
                        y="-16"
                        width="90"
                        height="16"
                        rx="3"
                        className="fill-slate-900/90 dark:fill-[#0f141c]/90 stroke border border-slate-700"
                      />
                      <text
                        textAnchor="middle"
                        y="-4"
                        className="text-[9px] font-mono font-bold fill-white dark:fill-cyan-300 pointer-events-none"
                      >
                        {loc.name.length > 14 ? `${loc.name.slice(0, 12)}...` : loc.name}
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
  );
};

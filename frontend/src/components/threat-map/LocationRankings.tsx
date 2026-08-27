import React, { useState, useMemo } from 'react';
import { LocationThreatData, MapSummaryStats } from '../../utils/geoCoordinates';
import { Badge } from '../common/Badge';
import { Globe, Search, ChevronRight } from 'lucide-react';

interface LocationRankingsProps {
  locations: LocationThreatData[];
  summary: MapSummaryStats;
  selectedLocationId: string | null;
  onSelectLocation: (loc: LocationThreatData) => void;
}

export const LocationRankings: React.FC<LocationRankingsProps> = ({
  locations,
  summary,
  selectedLocationId,
  onSelectLocation,
}) => {
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'users' | 'posts'>('users');

  const filteredLocations = useMemo(() => {
    return locations
      .filter((loc) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return loc.name.toLowerCase().includes(q) || loc.country.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'users') return b.userCount - a.userCount || b.postCount - a.postCount;
        return b.postCount - a.postCount || b.userCount - a.userCount;
      });
  }, [locations, search, sortBy]);

  const maxMetric = Math.max(...locations.map((l) => (sortBy === 'users' ? l.userCount : l.postCount)), 1);

  return (
    <div className="space-y-4">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Locations Observed</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {summary.totalLocations}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Distinct geocoded places</p>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Sovereign Regions</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {summary.totalCountries}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Countries represented</p>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Top Density Node</div>
          <div className="text-sm font-bold text-slate-900 dark:text-cyan-400 mt-0.5 truncate">
            {summary.topLocation?.name || 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
            {summary.topLocation ? `${summary.topLocation.userCount} users · ${summary.topLocation.postCount} posts` : 'No observations'}
          </p>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Geographic Spread</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {(summary.geographicEntropy * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {summary.geographicEntropy > 0.7 ? 'Dispersed' : summary.geographicEntropy > 0.4 ? 'Clustered' : 'Highly Concentrated'}
          </p>
        </div>
      </div>

      {/* Ranked Location List Panel */}
      <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Geographic Distribution Rankings</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Toggle */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
              <span>Sort:</span>
              <button
                onClick={() => setSortBy('users')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  sortBy === 'users'
                    ? 'bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setSortBy('posts')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  sortBy === 'posts'
                    ? 'bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Posts
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 w-36 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Location Rows */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((loc, idx) => {
              const isSelected = selectedLocationId === loc.locationId;
              const val = sortBy === 'users' ? loc.userCount : loc.postCount;
              const widthPct = Math.max(5, (val / maxMetric) * 100);

              return (
                <div
                  key={loc.locationId}
                  onClick={() => onSelectLocation(loc)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 dark:border-cyan-400 bg-blue-50/40 dark:bg-cyan-950/20 shadow-sm'
                      : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {loc.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                        ({loc.country})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-bold">
                        {loc.userCount} users · {loc.postCount} posts
                      </span>
                      <Badge
                        variant={
                          loc.threatLevel === 'critical' || loc.threatLevel === 'high'
                            ? 'danger'
                            : loc.threatLevel === 'medium'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {loc.threatLevel.toUpperCase()}
                      </Badge>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSelected ? 'rotate-90 text-blue-600 dark:text-cyan-400' : ''}`} />
                    </div>
                  </div>

                  {/* Relative Density Bar */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        loc.threatLevel === 'critical' || loc.threatLevel === 'high'
                          ? 'bg-rose-500'
                          : loc.threatLevel === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-blue-600 dark:bg-cyan-400'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching locations found for "{search}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

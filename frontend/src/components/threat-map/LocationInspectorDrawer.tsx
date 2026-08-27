import React, { useState } from 'react';
import { LocationThreatData } from '../../utils/geoCoordinates';
import { Badge } from '../common/Badge';
import { X, Users, MessageSquare, Globe, Hash, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LocationInspectorDrawerProps {
  location: LocationThreatData;
  datasetId: string;
  onClose: () => void;
}

export const LocationInspectorDrawer: React.FC<LocationInspectorDrawerProps> = ({
  location,
  datasetId,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const navigate = useNavigate();

  return (
    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-3.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Selected Geographic Node
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-0.5">
            <span>{location.name}</span>
            <Badge
              variant={
                location.threatLevel === 'critical' || location.threatLevel === 'high'
                  ? 'danger'
                  : location.threatLevel === 'medium'
                  ? 'warning'
                  : 'blue'
              }
              size="sm"
            >
              {location.threatLevel.toUpperCase()}
            </Badge>
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            {location.country} · [{location.coordinates.lat.toFixed(2)}°, {location.coordinates.lng.toFixed(2)}°]
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close location inspector"
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Accounts</div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
            {location.userCount}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Posts</div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
            {location.postCount}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Coordination</div>
          <div className="font-bold text-blue-600 dark:text-cyan-400 text-sm mt-0.5">
            {(location.coordinationScore * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Shared Signals */}
      {(location.sampleDomains.length > 0 || location.sampleHashtags.length > 0) && (
        <div className="space-y-2 pt-1 text-xs">
          {location.sampleDomains.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {location.sampleDomains.map((d) => (
                <span
                  key={d}
                  className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/60 text-blue-700 dark:text-cyan-300 font-mono text-[10px]"
                >
                  {d}
                </span>
              ))}
            </div>
          )}

          {location.sampleHashtags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {location.sampleHashtags.map((h) => (
                <span
                  key={h}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]"
                >
                  #{h}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs for Accounts / Posts */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5 text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Accounts ({location.users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'posts'
                ? 'bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Posts ({location.posts.length})</span>
          </button>
        </div>

        {/* Tab Content: Users */}
        {activeTab === 'users' && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {location.users.map((u) => (
              <div
                key={u.user_id}
                onClick={() => navigate(`/datasets/${datasetId}/users/${u.user_id}`)}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs cursor-pointer group transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {u.display_name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-cyan-400 truncate">
                    @{u.username}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
                  <span>{u.metrics?.followers_count ?? 0} flw</span>
                  <ExternalLink className="w-3 h-3 group-hover:text-slate-700 dark:group-hover:text-cyan-300 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Posts */}
        {activeTab === 'posts' && (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {location.posts.length > 0 ? (
              location.posts.slice(0, 10).map((p) => (
                <div
                  key={p.post_id}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{p.author_id}</span>
                    <span>{new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                    {p.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No posts observed directly from this location.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

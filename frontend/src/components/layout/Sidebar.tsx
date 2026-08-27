import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDataset } from '../../context/DatasetContext';
import {
  Database,
  Layers,
  Radio,
  Users,
  MessageSquare,
  Activity,
  FileSearch,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeDatasetId, datasets, openGenerator } = useDataset();

  const baseDatasetPath = activeDatasetId ? `/datasets/${activeDatasetId}` : '/datasets';

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
      isActive
        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-cyan-400 font-semibold'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
    }`;

  return (
    <aside className="w-60 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] flex flex-col shrink-0 min-h-[calc(100vh-3.5rem)] transition-colors">
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-mono">
              Workspace
            </div>
            <nav className="space-y-1">
              <NavLink to="/datasets" end className={navItemClass}>
                <Database className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:text-slate-500" />
                <span className="flex-1">Datasets</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {datasets.length}
                </span>
              </NavLink>
            </nav>
          </div>

          {activeDatasetId ? (
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-mono">
                Active Social World
              </div>
              <nav className="space-y-1">
                <NavLink to={`${baseDatasetPath}/overview`} className={navItemClass}>
                  <Layers className="w-4 h-4" />
                  <span>Overview</span>
                </NavLink>
                <NavLink to={`${baseDatasetPath}/feed`} className={navItemClass}>
                  <Radio className="w-4 h-4" />
                  <span>Social Feed</span>
                </NavLink>
                <NavLink to={`${baseDatasetPath}/users`} className={navItemClass}>
                  <Users className="w-4 h-4" />
                  <span>Users Directory</span>
                </NavLink>
                <NavLink to={`${baseDatasetPath}/posts`} className={navItemClass}>
                  <MessageSquare className="w-4 h-4" />
                  <span>Posts Explorer</span>
                </NavLink>
                <NavLink to={`${baseDatasetPath}/analysis`} className={navItemClass}>
                  <Activity className="w-4 h-4" />
                  <span>Analysis Lab</span>
                </NavLink>
                <NavLink to={`${baseDatasetPath}/investigations`} className={navItemClass}>
                  <FileSearch className="w-4 h-4" />
                  <span>Investigations</span>
                </NavLink>
              </nav>
            </div>
          ) : (
            <div className="px-3 py-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-md text-center">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">
                No active dataset selected
              </p>
              <NavLink
                to="/datasets"
                className="text-xs text-blue-600 dark:text-cyan-400 font-medium hover:underline inline-block"
              >
                Select or Generate &rarr;
              </NavLink>
            </div>
          )}

          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-mono">
              Future Modules
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-slate-400 dark:text-slate-600 cursor-not-allowed">
                <span className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4" />
                  <span>Threat Map</span>
                </span>
                <span className="text-[9px] font-mono uppercase bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 px-1 rounded">
                  Phase 3
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={openGenerator}
            className="w-full flex items-center justify-center gap-2 p-2.5 text-xs rounded-md bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-cyan-400" />
            <span>Generate New Dataset</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

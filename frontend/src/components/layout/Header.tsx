import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useDataset } from '../../context/DatasetContext';
import { Sun, Moon, Database } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { isHacker, toggleTheme } = useTheme();
  const { activeDatasetMeta, activeDataset } = useDataset();
  const navigate = useNavigate();

  const usersCount = activeDataset?.users.length ?? activeDatasetMeta?.totalUsers ?? 0;
  const postsCount = activeDataset?.posts.length ?? activeDatasetMeta?.totalPosts ?? 0;

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f141c]/80 backdrop-blur-sm sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors shrink-0">
      {/* Left: Brand + Active Dataset context */}
      <div className="flex items-center gap-4">
        <Link to="/datasets" className="flex items-center gap-2 group">
          <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100">
            Social Vector
          </span>
        </Link>

        {activeDatasetMeta && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-400 dark:text-slate-500">Active Dataset:</span>
            <button
              onClick={() => navigate(`/datasets/${activeDatasetMeta.id}/overview`)}
              className="font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-slate-400 dark:text-cyan-400" />
              <span>{activeDatasetMeta.scenario.replace(/_/g, ' ')}</span>
            </button>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1.5 ml-1">
              <span>{usersCount} users</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>{postsCount} posts</span>
            </span>
          </div>
        )}
      </div>

      {/* Right: Theme Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle visual theme"
          className="flex items-center justify-center p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
          title={`Switch to ${isHacker ? 'Professional' : 'Hacker'} theme`}
        >
          {isHacker ? (
            <Moon className="w-4 h-4 text-cyan-400" />
          ) : (
            <Sun className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
};

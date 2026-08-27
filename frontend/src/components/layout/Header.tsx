import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useDataset } from '../../context/DatasetContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Plus, Sun, Moon, Database } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { isHacker, toggleTheme } = useTheme();
  const { activeDatasetMeta, activeDataset, openGenerator } = useDataset();
  const navigate = useNavigate();

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
            <Badge variant="neutral" size="sm">
              {activeDataset?.users.length ?? activeDatasetMeta.totalUsers} users · {activeDataset?.posts.length ?? activeDatasetMeta.totalPosts} posts
            </Badge>
          </div>
        )}
      </div>

      {/* Right: Actions + Theme Toggle */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={openGenerator}
        >
          Generate Dataset
        </Button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle visual theme"
          className="flex items-center justify-center p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          title={`Switch to ${isHacker ? 'Professional' : 'Hacker'} theme`}
        >
          {isHacker ? (
            <Moon className="w-4 h-4 text-cyan-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>
      </div>
    </header>
  );
};

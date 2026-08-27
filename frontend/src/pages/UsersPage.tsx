import React, { useState, useMemo } from 'react';
import { useDataset } from '../context/DatasetContext';
import { Avatar } from '../components/common/Avatar';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { Search, ShieldCheck, Activity, MapPin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const UsersPage: React.FC = () => {
  const { activeDataset, isLoadingActiveDataset, openAnalysis } = useDataset();
  const { datasetId } = useParams<{ datasetId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 30;
  const navigate = useNavigate();

  const users = activeDataset?.users || [];

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.display_name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q) ||
        (u.location && u.location.toLowerCase().includes(q))
    );
  }, [users, searchQuery]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  if (isLoadingActiveDataset || !activeDataset) {
    return <LoadingState message="Loading users directory..." />;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Observed Users Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total of {users.length.toLocaleString()} user accounts participating in this environment.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, handle, bio..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
          />
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3.5">
            {paginatedUsers.map((u) => (
              <div
                key={u.user_id}
                onClick={() => navigate(`/datasets/${datasetId}/users/${u.user_id}`)}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.display_name} username={u.username} size="md" />
                      <div>
                        <div className="flex items-center gap-1 font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:underline">
                          <span>{u.display_name}</span>
                          {u.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400 shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                          @{u.username}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAnalysis('feed', u.user_id, u);
                      }}
                      title="Analyse this user feed"
                      className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {u.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2.5 leading-relaxed">
                      {u.bio}
                    </p>
                  )}

                  {u.location && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mb-2.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{u.location}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {u.metrics.followers_count.toLocaleString()}
                      </strong>{' '}
                      <span className="text-[10px] text-slate-400">flw</span>
                    </span>
                    <span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {u.metrics.following_count.toLocaleString()}
                      </strong>{' '}
                      <span className="text-[10px] text-slate-400">ing</span>
                    </span>
                  </div>

                  <span className="text-blue-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[11px] font-medium">
                    Feed &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 pb-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                &larr; Previous
              </button>
              <span className="text-xs text-slate-500 font-mono px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="No users match your query"
          description="Try searching with a different name, username, or keyword."
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      )}
    </div>
  );
};

import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataset } from '../context/DatasetContext';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { PostList } from '../components/feed/PostList';
import { LoadingState } from '../components/common/LoadingState';
import {
  ShieldCheck,
  Calendar,
  MapPin,
  Activity,
  ArrowLeft,
  Smartphone,
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { datasetId, userId } = useParams<{ datasetId: string; userId: string }>();
  const { activeDataset, userMap, isLoadingActiveDataset, openAnalysis } = useDataset();
  const navigate = useNavigate();

  const user = useMemo(() => {
    if (!userId) return null;
    return userMap.get(userId) || null;
  }, [userMap, userId]);

  const userPosts = useMemo(() => {
    if (!activeDataset || !userId) return [];
    return activeDataset.posts.filter((p) => p.author_id === userId);
  }, [activeDataset, userId]);

  if (isLoadingActiveDataset || !activeDataset) {
    return <LoadingState message="Loading user profile..." />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">User Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">The requested user does not exist in this dataset.</p>
        <Button size="sm" onClick={() => navigate(`/datasets/${datasetId}/users`)}>
          Return to Users
        </Button>
      </div>
    );
  }

  const formattedJoinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      })
    : 'Unknown';

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button
        onClick={() => navigate(`/datasets/${datasetId}/users`)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Users Directory</span>
      </button>

      <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <Avatar name={user.display_name} username={user.username} size="xl" />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {user.display_name}
                </h1>
                {user.verified && (
                  <ShieldCheck className="w-4 h-4 text-blue-500 dark:text-cyan-400 shrink-0" />
                )}
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">@{user.username}</p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 pt-0.5">
                <span>ID: {user.user_id}</span>
                <span>·</span>
                <span className="capitalize">{user.account_type.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Activity className="w-3.5 h-3.5" />}
            onClick={() => openAnalysis('feed', user.user_id, user)}
          >
            Analyse User
          </Button>
        </div>

        {user.bio && (
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
            {user.bio}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
          {user.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{user.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Joined {formattedJoinedDate}</span>
          </div>
          {user.device_client && (
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>{user.device_client}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
          <div>
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">
              {user.metrics.followers_count.toLocaleString()}
            </strong>{' '}
            <span className="text-slate-500">Followers</span>
          </div>
          <div>
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">
              {user.metrics.following_count.toLocaleString()}
            </strong>{' '}
            <span className="text-slate-500">Following</span>
          </div>
          <div>
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">
              {userPosts.length.toLocaleString()}
            </strong>{' '}
            <span className="text-slate-500">Posts in Dataset</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          Observable Feed ({userPosts.length} posts)
        </h2>

        <PostList
          posts={userPosts}
          userMap={userMap}
          datasetId={datasetId || activeDataset.metadata.dataset_id}
          initialAuthorId={userId}
        />
      </div>
    </div>
  );
};

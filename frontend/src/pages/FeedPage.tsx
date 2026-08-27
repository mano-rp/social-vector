import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { PostList } from '../components/feed/PostList';
import { LoadingState } from '../components/common/LoadingState';
import { useParams } from 'react-router-dom';

export const FeedPage: React.FC = () => {
  const { activeDataset, userMap, isLoadingActiveDataset } = useDataset();
  const { datasetId } = useParams<{ datasetId: string }>();

  if (isLoadingActiveDataset || !activeDataset) {
    return <LoadingState message="Loading social feed..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Social Observation Feed
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time chronological timeline of all observed user posts in this dataset.
        </p>
      </div>

      <PostList
        posts={activeDataset.posts}
        userMap={userMap}
        datasetId={datasetId || activeDataset.metadata.dataset_id}
      />
    </div>
  );
};

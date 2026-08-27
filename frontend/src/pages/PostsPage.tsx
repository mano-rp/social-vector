import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { PostList } from '../components/feed/PostList';
import { LoadingState } from '../components/common/LoadingState';
import { useParams } from 'react-router-dom';

export const PostsPage: React.FC = () => {
  const { activeDataset, userMap, isLoadingActiveDataset } = useDataset();
  const { datasetId } = useParams<{ datasetId: string }>();

  if (isLoadingActiveDataset || !activeDataset) {
    return <LoadingState message="Loading posts explorer..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Posts Explorer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Filter and examine all {activeDataset.posts.length.toLocaleString()} observable posts by keyword, hashtag, domain, or author.
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

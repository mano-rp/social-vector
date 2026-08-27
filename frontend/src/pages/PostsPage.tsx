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
    <div className="w-full space-y-5">
      <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Posts Explorer
        </h1>
      </div>

      <PostList
        posts={activeDataset.posts}
        userMap={userMap}
        datasetId={datasetId || activeDataset.metadata.dataset_id}
      />
    </div>
  );
};

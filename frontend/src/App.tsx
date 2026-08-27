import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DatasetsPage } from './pages/DatasetsPage';
import { DatasetOverviewPage } from './pages/DatasetOverviewPage';
import { FeedPage } from './pages/FeedPage';
import { UsersPage } from './pages/UsersPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { PostsPage } from './pages/PostsPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { useDataset } from './context/DatasetContext';

// Helper component that synchronizes route datasetId with active dataset in context
const DatasetRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { datasetId } = useParams<{ datasetId: string }>();
  const { activeDatasetId, selectDataset } = useDataset();

  useEffect(() => {
    if (datasetId && datasetId !== activeDatasetId) {
      selectDataset(datasetId);
    }
  }, [datasetId, activeDatasetId]);

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/datasets" replace />} />
        <Route path="datasets" element={<DatasetsPage />} />

        {/* Dataset Scope Routes */}
        <Route
          path="datasets/:datasetId"
          element={
            <DatasetRouteWrapper>
              <Navigate to="overview" replace />
            </DatasetRouteWrapper>
          }
        />
        <Route
          path="datasets/:datasetId/overview"
          element={
            <DatasetRouteWrapper>
              <DatasetOverviewPage />
            </DatasetRouteWrapper>
          }
        />
        <Route
          path="datasets/:datasetId/feed"
          element={
            <DatasetRouteWrapper>
              <FeedPage />
            </DatasetRouteWrapper>
          }
        />
        <Route
          path="datasets/:datasetId/users"
          element={
            <DatasetRouteWrapper>
              <UsersPage />
            </DatasetRouteWrapper>
          }
        />
        <Route
          path="datasets/:datasetId/users/:userId"
          element={
            <DatasetRouteWrapper>
              <UserProfilePage />
            </DatasetRouteWrapper>
          }
        />
        <Route
          path="datasets/:datasetId/posts"
          element={
            <DatasetRouteWrapper>
              <PostsPage />
            </DatasetRouteWrapper>
          }
        />
        <Route
          path="datasets/:datasetId/analysis"
          element={
            <DatasetRouteWrapper>
              <AnalysisPage />
            </DatasetRouteWrapper>
          }
        />
        <Route
          path="datasets/:datasetId/investigations"
          element={
            <DatasetRouteWrapper>
              <InvestigationsPage />
            </DatasetRouteWrapper>
          }
        />

        <Route path="*" element={<Navigate to="/datasets" replace />} />
      </Route>
    </Routes>
  );
};

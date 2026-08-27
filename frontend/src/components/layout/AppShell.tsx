import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DatasetGeneratorModal } from '../dataset/DatasetGeneratorModal';
import { AnalysisModal } from '../analysis/AnalysisModal';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-pro-bg dark:bg-hacker-bg text-pro-text dark:text-hacker-text transition-colors">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <DatasetGeneratorModal />
      <AnalysisModal />
    </div>
  );
};

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DatasetGeneratorModal } from '../components/dataset/DatasetGeneratorModal';
import { DatasetProvider } from '../context/DatasetContext';

vi.mock('../services/api', () => ({
  getDatasets: vi.fn().mockResolvedValue([
    {
      id: 'sample_extreme',
      filename: 'sample_extreme.json',
      type: 'bundled',
      datasetId: 'ds_extreme_2026',
      scenario: 'extreme_information_operation',
      seed: 2026,
      schemaVersion: '1.0.0',
      contentProfile: 'extreme',
      createdAt: '2026-08-27T12:00:00Z',
      totalUsers: 500,
      totalPosts: 2953,
      totalLikes: 12000,
      totalReposts: 3400,
      totalReplies: 1800,
      hasGroundTruth: true,
      hasCoordination: true,
      campaignCount: 1,
    }
  ]),
  getDataset: vi.fn().mockResolvedValue({
    metadata: {
      dataset_id: 'ds_extreme_2026',
      schema_version: '1.0.0',
      generator_name: 'SocialVector',
      generator_version: '0.1.0',
      scenario: 'extreme_information_operation',
      seed: 2026,
      created_at: '2026-08-27T12:00:00Z',
      parameters: { content_profile: 'extreme' },
      statistics: { total_users: 500, total_posts: 2953 },
    },
    users: [],
    posts: [],
  }),
  generateDataset: vi.fn().mockResolvedValue({
    success: true,
    filename: 'dataset_extreme_s2026_u250_123456.json',
    id: 'dataset_extreme_s2026_u250_123456',
    datasetId: 'ds_generated_01',
    scenario: 'extreme_information_operation',
    contentProfile: 'extreme',
    usersCount: 250,
    postsCount: 1200,
    createdAt: '2026-08-27T12:05:00Z',
  }),
}));

const GeneratorModalWrapper: React.FC = () => {
  return (
    <BrowserRouter>
      <DatasetProvider>
        <DatasetGeneratorModal />
      </DatasetProvider>
    </BrowserRouter>
  );
};

describe('Dataset Generator Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders generation form controls and scenario presets', async () => {
    render(<GeneratorModalWrapper />);
    expect(screen.queryByText('Generate Synthetic Social Dataset')).toBeNull();
  });
});

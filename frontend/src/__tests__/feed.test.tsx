import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PostCard } from '../components/feed/PostCard';
import { PostList } from '../components/feed/PostList';
import { DatasetProvider } from '../context/DatasetContext';
import { PostRecord, UserRecord } from '../types/dataset';

const mockUser: UserRecord = {
  user_id: 'usr_001',
  username: 'marina_s',
  display_name: 'Marina Santos',
  bio: 'Environmental data analyst & marine sensor researcher.',
  created_at: '2026-01-10T12:00:00Z',
  location: 'Port Kestrel',
  metrics: { followers_count: 1420, following_count: 310, posts_count: 55, listed_count: 12 },
  verified: true,
  profile_image_url: null,
  account_type: 'individual',
  language: 'en',
  device_client: 'Web / Desktop Chrome',
  custom_attributes: {},
};

const mockPost1: PostRecord = {
  post_id: 'post_001',
  author_id: 'usr_001',
  created_at: '2026-08-02T10:15:00Z',
  content: 'Analyzing water quality telemetry near Kestrel Sound. Sensor arrays indicate elevated mineral salinity. #MarineScience #KestrelSound https://oceanmetrics.org/sensor-data',
  language: 'en',
  entities: {
    hashtags: ['MarineScience', 'KestrelSound'],
    mentions: [],
    urls: ['https://oceanmetrics.org/sensor-data'],
    media_urls: [],
  },
  metrics: {
    likes_count: 42,
    reposts_count: 15,
    replies_count: 8,
    quotes_count: 2,
    impressions_count: 1200,
  },
  reply_to_post_id: null,
  repost_of_post_id: null,
  client_source: 'Web',
  custom_attributes: {},
};

const mockPost2: PostRecord = {
  post_id: 'post_002',
  author_id: 'usr_001',
  created_at: '2026-08-02T11:00:00Z',
  content: 'Renewable grid transition update for the coastal district. Solar efficiency up 14%. #EnergyTransition',
  language: 'en',
  entities: {
    hashtags: ['EnergyTransition'],
    mentions: [],
    urls: [],
    media_urls: [],
  },
  metrics: {
    likes_count: 18,
    reposts_count: 3,
    replies_count: 1,
    quotes_count: 0,
    impressions_count: 400,
  },
  reply_to_post_id: null,
  repost_of_post_id: null,
  client_source: 'Mobile',
  custom_attributes: {},
};

describe('Feed and Post Components', () => {
  it('renders PostCard with author, hashtags, and engagement metrics', () => {
    const userMap = new Map<string, UserRecord>();
    userMap.set('usr_001', mockUser);

    render(
      <BrowserRouter>
        <DatasetProvider>
          <PostCard
            post={mockPost1}
            author={mockUser}
            datasetId="test_dataset"
          />
        </DatasetProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Marina Santos')).toBeInTheDocument();
    expect(screen.getByText('@marina_s')).toBeInTheDocument();
    expect(screen.getByText(/Analyzing water quality telemetry/)).toBeInTheDocument();
    expect(screen.getByText('#MarineScience')).toBeInTheDocument();
    expect(screen.getByText('#KestrelSound')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('filters posts by search text in PostList', () => {
    const userMap = new Map<string, UserRecord>();
    userMap.set('usr_001', mockUser);

    render(
      <BrowserRouter>
        <DatasetProvider>
          <PostList
            posts={[mockPost1, mockPost2]}
            userMap={userMap}
            datasetId="test_dataset"
          />
        </DatasetProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Analyzing water quality telemetry/)).toBeInTheDocument();
    expect(screen.getByText(/Renewable grid transition/)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search post content/);
    fireEvent.change(searchInput, { target: { value: 'salinity' } });

    expect(screen.getByText(/Analyzing water quality telemetry/)).toBeInTheDocument();
    expect(screen.queryByText(/Renewable grid transition/)).not.toBeInTheDocument();
  });
});

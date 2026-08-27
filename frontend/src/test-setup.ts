import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock axios globally for all jsdom tests
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn((url: string) => {
      if (url === '/datasets') {
        return Promise.resolve({
          data: {
            datasets: [
              {
                id: 'test_ds',
                filename: 'test_ds.json',
                type: 'bundled',
                datasetId: 'test_ds',
                scenario: 'extreme_information_operation',
                seed: 42,
                schemaVersion: '1.0.0',
                contentProfile: 'realistic',
                createdAt: '2026-08-01T00:00:00Z',
                totalUsers: 50,
                totalPosts: 200,
                totalLikes: 100,
                totalReposts: 50,
                totalReplies: 20,
                hasGroundTruth: true,
                hasCoordination: true,
                campaignCount: 1,
              },
            ],
          },
        });
      }
      if (url.startsWith('/datasets/')) {
        return Promise.resolve({
          data: {
            metadata: {
              dataset_id: 'test_ds',
              schema_version: '1.0.0',
              generator_name: 'SocialVector',
              generator_version: '0.1.0',
              scenario: 'extreme_information_operation',
              seed: 42,
              created_at: '2026-08-01T00:00:00Z',
              parameters: { content_profile: 'realistic' },
              statistics: { total_users: 50, total_posts: 200 },
            },
            users: [],
            posts: [],
          },
        });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  };

  return {
    default: {
      create: () => mockAxiosInstance,
      ...mockAxiosInstance,
    },
  };
});

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

// Polyfill EventSource for Vitest jsdom environment
class MockEventSource {
  url: string;
  onmessage: ((ev: any) => void) | null = null;
  onerror: ((ev: any) => void) | null = null;
  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.onmessage?.({
        data: JSON.stringify({
          type: 'stage',
          stage: {
            stage_id: 'ingestion',
            name: 'Dataset Ingestion & Scoping',
            status: 'completed',
            duration_ms: 10,
            description: 'Loads dataset',
            metrics: { posts_loaded: 200, users_loaded: 50 },
            parameters: {},
            warnings: [],
          },
        }),
      });
      this.onmessage?.({
        data: JSON.stringify({
          type: 'result',
          result: {
            analysis_id: 'anl_test_123',
            dataset_id: 'test_ds',
            scope: 'dataset',
            created_at: '2026-08-01T00:00:00Z',
            total_duration_ms: 150,
            config: { similarity_threshold: 0.78, temporal_window_seconds: 300, dbscan_eps: 0.38, dbscan_min_samples: 3, weights: {} },
            stages: [
              { stage_id: 'ingestion', name: 'Dataset Ingestion & Scoping', status: 'completed', duration_ms: 10, description: 'Loads dataset', metrics: {}, parameters: {}, warnings: [] }
            ],
            overall_coordination_score: 0.85,
            confidence_assessment: 'high_confidence_coordinated_operation',
            assessment_rationale: 'High coordinated activity detected',
            signals: [
              { signal_id: 'semantic', name: 'Semantic Similarity', score: 0.88, weight: 0.25, summary: 'High similarity', evidence_items: [] }
            ],
            clusters: [
              { cluster_id: 'cluster_01', coordination_score: 0.9, size_users: 10, size_posts: 40, participating_user_ids: ['usr_1', 'usr_2'], shared_domains: ['example.com'], dominant_hashtags: ['ops'], temporal_span: { duration_minutes: 15 }, signatures: ['shared_domain'], summary: 'Test cluster' }
            ],
            evidence: [
              { evidence_id: 'ev_1', category: 'temporal', severity: 'high', title: 'Burst spike', description: 'Coordinated burst', confidence: 0.9, affiliated_user_ids: ['usr_1'], affiliated_post_ids: [] }
            ],
            graph: { nodes: [], edges: [], density: 0, node_count: 0, edge_count: 0 },
            timeline: [],
            content_stats: { top_domains: [], top_hashtags: [], duplicate_groups: [], verbatim_reuse_ratio: 0.5 },
            behavioral_stats: { client_distribution: {}, asymmetry_distribution: {}, creation_date_histogram: [], anomalous_users: [], creation_clustering_score: 0.1, client_homogeneity_score: 0.2, follower_asymmetry_mean: 1.2 },
            total_users_analyzed: 50,
            total_posts_analyzed: 200,
          },
        }),
      });
    }, 10);
  }
  close() {}
}

(globalThis as any).EventSource = MockEventSource;


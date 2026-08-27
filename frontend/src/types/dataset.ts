/**
 * TypeScript types strictly mirroring the SocialVector schema v1.0.0.
 */

export interface UserMetrics {
  followers_count: number;
  following_count: number;
  posts_count: number;
  listed_count: number;
}

export interface UserRecord {
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  created_at: string;
  location: string | null;
  metrics: UserMetrics;
  verified: boolean;
  profile_image_url: string | null;
  account_type: 'individual' | 'organization' | 'media' | 'unverified_individual' | 'automated_feed' | string;
  language: string;
  device_client: string;
  custom_attributes: Record<string, any>;
}

export interface PostEntities {
  hashtags: string[];
  mentions: string[];
  urls: string[];
  media_urls: string[];
}

export interface PostMetrics {
  likes_count: number;
  reposts_count: number;
  replies_count: number;
  quotes_count: number;
  impressions_count: number;
}

export interface PostRecord {
  post_id: string;
  author_id: string;
  created_at: string;
  content: string;
  language: string;
  entities: PostEntities;
  metrics: PostMetrics;
  reply_to_post_id: string | null;
  repost_of_post_id: string | null;
  client_source: string;
  custom_attributes: Record<string, any>;
}

export interface DatasetMetadata {
  dataset_id: string;
  schema_version: string;
  generator_name: string;
  generator_version: string;
  scenario: string;
  seed: number;
  created_at: string;
  parameters: Record<string, any>;
  statistics: {
    total_users?: number;
    total_posts?: number;
    total_likes?: number;
    total_reposts?: number;
    total_replies?: number;
    avg_posts_per_user?: number;
    start_time?: string;
    end_time?: string;
    [key: string]: any;
  };
}

export interface CampaignGroundTruth {
  campaign_id: string;
  campaign_name: string;
  narrative_theme: string;
  coordination_type: string;
  participating_user_ids: string[];
  affiliated_post_ids: string[];
  targeted_entities: string[];
  temporal_windows: Array<{ stage?: string; start: string; end: string }>;
  coordination_signatures: string[];
  notes: string;
}

export interface GroundTruth {
  has_coordination: boolean;
  scenario_type: string;
  campaigns: CampaignGroundTruth[];
  noise_user_ids: string[];
  evaluation_benchmarks: Record<string, any>;
}

export interface SocialDataset {
  metadata: DatasetMetadata;
  users: UserRecord[];
  posts: PostRecord[];
  ground_truth?: GroundTruth;
}

export interface DatasetListItem {
  id: string;
  filename: string;
  type: 'bundled' | 'user_generated';
  datasetId: string;
  scenario: string;
  seed: number;
  schemaVersion: string;
  contentProfile: string;
  createdAt: string;
  totalUsers: number;
  totalPosts: number;
  totalLikes: number;
  totalReposts: number;
  totalReplies: number;
  hasGroundTruth: boolean;
  hasCoordination: boolean;
  campaignCount: number;
}

export interface ScenarioDescriptor {
  id: string;
  name: string;
  type: string;
  hasCoordination: boolean;
  description: string;
  purpose: string;
}

export interface GenerateDatasetParams {
  scenario: string;
  content_profile: 'standard' | 'realistic' | 'extreme';
  users: number;
  posts_per_user: number;
  seed: number;
  campaign_ratio?: number;
  start_date?: string;
  end_date?: string;
}

export interface GenerateDatasetResponse {
  success: boolean;
  filename: string;
  id: string;
  datasetId: string;
  scenario: string;
  contentProfile: string;
  usersCount: number;
  postsCount: number;
  createdAt: string;
}

export interface PipelineStageResult {
  stage_id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration_ms: number;
  description: string;
  metrics: Record<string, any>;
  parameters: Record<string, any>;
  warnings: string[];
}

export interface SignalScore {
  signal_id: string;
  name: string;
  score: number;
  weight: number;
  confidence: number;
  summary: string;
  metrics: Record<string, any>;
  evidence_items: string[];
}

export interface EvidenceItem {
  evidence_id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affiliated_user_ids: string[];
  affiliated_post_ids: string[];
  supporting_data: Record<string, any>;
}

export interface CoordinatedCluster {
  cluster_id: string;
  cluster_label: number;
  size_users: number;
  size_posts: number;
  coordination_score: number;
  dominant_topics: string[];
  dominant_hashtags: string[];
  shared_domains: string[];
  participating_user_ids: string[];
  affiliated_post_ids: string[];
  temporal_span: {
    start: string;
    end: string;
    duration_minutes: number;
  };
  signatures: string[];
  summary: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  attributes: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
  evidence: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  density: number;
  node_count: number;
  edge_count: number;
}

export interface AnalysisResult {
  analysis_id: string;
  dataset_id: string;
  scope: 'dataset' | 'user' | 'feed';
  target_id?: string | null;
  created_at: string;
  completed_at?: string | null;
  total_duration_ms: number;
  config: {
    similarity_threshold: number;
    temporal_window_seconds: number;
    dbscan_eps: number;
    dbscan_min_samples: number;
    weights: Record<string, number>;
  };
  stages: PipelineStageResult[];
  overall_coordination_score: number;
  confidence_assessment: string;
  assessment_rationale: string;
  signals: SignalScore[];
  clusters: CoordinatedCluster[];
  evidence: EvidenceItem[];
  graph?: GraphData | null;
  total_users_analyzed: number;
  total_posts_analyzed: number;
}

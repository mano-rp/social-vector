import axios from 'axios';
import {
  AnalysisResult,
  DatasetListItem,
  GenerateDatasetParams,
  GenerateDatasetResponse,
  ScenarioDescriptor,
  SocialDataset,
} from '../types/dataset';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDatasets = async (): Promise<DatasetListItem[]> => {
  const res = await client.get<{ datasets: DatasetListItem[] }>('/datasets');
  return res.data.datasets;
};

export const getDataset = async (filename: string): Promise<SocialDataset> => {
  const res = await client.get<SocialDataset>(`/datasets/${filename}`);
  return res.data;
};

export const getScenarios = async (): Promise<ScenarioDescriptor[]> => {
  const res = await client.get<{ scenarios: ScenarioDescriptor[] }>('/scenarios');
  return res.data.scenarios;
};

export const generateDataset = async (params: GenerateDatasetParams): Promise<GenerateDatasetResponse> => {
  const res = await client.post<GenerateDatasetResponse>('/generate', params);
  return res.data;
};

export interface StartAnalysisParams {
  dataset_id: string;
  scope: 'dataset' | 'user' | 'feed';
  target_id?: string;
  threshold?: number;
  eps?: number;
  min_samples?: number;
}

export const runAnalysis = async (params: StartAnalysisParams): Promise<{ success: boolean; analysis_id: string; result: AnalysisResult }> => {
  const res = await client.post('/analysis', params);
  return res.data;
};

export interface AnalysisStreamCallbacks {
  onStage?: (stage: import('../types/dataset').PipelineStageResult) => void;
  onResult?: (result: AnalysisResult) => void;
  onError?: (error: string) => void;
}

export const runAnalysisStream = (
  params: StartAnalysisParams,
  callbacks: AnalysisStreamCallbacks
): (() => void) => {
  const queryParams = new URLSearchParams({
    scope: params.scope,
    dataset_id: params.dataset_id,
    ...(params.target_id ? { target_id: params.target_id } : {}),
    ...(params.threshold ? { threshold: params.threshold.toString() } : {}),
    ...(params.eps ? { eps: params.eps.toString() } : {}),
    ...(params.min_samples ? { min_samples: params.min_samples.toString() } : {}),
  });

  const eventSource = new EventSource(`/api/analysis/stream?${queryParams.toString()}`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'stage' && data.stage) {
        callbacks.onStage?.(data.stage);
      } else if (data.type === 'result' && data.result) {
        callbacks.onResult?.(data.result);
        eventSource.close();
      } else if (data.type === 'error') {
        callbacks.onError?.(data.error || 'Analysis execution error');
        eventSource.close();
      }
    } catch (e: any) {
      console.warn('Failed to parse SSE event:', e);
    }
  };

  eventSource.onerror = () => {
    callbacks.onError?.('Real-time pipeline stream disconnected');
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
};

export const getAnalysisResults = async (analysisId: string): Promise<AnalysisResult> => {
  const res = await client.get<AnalysisResult>(`/analysis/${analysisId}/results`);
  return res.data;
};

export const getAnalysisEvidence = async (analysisId: string) => {
  const res = await client.get(`/analysis/${analysisId}/evidence`);
  return res.data;
};

export const getAnalysisGraph = async (analysisId: string) => {
  const res = await client.get(`/analysis/${analysisId}/graph`);
  return res.data;
};

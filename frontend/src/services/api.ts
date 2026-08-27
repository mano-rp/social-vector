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

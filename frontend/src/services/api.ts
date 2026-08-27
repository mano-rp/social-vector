import axios from 'axios';
import {
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

export const analyzeFeed = async (feedId: string, authorId: string) => {
  const res = await client.post('/analyze/feed', { targetId: feedId, userId: authorId });
  return res.data;
};

export const analyzeDataset = async (datasetId: string) => {
  const res = await client.post('/analyze/dataset', { datasetId });
  return res.data;
};

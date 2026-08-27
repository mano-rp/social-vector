import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { AnalysisResult, DatasetListItem, SocialDataset, UserRecord } from '../types/dataset';
import { getDatasets, getDataset } from '../services/api';

interface DatasetContextType {
  datasets: DatasetListItem[];
  activeDataset: SocialDataset | null;
  activeDatasetMeta: DatasetListItem | null;
  activeDatasetId: string | null;
  isLoadingDatasets: boolean;
  isLoadingActiveDataset: boolean;
  error: string | null;
  userMap: Map<string, UserRecord>;
  refreshDatasets: () => Promise<void>;
  selectDataset: (idOrFilename: string) => Promise<void>;
  isGeneratorOpen: boolean;
  openGenerator: () => void;
  closeGenerator: () => void;
  analysisTarget: { scope: 'feed' | 'dataset' | 'user'; targetId: string; user?: UserRecord } | null;
  openAnalysis: (scope: 'feed' | 'dataset' | 'user', targetId: string, user?: UserRecord) => void;
  closeAnalysis: () => void;
  latestAnalysisResult: AnalysisResult | null;
  setLatestAnalysisResult: (result: AnalysisResult | null) => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datasets, setDatasets] = useState<DatasetListItem[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [activeDataset, setActiveDataset] = useState<SocialDataset | null>(null);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState<boolean>(true);
  const [isLoadingActiveDataset, setIsLoadingActiveDataset] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [analysisTarget, setAnalysisTarget] = useState<{ scope: 'feed' | 'dataset' | 'user'; targetId: string; user?: UserRecord } | null>(null);
  const [latestAnalysisResult, setLatestAnalysisResult] = useState<AnalysisResult | null>(null);

  const refreshDatasets = async () => {
    setIsLoadingDatasets(true);
    setError(null);
    try {
      const list = await getDatasets();
      setDatasets(list);
      if (!activeDatasetId && list.length > 0) {
        selectDataset(list[0].filename);
      }
    } catch (err: any) {
      console.error('Failed to load datasets:', err);
      setError(err.message || 'Failed to retrieve datasets');
    } finally {
      setIsLoadingDatasets(false);
    }
  };

  const selectDataset = async (idOrFilename: string) => {
    const filename = idOrFilename.endsWith('.json') ? idOrFilename : `${idOrFilename}.json`;
    const id = filename.replace('.json', '');
    setActiveDatasetId(id);
    setIsLoadingActiveDataset(true);
    setError(null);
    try {
      const data = await getDataset(filename);
      setActiveDataset(data);
    } catch (err: any) {
      console.error(`Failed to load dataset ${filename}:`, err);
      setError(`Failed to load dataset ${filename}`);
      setActiveDataset(null);
    } finally {
      setIsLoadingActiveDataset(false);
    }
  };

  useEffect(() => {
    refreshDatasets();
  }, []);

  const activeDatasetMeta = useMemo(() => {
    if (!activeDatasetId) return null;
    return datasets.find(d => d.id === activeDatasetId || d.filename === activeDatasetId || d.filename === `${activeDatasetId}.json`) || null;
  }, [datasets, activeDatasetId]);

  const userMap = useMemo(() => {
    const map = new Map<string, UserRecord>();
    if (activeDataset?.users) {
      for (const u of activeDataset.users) {
        map.set(u.user_id, u);
      }
    }
    return map;
  }, [activeDataset]);

  const openGenerator = () => setIsGeneratorOpen(true);
  const closeGenerator = () => setIsGeneratorOpen(false);

  const openAnalysis = (scope: 'feed' | 'dataset' | 'user', targetId: string, user?: UserRecord) => {
    setAnalysisTarget({ scope, targetId, user });
  };
  const closeAnalysis = () => setAnalysisTarget(null);

  return (
    <DatasetContext.Provider
      value={{
        datasets,
        activeDataset,
        activeDatasetMeta,
        activeDatasetId,
        isLoadingDatasets,
        isLoadingActiveDataset,
        error,
        userMap,
        refreshDatasets,
        selectDataset,
        isGeneratorOpen,
        openGenerator,
        closeGenerator,
        analysisTarget,
        openAnalysis,
        closeAnalysis,
        latestAnalysisResult,
        setLatestAnalysisResult,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = (): DatasetContextType => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
};

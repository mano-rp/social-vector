import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { Button } from '../components/common/Button';
import { FileSearch, Activity } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const InvestigationsPage: React.FC = () => {
  const { activeDataset, openAnalysis } = useDataset();
  const navigate = useNavigate();
  const { datasetId } = useParams<{ datasetId: string }>();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Investigation Workspace
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Structured repository of discovered campaigns, evidence dossiers, actor clusters, and relationship graphs.
        </p>
      </div>

      <div className="p-8 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
          <FileSearch className="w-5 h-5" />
        </div>

        <div className="max-w-md mx-auto space-y-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No Active Investigations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Investigations and evidence dossiers will be populated when the SocialVector analysis engine completes evaluation on the active dataset.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="primary"
            icon={<Activity className="w-3.5 h-3.5" />}
            onClick={() => activeDataset && openAnalysis('dataset', activeDataset.metadata.dataset_id)}
          >
            Launch Analysis Workflow
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/datasets/${datasetId}/feed`)}
          >
            Return to Feed
          </Button>
        </div>
      </div>
    </div>
  );
};

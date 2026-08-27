import React, { useState } from 'react';
import { useDataset } from '../../context/DatasetContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { generateDataset } from '../../services/api';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DatasetGeneratorModal: React.FC = () => {
  const { isGeneratorOpen, closeGenerator, refreshDatasets, selectDataset } = useDataset();
  const navigate = useNavigate();

  const [scenario, setScenario] = useState('extreme_information_operation');
  const [contentProfile, setContentProfile] = useState<'standard' | 'realistic' | 'extreme'>('extreme');
  const [users, setUsers] = useState(250);
  const [postsPerUser, setPostsPerUser] = useState(4);
  const [seed, setSeed] = useState(2026);
  const [campaignRatio, setCampaignRatio] = useState(0.18);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ filename: string; datasetId: string; usersCount: number; postsCount: number } | null>(null);

  const isCoordinated = scenario.includes('coordinated') || scenario.includes('extreme') || scenario.includes('paraphrased');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);
    setGenerationStep('Invoking deterministic SocialVector generator...');

    try {
      setGenerationStep('Synthesizing personas and multi-sentence discourse...');
      const res = await generateDataset({
        scenario,
        content_profile: contentProfile,
        users: Number(users),
        posts_per_user: Number(postsPerUser),
        seed: Number(seed),
        campaign_ratio: isCoordinated ? Number(campaignRatio) : undefined,
      });

      setGenerationStep('Dataset successfully written. Auto-activating...');
      setSuccessInfo({
        filename: res.filename,
        datasetId: res.datasetId,
        usersCount: res.usersCount,
        postsCount: res.postsCount,
      });

      // Refresh list and select new dataset
      await refreshDatasets();
      await selectDataset(res.filename);

      setTimeout(() => {
        setIsGenerating(false);
        closeGenerator();
        setSuccessInfo(null);
        navigate(`/datasets/${res.id}/feed`);
      }, 1000);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate dataset');
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isGeneratorOpen}
      onClose={() => !isGenerating && closeGenerator()}
      title="Generate Synthetic Social Dataset"
      description="Configure deterministic generation parameters for synthetic social-media investigation."
      maxWidth="lg"
    >
      {isGenerating ? (
        <div className="py-8 text-center space-y-4">
          {successInfo ? (
            <div className="space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Dataset Generated</h3>
              <p className="text-xs text-slate-500 font-mono">
                {successInfo.usersCount} users · {successInfo.postsCount} posts &rarr; {successInfo.filename}
              </p>
              <p className="text-xs text-blue-600 dark:text-cyan-400 font-medium">Opening active feed...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-7 h-7 border-2 border-slate-200 dark:border-slate-800 border-t-slate-800 dark:border-t-cyan-400 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 font-mono">{generationStep}</p>
              <p className="text-[11px] text-slate-400">Deterministic PRNG execution in progress...</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Scenario Selection */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Generation Scenario
            </label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-800 dark:focus:ring-cyan-400"
            >
              <option value="extreme_information_operation">
                Extreme Geopolitical Information Operation (6 Stages)
              </option>
              <option value="coordinated_campaign">Coordinated Campaign (Overt Bursts)</option>
              <option value="paraphrased_coordination">Paraphrased Subtle Coordination</option>
              <option value="organic_activity">Organic Social Activity (Baseline)</option>
              <option value="organic_topical_similarity">Organic Topical Similarity (False-Positive Benchmark)</option>
            </select>
          </div>

          {/* Content Profile */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Content Profile (Post Length & Discourse Depth)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', title: 'Standard', desc: '1-2 sentence posts' },
                { id: 'realistic', title: 'Realistic', desc: 'Multi-sentence rich discourse' },
                { id: 'extreme', title: 'Extreme', desc: 'Multi-stage dramatic IO' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setContentProfile(p.id as any)}
                  className={`p-2.5 rounded-md border text-left transition-colors ${
                    contentProfile === p.id
                      ? 'border-slate-900 dark:border-cyan-400 bg-slate-100 dark:bg-cyan-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{p.title}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* User Count and Posts Per User */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Total Users
              </label>
              <input
                type="number"
                min="5"
                max="5000"
                value={users}
                onChange={(e) => setUsers(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Posts / User
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={postsPerUser}
                onChange={(e) => setPostsPerUser(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Random Seed & Campaign Ratio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Deterministic Seed
              </label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            {isCoordinated ? (
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Ratio ({Math.round(campaignRatio * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.01"
                  value={campaignRatio}
                  onChange={(e) => setCampaignRatio(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-slate-900 dark:accent-cyan-400"
                />
              </div>
            ) : (
              <div className="flex items-center text-[11px] text-slate-400 pt-5">
                <span>Scenario has no coordinated campaign actors.</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={closeGenerator}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<Plus className="w-3.5 h-3.5" />}>
              Generate Dataset
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

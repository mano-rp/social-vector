import React, { useState, useEffect } from 'react';
import { useDataset } from '../../context/DatasetContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Activity, Cpu, CheckCircle, Terminal } from 'lucide-react';

export const AnalysisModal: React.FC = () => {
  const { analysisTarget, closeAnalysis, activeDataset, activeDatasetMeta } = useDataset();
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    if (analysisTarget) {
      setStep(0);
    }
  }, [analysisTarget]);

  if (!analysisTarget) return null;

  const isFeed = analysisTarget.scope === 'feed';
  const targetUser = analysisTarget.user;

  const userPostCount = isFeed && targetUser && activeDataset
    ? activeDataset.posts.filter(p => p.author_id === targetUser.user_id).length
    : 0;

  const runAnalysisWorkflow = () => {
    setStep(1);

    setTimeout(() => {
      setStep(2);
    }, 700);

    setTimeout(() => {
      setStep(3);
    }, 1400);

    setTimeout(() => {
      setStep(4);
    }, 2100);
  };

  return (
    <Modal
      isOpen={!!analysisTarget}
      onClose={closeAnalysis}
      title={isFeed ? 'Feed Investigation Analysis' : 'Observation Dataset Analysis'}
      description={
        isFeed
          ? `Evaluating behavioral and content signals for user @${targetUser?.username || analysisTarget.targetId}`
          : `Evaluating multi-signal coordination across all ${activeDataset?.posts.length || 0} observations`
      }
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Scope Context Box */}
        <div className="p-3 rounded-md bg-slate-50 dark:bg-[#161d28] border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-slate-500 uppercase tracking-wider text-[10px]">
              Analysis Target
            </span>
            <Badge variant="info">
              {isFeed ? 'Individual User Feed' : 'Entire Observation Environment'}
            </Badge>
          </div>

          <div className="font-medium text-slate-800 dark:text-slate-200">
            {isFeed ? (
              <div>
                <span className="font-semibold">{targetUser?.display_name}</span>{' '}
                <span className="text-slate-500 font-mono">(@{targetUser?.username})</span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {userPostCount} observable posts · Created: {targetUser?.created_at ? new Date(targetUser.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ) : (
              <div>
                <span className="font-semibold">{activeDatasetMeta?.scenario.replace(/_/g, ' ')}</span>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  {activeDataset?.users.length} users · {activeDataset?.posts.length} posts · Seed {activeDatasetMeta?.seed}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signals Checked */}
        <div>
          <span className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Observation Signals in Scope
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Content & Topic Lexicons</span>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Diurnal & Burst Rhythms</span>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>Interaction & Network Topology</span>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span>Domain & URL Infrastructure</span>
            </div>
          </div>
        </div>

        {/* Multi-step execution progress / Honest Placeholder boundary */}
        {step > 0 && (
          <div className="p-3.5 rounded-md bg-slate-900 dark:bg-black text-slate-100 font-mono space-y-2 border border-slate-800 text-[11px]">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>SocialVector Analysis Interface Pipeline</span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-cyan-400' : 'text-slate-600'}`}>
                {step >= 1 ? <CheckCircle className="w-3 h-3 text-cyan-400" /> : <div className="w-3 h-3 rounded-full border border-slate-700" />}
                <span>1. Assembling observable post & user vectors...</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-cyan-400' : 'text-slate-600'}`}>
                {step >= 2 ? <CheckCircle className="w-3 h-3 text-cyan-400" /> : <div className="w-3 h-3 rounded-full border border-slate-700" />}
                <span>2. Extracting entity topology and temporal intervals...</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-cyan-400' : 'text-slate-600'}`}>
                {step >= 3 ? <CheckCircle className="w-3 h-3 text-cyan-400" /> : <div className="w-3 h-3 rounded-full border border-slate-700" />}
                <span>3. Connecting to analytical engine boundary...</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 4 ? 'text-emerald-400 font-semibold' : 'text-slate-600'}`}>
                {step >= 4 ? <Cpu className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-slate-700" />}
                <span>4. Analysis pipeline ready for analytical backend integration.</span>
              </div>
            </div>

            {step === 4 && (
              <div className="mt-3 p-2.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 space-y-1">
                <div className="font-semibold text-cyan-300">Phase 2 Interface Boundary Established</div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  The frontend analysis workflow is wired and ready. Actual detection intelligence, correlation clustering, and risk attribution will be executed by the analytical engine in the next development phase.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={closeAnalysis}>
            {step === 4 ? 'Close' : 'Cancel'}
          </Button>

          {step === 0 ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Activity className="w-3.5 h-3.5" />}
              onClick={runAnalysisWorkflow}
            >
              {isFeed ? 'Run Feed Analysis' : 'Run Dataset Analysis'}
            </Button>
          ) : (
            step === 4 && (
              <Button variant="secondary" size="sm" onClick={closeAnalysis}>
                Return to Exploration
              </Button>
            )
          )}
        </div>
      </div>
    </Modal>
  );
};

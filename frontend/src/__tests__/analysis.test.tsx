import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AnalysisModal } from '../components/analysis/AnalysisModal';
import { DatasetProvider, useDataset } from '../context/DatasetContext';

const AnalysisTrigger: React.FC = () => {
  const { openAnalysis } = useDataset();
  return (
    <div>
      <button onClick={() => openAnalysis('dataset', 'test_ds')}>
        Trigger Dataset Analysis
      </button>
      <button
        onClick={() =>
          openAnalysis('feed', 'usr_99', {
            user_id: 'usr_99',
            username: 'astroturf_01',
            display_name: 'Alex Thorne',
            bio: 'Investigative blogger',
            created_at: '2026-08-01T00:00:00Z',
            location: 'Asteria',
            metrics: { followers_count: 50, following_count: 200, posts_count: 12, listed_count: 0 },
            verified: false,
            profile_image_url: null,
            account_type: 'individual',
            language: 'en',
            device_client: 'Web',
            custom_attributes: {},
          })
        }
      >
        Trigger Feed Analysis
      </button>
      <AnalysisModal />
    </div>
  );
};

describe('Analysis Lab Workflow and Placeholder Boundary', () => {
  it('opens analysis modal and executes multi-step simulation', async () => {
    vi.useFakeTimers();

    render(
      <BrowserRouter>
        <DatasetProvider>
          <AnalysisTrigger />
        </DatasetProvider>
      </BrowserRouter>
    );

    // Click trigger
    fireEvent.click(screen.getByText('Trigger Dataset Analysis'));

    expect(screen.getByText('Observation Dataset Analysis')).toBeInTheDocument();
    expect(screen.getByText('Observation Signals in Scope')).toBeInTheDocument();

    // Click run analysis
    const runBtn = screen.getByText('Run Dataset Analysis');
    fireEvent.click(runBtn);

    // Fast-forward progress steps
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByText(/Extracting entity topology/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    // Final boundary statement
    expect(screen.getByText(/Phase 2 Interface Boundary Established/)).toBeInTheDocument();
    expect(screen.getByText('Return to Exploration')).toBeInTheDocument();

    vi.useRealTimers();
  });
});

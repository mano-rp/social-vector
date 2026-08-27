import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DatasetProvider, useDataset } from '../context/DatasetContext';
import { AnalysisModal } from '../components/analysis/AnalysisModal';

const AnalysisTriggerHarness: React.FC = () => {
  const { openAnalysis } = useDataset();

  return (
    <div>
      <button onClick={() => openAnalysis('dataset', 'test_ds')}>
        Launch Pipeline Modal
      </button>
      <AnalysisModal />
    </div>
  );
};

describe('Analytical Pipeline and Modal Integration', () => {
  it('renders analysis modal launcher and controls', () => {
    render(
      <BrowserRouter>
        <DatasetProvider>
          <AnalysisTriggerHarness />
        </DatasetProvider>
      </BrowserRouter>
    );

    const btn = screen.getByText('Launch Pipeline Modal');
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    expect(screen.getByText('Analytical Investigation Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Canonical Python Engine')).toBeInTheDocument();
  });
});

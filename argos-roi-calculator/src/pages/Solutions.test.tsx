import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Solutions } from './Solutions';
import { useAppStore } from '@/stores/app-store';

function renderSolutions() {
  return render(
    <MemoryRouter initialEntries={['/solutions']}>
      <Solutions />
    </MemoryRouter>,
  );
}

describe('Solutions page', () => {
  beforeEach(() => {
    document.title = '';
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  it('renders placeholder message indicating ready for configuration', () => {
    renderSolutions();

    expect(
      screen.getByText('Solutions module \u2014 ready for configuration'),
    ).toBeInTheDocument();
  });

  it('sets document title to "Solutions \u2014 ARGOS ROI Calculator"', () => {
    renderSolutions();

    expect(document.title).toBe('Solutions \u2014 ARGOS ROI Calculator');
  });
});

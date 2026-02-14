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
      excludedFromGlobal: new Set<string>(),
      deploymentMode: 'pilot',
      connectionType: 'ethernet',
      unsavedChanges: false,
    });
  });

  it('sets document title to "Solutions \u2014 ARGOS ROI Calculator"', () => {
    renderSolutions();

    expect(document.title).toBe('Solutions \u2014 ARGOS ROI Calculator');
  });

  it('renders page heading "Solutions"', () => {
    renderSolutions();

    expect(
      screen.getByRole('heading', { name: 'Solutions', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders DiagramControls with deployment mode toggle', () => {
    renderSolutions();

    expect(screen.getByRole('radiogroup', { name: 'Deployment mode' })).toBeInTheDocument();
  });

  it('renders ArchitectureDiagram component', () => {
    renderSolutions();

    // Empty state diagram
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});

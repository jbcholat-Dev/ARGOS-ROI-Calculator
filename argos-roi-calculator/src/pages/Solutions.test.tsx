import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Solutions } from './Solutions';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

function createTestAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: crypto.randomUUID(),
    name: 'Test Process',
    pumpType: 'A3004XN',
    pumpQuantity: 4,
    failureRateMode: 'percentage' as const,
    failureRatePercentage: 5,
    waferType: 'batch' as const,
    waferQuantity: 125,
    waferCost: 500,
    downtimeDuration: 8,
    downtimeCostPerHour: 1000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

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

  it('renders PreFilledContext within the page', () => {
    renderSolutions();

    expect(
      screen.getByRole('region', {
        name: 'Pre-filled context from ROI analyses',
      }),
    ).toBeInTheDocument();
  });

  it('shows pre-filled data when analyses exist', () => {
    useAppStore.setState({
      analyses: [
        createTestAnalysis({ name: 'Poly Etch', pumpQuantity: 8 }),
        createTestAnalysis({ name: 'Metal Dep', pumpQuantity: 12 }),
      ],
    });

    renderSolutions();

    // '20' appears in both PreFilledContext and DiagramControls
    const twentyElements = screen.getAllByText('20');
    expect(twentyElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('From ROI Analysis')).toBeInTheDocument();
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

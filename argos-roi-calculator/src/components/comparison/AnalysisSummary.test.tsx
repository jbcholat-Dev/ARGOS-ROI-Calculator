import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalysisSummary } from './AnalysisSummary';
import type { Analysis, GlobalParams } from '@/types';

const baseAnalysis: Analysis = {
  id: 'test-1',
  name: 'Poly Etch - Chamber 04',
  pumpType: 'A3004XN',
  pumpQuantity: 12,
  failureRateMode: 'percentage',
  failureRatePercentage: 3.0,
  waferType: 'batch',
  waferQuantity: 125,
  waferCost: 8000,
  downtimeDuration: 6,
  downtimeCostPerHour: 15000,
  detectionRate: 70,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const globalParams: GlobalParams = {
  detectionRate: 70,
  serviceCostPerPump: 2500,
};

describe('AnalysisSummary', () => {
  it('renders all field values as text', () => {
    render(<AnalysisSummary analysis={baseAnalysis} globalParams={globalParams} />);

    expect(screen.getByText('A3004XN')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3.0% (Percentage mode)')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('Batch')).toBeInTheDocument();
    expect(screen.getByText('125')).toBeInTheDocument();
    expect(screen.getByText('6h')).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    render(<AnalysisSummary analysis={baseAnalysis} globalParams={globalParams} />);

    // waferCost: 8000 → €8 000, downtimeCostPerHour: 15000 → €15 000
    const currencyValues = screen.getAllByText(/€/);
    expect(currencyValues.length).toBeGreaterThanOrEqual(2);
  });

  it('displays percentage formatting for failure rate', () => {
    render(<AnalysisSummary analysis={baseAnalysis} globalParams={globalParams} />);

    expect(screen.getByText('3.0% (Percentage mode)')).toBeInTheDocument();
  });

  it('displays absolute failure rate mode correctly', () => {
    const absoluteAnalysis: Analysis = {
      ...baseAnalysis,
      failureRateMode: 'absolute',
      absoluteFailureCount: 3,
      failureRatePercentage: 25.0,
    };

    render(<AnalysisSummary analysis={absoluteAnalysis} globalParams={globalParams} />);

    expect(screen.getByText('3 / 12 pumps = 25.0%')).toBeInTheDocument();
  });

  it('displays mono wafer type without wafers/batch', () => {
    const monoAnalysis: Analysis = {
      ...baseAnalysis,
      waferType: 'mono',
      waferQuantity: 1,
    };

    render(<AnalysisSummary analysis={monoAnalysis} globalParams={globalParams} />);

    expect(screen.getByText('Mono')).toBeInTheDocument();
    expect(screen.queryByText('Wafers/Batch')).not.toBeInTheDocument();
  });

  it('displays batch wafer type with wafers/batch', () => {
    render(<AnalysisSummary analysis={baseAnalysis} globalParams={globalParams} />);

    expect(screen.getByText('Batch')).toBeInTheDocument();
    expect(screen.getByText('Wafers/Batch')).toBeInTheDocument();
    expect(screen.getByText('125')).toBeInTheDocument();
  });

  it('displays detection rate', () => {
    render(<AnalysisSummary analysis={baseAnalysis} globalParams={globalParams} />);

    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('uses global detection rate when analysis detection rate is undefined', () => {
    const noDetectionAnalysis: Analysis = {
      ...baseAnalysis,
      detectionRate: undefined,
    };
    const customGlobalParams: GlobalParams = {
      ...globalParams,
      detectionRate: 85,
    };

    render(<AnalysisSummary analysis={noDetectionAnalysis} globalParams={customGlobalParams} />);

    expect(screen.getByText('85%')).toBeInTheDocument();
  });
});

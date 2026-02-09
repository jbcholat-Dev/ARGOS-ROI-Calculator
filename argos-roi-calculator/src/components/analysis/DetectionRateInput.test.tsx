/**
 * DetectionRateInput Tests
 * Story 2.9: Detection Rate Per Analysis
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DetectionRateInput } from './DetectionRateInput';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

describe('DetectionRateInput', () => {
  const mockAnalysisId = 'test-analysis-id';

  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: {
        detectionRate: 70,
        serviceCostPerPump: 2500,
      },
      unsavedChanges: false,
    });
  });

  const createAnalysisWithDetectionRate = (
    detectionRate?: number
  ): Analysis => ({
    id: mockAnalysisId,
    name: 'Test Analysis',
    pumpType: 'A3004XN',
    pumpQuantity: 2,
    failureRateMode: 'percentage',
    failureRatePercentage: 10,
    waferType: 'batch',
    waferQuantity: 125,
    waferCost: 5000,
    downtimeDuration: 4,
    downtimeCostPerHour: 1000,
    detectionRate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  describe('Rendering', () => {
    it('should render with label "Taux de Détection ARGOS (%)"', () => {
      const analysis = createAnalysisWithDetectionRate(70);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      expect(
        screen.getByLabelText('Taux de Détection ARGOS (%)')
      ).toBeInTheDocument();
    });

    it('should display helper text', () => {
      const analysis = createAnalysisWithDetectionRate(70);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      expect(
        screen.getByText(
          'Probabilité de détecter une panne avant qu\'elle ne se produise (défaut: 70%)'
        )
      ).toBeInTheDocument();
    });

    it('should display default value 70 when analysis has no detectionRate', () => {
      const analysis = createAnalysisWithDetectionRate(undefined);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      const input = screen.getByLabelText(
        'Taux de Détection ARGOS (%)'
      ) as HTMLInputElement;
      expect(input.value).toBe('70');
    });

    it('should display custom detectionRate if analysis has one (85%)', () => {
      const analysis = createAnalysisWithDetectionRate(85);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      const input = screen.getByLabelText(
        'Taux de Détection ARGOS (%)'
      ) as HTMLInputElement;
      expect(input.value).toBe('85');
    });

    it('should have input type number', () => {
      const analysis = createAnalysisWithDetectionRate(70);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      const input = screen.getByLabelText(
        'Taux de Détection ARGOS (%)'
      ) as HTMLInputElement;
      expect(input.type).toBe('number');
    });

    it('should have min=0 attribute', () => {
      const analysis = createAnalysisWithDetectionRate(70);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      const input = screen.getByLabelText(
        'Taux de Détection ARGOS (%)'
      ) as HTMLInputElement;
      expect(input.min).toBe('0');
    });

    it('should have max=100 attribute', () => {
      const analysis = createAnalysisWithDetectionRate(70);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      const input = screen.getByLabelText(
        'Taux de Détection ARGOS (%)'
      ) as HTMLInputElement;
      expect(input.max).toBe('100');
    });

    it('should return null if analysis not found', () => {
      // Don't add analysis to store

      const { container } = render(
        <DetectionRateInput analysisId={mockAnalysisId} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('User Interaction', () => {
    it('should update store via updateAnalysis on change', async () => {
      const user = userEvent.setup();
      const analysis = createAnalysisWithDetectionRate(70);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      const input = screen.getByLabelText('Taux de Détection ARGOS (%)');

      // Change to 85
      await user.clear(input);
      await user.type(input, '85');

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].detectionRate).toBe(85);
    });
  });

  describe('Validation', () => {
    it('should reject value < 0', async () => {
      const user = userEvent.setup();
      const analysis = createAnalysisWithDetectionRate(70);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      const input = screen.getByLabelText('Taux de Détection ARGOS (%)') as HTMLInputElement;

      // Try to set negative value
      await user.clear(input);
      await user.type(input, '-10');

      // Final value should NOT be updated to -10 (validation prevents it)
      // Note: Browser number input with min=0 prevents negative numbers
      // Intermediate digits may be accepted (e.g., typing "10" accepts 1, then 10)
      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].detectionRate).not.toBe(-10);
      // The browser constrains the input based on min/max attributes
      // so attempting to type "-10" results in browser-specific behavior
      expect(updatedState.analyses[0].detectionRate).toBeGreaterThanOrEqual(0);
    });

    it('should reject value > 100', async () => {
      const user = userEvent.setup();
      const analysis = createAnalysisWithDetectionRate(70);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      const input = screen.getByLabelText('Taux de Détection ARGOS (%)') as HTMLInputElement;

      // Try to set value > 100
      await user.clear(input);
      await user.type(input, '150');

      // Final value should NOT be 150 (validation prevents it)
      // Note: Intermediate digits are accepted (typing "150" accepts 1, then 15)
      // but the final invalid value 150 should be rejected
      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].detectionRate).not.toBe(150);
      // The browser constrains the input based on min/max attributes
      // Validation prevents values > 100 from being saved to store
      expect(updatedState.analyses[0].detectionRate).toBeLessThanOrEqual(100);
    });

    it('should accept value = 0 (boundary)', async () => {
      const user = userEvent.setup();
      const analysis = createAnalysisWithDetectionRate(70);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      const input = screen.getByLabelText('Taux de Détection ARGOS (%)');

      await user.clear(input);
      await user.type(input, '0');

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].detectionRate).toBe(0);
    });

    it('should accept value = 100 (boundary)', async () => {
      const user = userEvent.setup();
      const analysis = createAnalysisWithDetectionRate(70);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      const input = screen.getByLabelText('Taux de Détection ARGOS (%)');

      await user.clear(input);
      await user.type(input, '100');

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].detectionRate).toBe(100);
    });

    it('should accept value = 70 (typical)', async () => {
      const user = userEvent.setup();
      const analysis = createAnalysisWithDetectionRate(50);
      useAppStore.getState().addAnalysis(analysis);

      render(<DetectionRateInput analysisId={mockAnalysisId} />);

      const input = screen.getByLabelText('Taux de Détection ARGOS (%)');

      await user.clear(input);
      await user.type(input, '70');

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].detectionRate).toBe(70);
    });
  });
});

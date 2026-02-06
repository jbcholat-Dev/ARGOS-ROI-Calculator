import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentInputs } from './EquipmentInputs';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

const createTestAnalysis = (overrides?: Partial<Analysis>): Analysis => ({
  id: 'integration-test-1',
  name: 'Integration Test Analysis',
  pumpType: '',
  pumpQuantity: 0,
  failureRateMode: 'percentage',
  failureRatePercentage: 0,
  waferType: 'mono',
  waferQuantity: 1,
  waferCost: 0,
  downtimeDuration: 0,
  downtimeCostPerHour: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('EquipmentInputs Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [createTestAnalysis()],
      activeAnalysisId: 'integration-test-1',
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  it('complete happy path: enter pump type and quantity, verify store', async () => {
    const user = userEvent.setup();
    render(<EquipmentInputs analysisId="integration-test-1" />);

    // Step 1: Enter pump type
    const pumpTypeInput = screen.getByLabelText('Type de pompe');
    await user.type(pumpTypeInput, 'HiPace 700');

    // Verify store updated with pumpType
    expect(useAppStore.getState().analyses[0].pumpType).toBe('HiPace 700');

    // Step 2: Enter pump quantity
    const pumpQuantityInput = screen.getByLabelText('Nombre de pompes');
    await user.type(pumpQuantityInput, '8');

    // Verify store updated with pumpQuantity as number
    const analysis = useAppStore.getState().analyses[0];
    expect(analysis.pumpQuantity).toBe(8);
    expect(typeof analysis.pumpQuantity).toBe('number');

    // Verify no errors
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('validation flow: invalid → error → correct → error clears', async () => {
    const user = userEvent.setup();
    render(<EquipmentInputs analysisId="integration-test-1" />);

    const pumpQuantityInput = screen.getByLabelText('Nombre de pompes');

    // Step 1: Enter invalid value
    await user.type(pumpQuantityInput, '-5');
    expect(screen.getByText('Doit être un nombre positif')).toBeInTheDocument();

    // Step 2: Verify store NOT updated with invalid value
    expect(useAppStore.getState().analyses[0].pumpQuantity).toBe(0);

    // Step 3: Clear and enter valid value
    await user.clear(pumpQuantityInput);
    await user.type(pumpQuantityInput, '10');

    // Step 4: Verify error clears
    expect(screen.queryByText('Doit être un nombre positif')).not.toBeInTheDocument();

    // Step 5: Verify store updated
    expect(useAppStore.getState().analyses[0].pumpQuantity).toBe(10);
  });

  it('persistence flow: values persist across re-renders', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <EquipmentInputs analysisId="integration-test-1" />,
    );

    // Enter values
    await user.type(screen.getByLabelText('Type de pompe'), 'HiScrew');
    await user.type(screen.getByLabelText('Nombre de pompes'), '15');

    // Verify store state
    expect(useAppStore.getState().analyses[0].pumpType).toBe('HiScrew');
    expect(useAppStore.getState().analyses[0].pumpQuantity).toBe(15);

    // Unmount and re-render (simulates navigation away and back)
    unmount();
    render(<EquipmentInputs analysisId="integration-test-1" />);

    // Values should still be displayed from store
    expect(screen.getByLabelText('Type de pompe')).toHaveValue('HiScrew');
    expect(screen.getByLabelText('Nombre de pompes')).toHaveValue(15);
  });

  it('max boundary: entering exactly 1000 succeeds, 1001 fails', async () => {
    const user = userEvent.setup();
    render(<EquipmentInputs analysisId="integration-test-1" />);

    const input = screen.getByLabelText('Nombre de pompes');

    // Enter max valid value
    await user.type(input, '1000');
    expect(useAppStore.getState().analyses[0].pumpQuantity).toBe(1000);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Clear and enter 1001
    await user.clear(input);
    await user.type(input, '1001');
    expect(screen.getByText('Maximum 1000 pompes')).toBeInTheDocument();
  });
});

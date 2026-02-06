import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/stores/app-store';
import { validatePumpQuantity } from '@/lib/validation/equipment-validation';
import { PUMP_TYPE_SUGGESTIONS } from '@/lib/constants';

export interface EquipmentInputsProps {
  analysisId: string;
}

export function EquipmentInputs({ analysisId }: EquipmentInputsProps) {
  const analysis = useAppStore((state) =>
    state.analyses.find((a) => a.id === analysisId)
  );
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);

  const [quantityValue, setQuantityValue] = useState('');
  const [quantityError, setQuantityError] = useState<string | undefined>();

  // Sync local state from store on mount or when analysis changes externally
  useEffect(() => {
    if (analysis) {
      setQuantityValue(analysis.pumpQuantity === 0 ? '' : String(analysis.pumpQuantity));
      setQuantityError(undefined); // Clear stale errors from previous analysis
    }
  }, [analysis?.id]); // Only on analysis ID change (mount/navigation)

  if (!analysis) {
    return null;
  }

  const handlePumpTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAnalysis(analysisId, { pumpType: e.target.value });
  };

  const handlePumpQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantityValue(value);

    // Allow clearing the field
    if (value.trim() === '') {
      setQuantityError(undefined);
      updateAnalysis(analysisId, { pumpQuantity: 0 });
      return;
    }

    const result = validatePumpQuantity(value);

    if (result.isValid) {
      setQuantityError(undefined);
      updateAnalysis(analysisId, { pumpQuantity: parseInt(value, 10) });
    } else {
      setQuantityError(result.error);
    }
  };

  return (
    <section aria-label="Équipement">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Équipement
      </h2>
      <div className="flex flex-col gap-4">
        <Input
          label="Type de pompe"
          placeholder={`ex: ${PUMP_TYPE_SUGGESTIONS.join(', ')}`}
          value={analysis.pumpType}
          onChange={handlePumpTypeChange}
        />
        <Input
          label="Nombre de pompes"
          type="number"
          placeholder="ex: 8"
          value={quantityValue}
          onChange={handlePumpQuantityChange}
          error={quantityError}
          min={1}
          max={1000}
        />
      </div>
    </section>
  );
}

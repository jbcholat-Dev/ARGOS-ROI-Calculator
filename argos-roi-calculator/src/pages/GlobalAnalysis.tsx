import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlaceholderMessage } from '@/components/PlaceholderMessage';

export function GlobalAnalysis() {
  useEffect(() => {
    document.title = 'Global Analysis - ARGOS ROI Calculator';
  }, []);

  return (
    <AppLayout>
      <PlaceholderMessage message="Aucune analyse - créez-en d'abord" />
    </AppLayout>
  );
}

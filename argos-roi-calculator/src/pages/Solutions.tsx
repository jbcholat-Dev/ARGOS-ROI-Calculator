import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlaceholderMessage } from '@/components/PlaceholderMessage';

export function Solutions() {
  useEffect(() => {
    document.title = 'Solutions - ARGOS ROI Calculator';
  }, []);

  return (
    <AppLayout>
      <PlaceholderMessage message="Complétez vos analyses ROI d'abord" />
    </AppLayout>
  );
}

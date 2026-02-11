import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlaceholderMessage } from '@/components/PlaceholderMessage';

export function Solutions() {
  useEffect(() => {
    document.title = 'Solutions - ARGOS ROI Calculator';
  }, []);

  return (
    <AppLayout>
      <PlaceholderMessage message="Complete your ROI analyses first" />
    </AppLayout>
  );
}

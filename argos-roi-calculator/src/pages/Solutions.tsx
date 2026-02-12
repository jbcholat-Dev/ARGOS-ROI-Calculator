import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlaceholderMessage } from '@/components/PlaceholderMessage';

export function Solutions() {
  useEffect(() => {
    document.title = 'Solutions \u2014 ARGOS ROI Calculator';
  }, []);

  return (
    <AppLayout>
      <PlaceholderMessage message="Solutions module — ready for configuration" />
    </AppLayout>
  );
}

import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlaceholderMessage } from '@/components/PlaceholderMessage';

export function Dashboard() {
  useEffect(() => {
    document.title = 'Analyses - ARGOS ROI Calculator';
  }, []);

  return (
    <AppLayout>
      <PlaceholderMessage
        message="Créez votre première analyse"
        actionText="Nouvelle Analyse"
        onAction={() => {}}
      />
    </AppLayout>
  );
}

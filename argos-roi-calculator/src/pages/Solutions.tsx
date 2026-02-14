import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PreFilledContext, DiagramControls, ArchitectureDiagram } from '@/components/solutions';

export function Solutions() {
  useEffect(() => {
    document.title = 'Solutions \u2014 ARGOS ROI Calculator';
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Solutions</h1>
        <PreFilledContext />
        <DiagramControls />
        <ArchitectureDiagram />
      </div>
    </AppLayout>
  );
}

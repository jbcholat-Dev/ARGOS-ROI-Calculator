import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DiagramControls, ArchitectureDiagram } from '@/components/solutions';
import { ExportCompleteReportButton } from '@/components/pdf';

export function Solutions() {
  useEffect(() => {
    document.title = 'Solutions \u2014 ARGOS ROI Calculator';
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Solutions</h1>
          <ExportCompleteReportButton />
        </div>
        <DiagramControls />
        <ArchitectureDiagram />
      </div>
    </AppLayout>
  );
}

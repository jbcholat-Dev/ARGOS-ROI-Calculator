import { useEffect } from 'react';

export function GlobalAnalysis() {
  useEffect(() => {
    document.title = 'Global Analysis - ARGOS ROI Calculator';
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Global Analysis</h1>
      <p className="text-gray-600 mt-4">
        Placeholder for aggregated view. Will be implemented in Epic 4.
      </p>
    </main>
  );
}

import { useEffect } from 'react';

export function Dashboard() {
  useEffect(() => {
    document.title = 'Dashboard - ARGOS ROI Calculator';
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600 mt-4">
        Placeholder for analysis grid. Will be implemented in Epic 2.
      </p>
    </main>
  );
}

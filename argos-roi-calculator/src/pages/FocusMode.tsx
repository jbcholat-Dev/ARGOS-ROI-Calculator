import { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

// Validate analysis ID format (alphanumeric, dashes, max 100 chars)
const isValidAnalysisId = (id: string): boolean => {
  if (!id || id.length === 0 || id.length > 100) return false;
  // Allow alphanumeric, dashes, underscores (common ID formats)
  return /^[a-zA-Z0-9-_]+$/.test(id);
};

export function FocusMode() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id && isValidAnalysisId(id)) {
      document.title = `Analysis ${id} - ARGOS ROI Calculator`;
    }
  }, [id]);

  // Redirect to dashboard if ID is missing or invalid
  if (!id || !isValidAnalysisId(id)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Focus Mode</h1>
      <p className="text-gray-600 mt-4">Analysis ID: {id}</p>
      <p className="text-gray-500 mt-2">
        Placeholder for InputPanel and ResultsPanel. Will be implemented in
        Epic 2.
      </p>
      <Link
        to={ROUTES.DASHBOARD}
        className="inline-block mt-6 text-pfeiffer-red hover:text-pfeiffer-red-dark"
      >
        ← Back to Dashboard
      </Link>
    </main>
  );
}

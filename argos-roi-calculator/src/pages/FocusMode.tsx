import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlaceholderMessage } from '@/components/PlaceholderMessage';

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
    <AppLayout>
      <PlaceholderMessage message={`Mode Focus pour l'analyse ${id}`} />
    </AppLayout>
  );
}

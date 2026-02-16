import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SessionRecoveryModal } from '@/components/session/SessionRecoveryModal';
import { useAppStore } from '@/stores/app-store';
import { AppRoutes } from './AppRoutes';

/**
 * Check whether previous session data exists in localStorage.
 * Wrapped in try/catch for graceful degradation in private browsing.
 */
function hasPersistedData(): boolean {
  try {
    const data = localStorage.getItem('argos-roi-data');
    if (!data) return false;
    const parsed = JSON.parse(data);
    return parsed?.state?.analyses?.length > 0;
  } catch {
    return false;
  }
}

export function App() {
  const [showRecoveryModal, setShowRecoveryModal] = useState(() => hasPersistedData());
  const clearAllData = useAppStore((state) => state.clearAllData);

  const handleResume = () => {
    setShowRecoveryModal(false);
  };

  const handleStartNew = () => {
    clearAllData();
    setShowRecoveryModal(false);
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <SessionRecoveryModal
            isOpen={showRecoveryModal}
            onResume={handleResume}
            onStartNew={handleStartNew}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { NavigationBar } from './NavigationBar';
import { GlobalSidebar } from './GlobalSidebar';
import { FocusSidebar } from '@/components/navigation/FocusSidebar';
import { useAppStore } from '@/stores/app-store';
import { buildFocusModeRoute } from '@/lib/constants';

export interface AppLayoutProps {
  children: React.ReactNode;
}

function ConnectedFocusSidebar() {
  const navigate = useNavigate();
  const analyses = useAppStore((state) => state.analyses);
  const activeAnalysisId = useAppStore((state) => state.activeAnalysisId);
  const setActiveAnalysis = useAppStore((state) => state.setActiveAnalysis);

  const handleSelectAnalysis = useCallback(
    (id: string) => {
      setActiveAnalysis(id);
      navigate(buildFocusModeRoute(id));
    },
    [setActiveAnalysis, navigate]
  );

  return (
    <FocusSidebar
      analyses={analyses}
      activeAnalysisId={activeAnalysisId ?? ''}
      onSelectAnalysis={handleSelectAnalysis}
    />
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isFocusMode = location.pathname.startsWith('/analysis/');

  return (
    <div className="flex h-screen overflow-hidden">
      {isFocusMode ? <ConnectedFocusSidebar /> : <GlobalSidebar />}
      <div className="flex flex-col flex-1">
        <NavigationBar />
        <main
          aria-label="Main content"
          className="flex-1 p-6 overflow-y-auto bg-surface-canvas"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

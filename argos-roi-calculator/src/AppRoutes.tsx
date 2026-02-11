import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { Loading } from '@/components/Loading';

// Lazy load page components for code splitting (NFR-P5: page load <2s)
const Dashboard = lazy(() =>
  import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const FocusMode = lazy(() =>
  import('@/pages/FocusMode').then((m) => ({ default: m.FocusMode }))
);
const GlobalAnalysis = lazy(() =>
  import('@/pages/GlobalAnalysis').then((m) => ({ default: m.GlobalAnalysis }))
);
const Solutions = lazy(() =>
  import('@/pages/Solutions').then((m) => ({ default: m.Solutions }))
);
const ComparisonView = lazy(() =>
  import('@/pages/ComparisonView').then((m) => ({ default: m.ComparisonView }))
);
const NotFound = lazy(() =>
  import('@/pages/NotFound').then((m) => ({ default: m.NotFound }))
);

export function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.FOCUS_MODE} element={<FocusMode />} />
        <Route path={ROUTES.COMPARISON} element={<ComparisonView />} />
        <Route path={ROUTES.GLOBAL_ANALYSIS} element={<GlobalAnalysis />} />
        <Route path={ROUTES.SOLUTIONS} element={<Solutions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

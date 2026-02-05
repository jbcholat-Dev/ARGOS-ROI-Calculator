import { BrowserRouter as Router } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppRoutes } from './AppRoutes';

export function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

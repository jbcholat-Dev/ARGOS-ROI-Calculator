import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

export function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-canvas p-8">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-pfeiffer-red mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to={ROUTES.DASHBOARD}
          className="inline-block bg-pfeiffer-red text-white px-6 py-3 rounded hover:bg-pfeiffer-red-dark transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}

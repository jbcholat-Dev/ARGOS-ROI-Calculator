import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-surface-canvas p-8">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold text-pfeiffer-red mb-4">
              Something Went Wrong
            </h1>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Your data is safe.
            </p>
            {this.state.error && (
              <details className="text-left mb-6 p-4 bg-gray-100 rounded">
                <summary className="cursor-pointer font-semibold text-gray-700">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-4 justify-center">
              <Link
                to={ROUTES.DASHBOARD}
                className="inline-block bg-pfeiffer-red text-white px-6 py-3 rounded hover:bg-pfeiffer-red-dark transition-colors"
              >
                Return to Dashboard
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-block bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

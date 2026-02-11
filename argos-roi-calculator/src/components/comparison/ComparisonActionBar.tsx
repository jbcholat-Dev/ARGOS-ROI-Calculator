import { useEffect } from 'react';

export interface ComparisonActionBarProps {
  onSaveBoth: () => void;
  onDiscard: () => void;
  onReplaceOriginal: () => void;
}

export function ComparisonActionBar({ onSaveBoth, onDiscard, onReplaceOriginal }: ComparisonActionBarProps) {
  // Global Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Don't trigger discard when user is editing a form field
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        onDiscard();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onDiscard]);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <span className="text-lg font-semibold text-gray-900">Original Scenario</span>

      <div className="flex items-center gap-3">
        <button
          onClick={onDiscard}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          Discard What If
        </button>
        <button
          onClick={onReplaceOriginal}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          Replace Original
        </button>
        <button
          onClick={onSaveBoth}
          className="rounded-lg bg-pfeiffer-red px-4 py-2 text-sm font-medium text-white hover:bg-pfeiffer-red-dark transition-colors"
        >
          Save Both
        </button>
      </div>

      <span className="text-lg font-semibold text-gray-900">What If Scenario</span>
    </div>
  );
}

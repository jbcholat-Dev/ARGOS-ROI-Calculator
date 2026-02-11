import type { ReactNode } from 'react';

export interface ModifiedFieldHighlightProps {
  /** Direct boolean override — preferred for section-level comparison */
  isModified?: boolean;
  /** Original field value for simple value comparison */
  originalValue?: unknown;
  /** Current field value for simple value comparison */
  currentValue?: unknown;
  children: ReactNode;
}

export function ModifiedFieldHighlight({
  isModified: isModifiedProp,
  originalValue,
  currentValue,
  children,
}: ModifiedFieldHighlightProps) {
  const isModified = isModifiedProp ?? originalValue !== currentValue;

  return (
    <div
      data-testid={isModified ? 'modified-highlight' : undefined}
      className={isModified ? 'relative rounded-lg p-0.5' : undefined}
      style={
        isModified
          ? { border: '2px solid #FF5800', background: 'rgba(255, 88, 0, 0.05)' }
          : undefined
      }
    >
      {isModified && (
        <span
          className="absolute -top-2 right-2 bg-orange-500 text-white text-[10px] px-1 py-0.5 rounded font-medium"
          aria-label="Field modified from original value"
        >
          MODIFIED
        </span>
      )}
      {children}
    </div>
  );
}

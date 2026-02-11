import { DELTA_POSITIVE_COLOR, DELTA_NEGATIVE_COLOR, DELTA_NEUTRAL_COLOR } from '@/lib/constants';

export interface DeltaIndicatorProps {
  originalValue: number;
  whatIfValue: number;
  format: 'currency' | 'percentage';
  invertColor?: boolean;
}

function formatDeltaCurrency(delta: number): string {
  const abs = Math.abs(Math.round(delta));
  return `€${abs.toLocaleString('fr-FR')}`;
}

function formatDeltaPercentage(delta: number): string {
  return `${Math.abs(delta).toFixed(1)}%`;
}

export function DeltaIndicator({
  originalValue,
  whatIfValue,
  format,
  invertColor = false,
}: DeltaIndicatorProps) {
  const delta = whatIfValue - originalValue;

  if (delta === 0) {
    return (
      <span
        className="inline-flex items-center gap-1 text-sm font-medium"
        style={{ color: DELTA_NEUTRAL_COLOR }}
        aria-label={format === 'currency' ? 'No change in value' : 'No change in percentage'}
      >
        {'\u0394'} 0
      </span>
    );
  }

  const isPositive = delta > 0;
  const sign = isPositive ? '+' : '-';
  const arrow = isPositive ? '\u2191' : '\u2193';

  // Color logic: by default positive = green (good for savings/ROI)
  // When inverted (costs), positive = red (higher cost is bad)
  let color: string;
  if (invertColor) {
    color = isPositive ? DELTA_NEGATIVE_COLOR : DELTA_POSITIVE_COLOR;
  } else {
    color = isPositive ? DELTA_POSITIVE_COLOR : DELTA_NEGATIVE_COLOR;
  }

  const formattedDelta =
    format === 'currency'
      ? formatDeltaCurrency(delta)
      : formatDeltaPercentage(delta);

  // Build accessible label
  const direction = isPositive ? 'increased' : 'decreased';
  const formattedLabel =
    format === 'currency'
      ? `Value ${direction} by ${formatDeltaCurrency(delta)}`
      : `Value ${direction} by ${formatDeltaPercentage(delta).replace('%', ' percent')}`;

  return (
    <span
      className="inline-flex items-center gap-1 text-sm font-medium"
      style={{ color }}
      aria-label={formattedLabel}
    >
      {'\u0394'} {sign}{formattedDelta} {arrow}
    </span>
  );
}

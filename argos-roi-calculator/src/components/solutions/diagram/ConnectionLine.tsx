import type { ConnectionType } from '@/stores/app-store';

interface ConnectionLineProps {
  d: string;
  connectionType: ConnectionType;
  variant: 'pilot' | 'production' | 'cloud';
  animated?: boolean;
  label?: string;
  labelX?: number;
  labelY?: number;
}

const COLORS = {
  pilot: '#C88400',
  production: '#0097B8',
  cloud: '#1A6FD4',
};

const MARKER_IDS = {
  pilot: 'arrowAmber',
  production: 'arrowCyan',
  cloud: 'arrowBlue',
};

export function ConnectionLine({
  d,
  connectionType,
  variant,
  animated = false,
  label,
  labelX,
  labelY,
}: ConnectionLineProps) {
  const isWireless = connectionType === 'wifi';
  const color = COLORS[variant];
  const dashArray = isWireless ? '6 4' : undefined;
  const animClass = animated ? 'animate-[dash-flow_1.5s_linear_infinite]' : '';

  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeDasharray={dashArray}
        markerEnd={`url(#${MARKER_IDS[variant]})`}
        className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${animClass}`}
      />
      {label && labelX !== undefined && labelY !== undefined && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}
          className="fill-[#8B95A8]"
        >
          {label}
        </text>
      )}
    </>
  );
}

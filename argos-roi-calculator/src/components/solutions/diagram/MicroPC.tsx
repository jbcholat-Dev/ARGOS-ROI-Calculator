interface MicroPCProps {
  x: number;
  y: number;
  clusterIndex: number;
  pumpCount: number;
}

export function MicroPC({ x, y, clusterIndex, pumpCount }: MicroPCProps) {
  return (
    <g
      className="transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      transform={`translate(${x}, ${y})`}
      aria-label={`Micro-PC near tool cluster ${clusterIndex + 1}, ${pumpCount} pumps connected`}
    >
      <rect width={200} height={120} rx={10}
        className="fill-white stroke-[rgba(0,0,0,0.12)]" strokeWidth={1.5} />
      {/* Computer icon */}
      <g transform="translate(14, 14)">
        <rect x={0} y={0} width={26} height={18} rx={3}
          fill="none" stroke="#C88400" strokeWidth={1.3} />
        <line x1={5} y1={22} x2={21} y2={22}
          stroke="#C88400" strokeWidth={1.3} strokeLinecap="round" />
        <line x1={13} y1={18} x2={13} y2={22}
          stroke="#C88400" strokeWidth={1.3} />
      </g>
      <text x={50} y={26}
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600 }}
        className="fill-[#1A1D26]">
        Micro-PC
      </text>
      <text x={50} y={38}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        NEAR TOOL CLUSTER {clusterIndex + 1}
      </text>
      {/* MQTT badge */}
      <rect x={14} y={52} width={60} height={20} rx={4}
        className="fill-[rgba(0,148,106,0.08)] stroke-[rgba(0,148,106,0.25)]" strokeWidth={1} />
      <text x={22} y={65}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 600, letterSpacing: '0.05em' }}
        className="fill-[#00946A]">
        MQTT
      </text>
      <text x={84} y={65}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        LOCAL BROKER
      </text>
      <text x={14} y={96}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        {pumpCount} PUMPS CONNECTED
      </text>
    </g>
  );
}

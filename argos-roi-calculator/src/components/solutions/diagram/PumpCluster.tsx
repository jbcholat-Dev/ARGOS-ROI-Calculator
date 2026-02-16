interface PumpClusterProps {
  processName: string;
  model: string;
  quantity: number;
  x: number;
  y: number;
}

export function PumpCluster({ processName, model, quantity, x, y }: PumpClusterProps) {
  const height = 150;
  const pumpCount = Math.min(quantity, 4);

  return (
    <g transform={`translate(${x}, ${y})`} aria-label={`${processName} — ${quantity} ${model} pumps`}>
      <rect
        width={250}
        height={height}
        rx={10}
        className="fill-[#F0F1F4] stroke-[rgba(0,0,0,0.10)]"
        strokeWidth={1}
      />
      <g transform="translate(14, 18)" aria-hidden="true">
        {Array.from({ length: pumpCount }).map((_, i) => (
          <g key={i} transform={`translate(${i * 54}, 0)`}>
            {/* Pump body */}
            <rect x={0} y={16} width={44} height={56} rx={3}
              className="fill-[#F5F6F8] stroke-[rgba(0,0,0,0.10)]" strokeWidth={1} />
            {/* Impeller circle */}
            <circle cx={22} cy={38} r={10}
              className="fill-none stroke-[#8B95A8]" strokeWidth={1} />
            <line x1={16} y1={38} x2={28} y2={38}
              className="stroke-[#8B95A8]" strokeWidth={0.8} />
            <line x1={22} y1={32} x2={22} y2={44}
              className="stroke-[#8B95A8]" strokeWidth={0.8} />
            {/* ARGOS box */}
            <rect x={6} y={0} width={32} height={14} rx={2}
              fill="#2A2A2A" stroke="#CC0000" strokeWidth={1.2} />
            <rect x={8} y={2} width={12} height={10} rx={1}
              fill="white" opacity={0.2} />
            <circle cx={30} cy={7} r={2.5}
              fill="none" stroke="#CC0000" strokeWidth={0.8} opacity={0.7} />
          </g>
        ))}
      </g>
      <text x={14} y={height - 42}
        className="fill-[#1A1D26]"
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700 }}>
        {quantity}
        <tspan dx={4}
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 400 }}
          className="fill-[#5A6478]">
          pumps
        </tspan>
      </text>
      <text x={14} y={height - 26}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 400 }}
        className="fill-[#5A6478]">
        {model}
      </text>
      <text x={14} y={height - 12}
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600 }}
        className="fill-[#1A1D26]">
        {processName}
      </text>
    </g>
  );
}

interface ManualSyncProps {
  x: number;
  y: number;
}

export function ManualSync({ x, y }: ManualSyncProps) {
  return (
    <g
      className="transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      transform={`translate(${x}, ${y})`}
      aria-label="Manual daily data retrieval by on-site team"
    >
      <rect x={0} y={0} width={170} height={110} rx={10}
        className="fill-[#F7F8FA]" stroke="rgba(200,132,0,0.20)" strokeWidth={1} />
      {/* Person icon */}
      <g transform="translate(16, 14)">
        <circle cx={10} cy={5} r={5} fill="none" stroke="#C88400" strokeWidth={1.3} />
        <path d="M0,20 C0,13 20,13 20,20" fill="none" stroke="#C88400" strokeWidth={1.3} />
      </g>
      {/* USB icon */}
      <g transform="translate(48, 16)">
        <rect x={0} y={0} width={14} height={18} rx={2}
          fill="none" stroke="#C88400" strokeWidth={1} />
        <rect x={3} y={0} width={8} height={4} rx={1}
          fill="#C88400" opacity={0.3} />
      </g>
      <text x={16} y={50}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 500, letterSpacing: '0.04em' }}
        className="fill-[#C88400]">
        Manual Retrieval
      </text>
      <text x={16} y={64}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        DAILY BY ON-SITE TEAM
      </text>
      <text x={16} y={78}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        USB / PORTABLE DEVICE
      </text>
      {/* Deployment badge */}
      <rect x={16} y={88} width={138} height={14} rx={3}
        fill="rgba(200,132,0,0.06)" stroke="rgba(200,132,0,0.12)" strokeWidth={0.8} />
      <text x={26} y={98}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, fontWeight: 600, letterSpacing: '0.04em' }}
        className="fill-[#C88400]">
        DEPLOYMENT: 2-3 DAYS
      </text>
    </g>
  );
}

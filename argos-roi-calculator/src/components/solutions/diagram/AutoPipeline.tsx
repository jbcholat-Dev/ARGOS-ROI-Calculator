interface AutoPipelineProps {
  x: number;
  y: number;
}

export function AutoPipeline({ x, y }: AutoPipelineProps) {
  return (
    <g
      className="transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      transform={`translate(${x}, ${y})`}
      aria-label="Automated data pipeline, every 15 minutes"
    >
      <rect x={0} y={0} width={170} height={110} rx={10}
        className="fill-[#F7F8FA]" stroke="rgba(0,151,184,0.20)" strokeWidth={1} />
      {/* Sync/cycle icon */}
      <g transform="translate(16, 12)">
        <path d="M20,4 A10,10 0 0,1 20,24" fill="none" stroke="#0097B8"
          strokeWidth={1.5} strokeLinecap="round" />
        <path d="M17,5 L20,2 L23,5" fill="none" stroke="#0097B8"
          strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20,24 A10,10 0 0,1 20,4" fill="none" stroke="#0097B8"
          strokeWidth={1.5} strokeLinecap="round" />
        <path d="M23,23 L20,26 L17,23" fill="none" stroke="#0097B8"
          strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={20} cy={14} r={3} fill="#0097B8" opacity={0.2} />
        <circle cx={20} cy={14} r={1.5} fill="#0097B8" opacity={0.4} />
      </g>
      <text x={16} y={50}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 500, letterSpacing: '0.04em' }}
        className="fill-[#0097B8]">
        Auto Pipeline
      </text>
      <text x={16} y={64}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        EVERY 15 MINUTES
      </text>
      <text x={16} y={78}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        TLS ENCRYPTED TRANSFER
      </text>
      {/* Deployment badge */}
      <rect x={16} y={88} width={138} height={14} rx={3}
        fill="rgba(0,151,184,0.06)" stroke="rgba(0,151,184,0.12)" strokeWidth={0.8} />
      <text x={26} y={98}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, fontWeight: 600, letterSpacing: '0.04em' }}
        className="fill-[#0097B8]">
        AUTOMATED &#x2022; NO HUMAN NEEDED
      </text>
    </g>
  );
}

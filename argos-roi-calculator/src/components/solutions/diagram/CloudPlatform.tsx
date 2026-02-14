interface CloudPlatformProps {
  x: number;
  y: number;
}

export function CloudPlatform({ x, y }: CloudPlatformProps) {
  return (
    <g transform={`translate(${x}, ${y})`} aria-label="ARGOS Cloud platform with prediction models">
      <rect width={440} height={310} rx={14}
        fill="rgba(26,111,212,0.03)" stroke="rgba(26,111,212,0.15)" strokeWidth={1.5} />
      {/* Cloud icon */}
      <g transform="translate(20, 20)">
        <path d="M7,24 C-2,24 -2,14 5,12 C3,3 15,0 20,7 C27,2 36,7 34,14 C43,14 43,24 34,24 Z"
          fill="none" stroke="#1A6FD4" strokeWidth={1.3} opacity={0.4} />
      </g>
      <text x={68} y={36}
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700 }}
        className="fill-[#1A6FD4]">
        ARGOS Cloud
      </text>
      <text x={68} y={50}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}
        className="fill-[#8B95A8]">
        PFEIFFER VACUUM SaaS PLATFORM
      </text>
      {/* Prediction Models */}
      <rect x={20} y={70} width={400} height={70} rx={8}
        fill="rgba(26,111,212,0.03)" stroke="rgba(26,111,212,0.10)" strokeWidth={1} />
      <g transform="translate(34, 84)">
        <circle cx={10} cy={10} r={9} fill="none" stroke="#1A6FD4" strokeWidth={1} opacity={0.4} />
        <path d="M6,7 Q10,3 14,7 M6,10 L14,10 M6,13 Q10,17 14,13"
          fill="none" stroke="#1A6FD4" strokeWidth={1} />
      </g>
      <text x={62} y={96}
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600 }}
        className="fill-[#1A6FD4]">
        Prediction Models
      </text>
      <text x={62} y={110}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}
        className="fill-[#8B95A8]">
        AI/ML ANOMALY DETECTION
      </text>
      <text x={62} y={124}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        {'Vibration \u2022 Temperature \u2022 Power consumption'}
      </text>
      {/* Alert Engine */}
      <rect x={20} y={156} width={400} height={46} rx={7}
        fill="rgba(204,0,0,0.02)" stroke="rgba(204,0,0,0.08)" strokeWidth={1} />
      <g transform="translate(34, 168)">
        <path d="M8,0 L16,14 L0,14 Z" fill="none" stroke="#CC0000" strokeWidth={1} opacity={0.4} />
        <line x1={8} y1={5} x2={8} y2={9} stroke="#CC0000" strokeWidth={1.2} strokeLinecap="round" />
        <circle cx={8} cy={11.5} r={0.8} fill="#CC0000" />
      </g>
      <text x={58} y={182}
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 500, opacity: 0.8 }}
        className="fill-[#CC0000]">
        Alert Engine
      </text>
      <text x={58} y={194}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        PREDICTIVE MAINTENANCE NOTIFICATIONS
      </text>
      {/* Predictive Maintenance Output */}
      <rect x={20} y={218} width={400} height={52} rx={7}
        fill="rgba(0,148,106,0.03)" stroke="rgba(0,148,106,0.10)" strokeWidth={1} />
      <g transform="translate(34, 232)">
        <circle cx={8} cy={8} r={7} fill="none" stroke="#00946A" strokeWidth={1} opacity={0.4} />
        <path d="M4,8 L7,11 L12,5" fill="none" stroke="#00946A"
          strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x={56} y={246}
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 500, opacity: 0.9 }}
        className="fill-[#00946A]">
        Predictive Maintenance Output
      </text>
      <text x={56} y={260}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        {'ANOMALY SCORE \u2022 RECOMMENDED ACTIONS'}
      </text>
      {/* Footer */}
      <text x={20} y={290}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, fontWeight: 400, letterSpacing: '0.08em', opacity: 0.5 }}
        className="fill-[#8B95A8]">
        {'PFEIFFER VACUUM \u2022 DIGITAL SERVICES \u2022 ARGOS PLATFORM'}
      </text>
    </g>
  );
}

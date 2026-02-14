interface CentralServerProps {
  x: number;
  y: number;
  totalPumps: number;
  processCount: number;
}

export function CentralServer({ x, y, totalPumps, processCount }: CentralServerProps) {
  return (
    <g
      className="transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      transform={`translate(${x}, ${y})`}
      aria-label={`Central on-premise server, ${totalPumps} pumps, ${processCount} processes`}
    >
      <rect width={220} height={360} rx={10}
        className="fill-white" stroke="rgba(0,151,184,0.25)" strokeWidth={1.5} />
      {/* Server rack icon */}
      <g transform="translate(14, 16)">
        {[0, 14, 28].map((dy) => (
          <g key={dy}>
            <rect x={0} y={dy} width={30} height={10} rx={2}
              fill="none" stroke="#0097B8" strokeWidth={1.3} />
            <circle cx={5} cy={dy + 5} r={1.5} fill="#0097B8" />
          </g>
        ))}
      </g>
      <text x={54} y={28}
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600 }}
        className="fill-[#1A1D26]">
        Central Server
      </text>
      <text x={54} y={42}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        ON-PREMISE DATA CENTER
      </text>
      {/* MQTT broker badge */}
      <rect x={14} y={68} width={76} height={20} rx={4}
        className="fill-[rgba(0,148,106,0.08)] stroke-[rgba(0,148,106,0.25)]" strokeWidth={1} />
      <text x={22} y={82}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 600, letterSpacing: '0.05em' }}
        className="fill-[#00946A]">
        MQTT BROKER
      </text>
      {/* VMs */}
      <text x={14} y={112}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        VIRTUAL MACHINES
      </text>
      {[{ y: 118, name: 'VM-ARGOS-01', label: 'VLAN' }, { y: 150, name: 'VM-ARGOS-02', label: 'BACKUP' }].map((vm) => (
        <g key={vm.name}>
          <rect x={14} y={vm.y} width={192} height={26} rx={4}
            fill="rgba(0,151,184,0.04)" stroke="rgba(0,151,184,0.12)" strokeWidth={1} />
          <text x={24} y={vm.y + 16}
            style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 500 }}
            className="fill-[#0097B8]">
            {vm.name}
          </text>
          <text x={120} y={vm.y + 16}
            style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
            className="fill-[#8B95A8]">
            {vm.label}
          </text>
        </g>
      ))}
      {/* Network integration */}
      <text x={14} y={200}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        NETWORK INTEGRATION
      </text>
      <rect x={14} y={206} width={192} height={26} rx={4}
        fill="rgba(204,0,0,0.03)" stroke="rgba(204,0,0,0.10)" strokeWidth={1} />
      <text x={40} y={222}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 500, opacity: 0.7 }}
        className="fill-[#CC0000]">
        Firewall Rules
      </text>
      <text x={130} y={222}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        PORT 8883
      </text>
      {/* Client IT validation */}
      <rect x={14} y={240} width={192} height={26} rx={4}
        fill="rgba(0,0,0,0.02)" className="stroke-[rgba(0,0,0,0.10)]" strokeWidth={1} />
      <text x={24} y={256}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#5A6478]">
        CLIENT IT VALIDATION
      </text>
      <text x={150} y={256}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        REQUIRED
      </text>
      {/* Stats */}
      <line x1={14} y1={284} x2={206} y2={284} className="stroke-[rgba(0,0,0,0.06)]" strokeWidth={1} />
      <text x={14} y={302}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        {totalPumps} PUMPS &#x2022; {processCount} PROCESSES
      </text>
      <text x={14} y={318}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em' }}
        className="fill-[#8B95A8]">
        AUTOMATED DATA COLLECTION
      </text>
      {/* Deployment timeline */}
      <rect x={14} y={334} width={192} height={18} rx={3}
        fill="rgba(0,151,184,0.06)" stroke="rgba(0,151,184,0.12)" strokeWidth={0.8} />
      <text x={24} y={346}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 600, letterSpacing: '0.04em' }}
        className="fill-[#0097B8]">
        DEPLOYMENT: 3-6 MONTHS (IT APPROVAL)
      </text>
    </g>
  );
}

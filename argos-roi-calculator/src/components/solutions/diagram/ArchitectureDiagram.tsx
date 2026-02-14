import { useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { PumpCluster } from './PumpCluster';
import { MicroPC } from './MicroPC';
import { CentralServer } from './CentralServer';
import { CloudPlatform } from './CloudPlatform';
import { ManualSync } from './ManualSync';
import { AutoPipeline } from './AutoPipeline';
import { ConnectionLine } from './ConnectionLine';
import { usePumpStats } from './usePumpStats';

const CONNECTION_TYPE_LABELS: Record<string, string> = {
  rs485: 'RS-485',
  ethernet: 'Ethernet',
  wifi: 'WiFi',
};

export function ArchitectureDiagram() {
  const analyses = useAppStore((state) => state.analyses);
  const deploymentMode = useAppStore((state) => state.deploymentMode);
  const connectionType = useAppStore((state) => state.connectionType);
  const { pumpModelClusters, totalPumps } = usePumpStats();

  const isPilot = deploymentMode === 'pilot';
  const connLabel = CONNECTION_TYPE_LABELS[connectionType] || connectionType;
  const isEmpty = pumpModelClusters.length === 0;

  // Layout: compute vertical positions for pump clusters
  const clusterPositions = useMemo(() => {
    if (isEmpty) return [];
    const startY = 50;
    const gap = 170;
    return pumpModelClusters.map((_, i) => ({
      y: startY + i * gap,
      height: 150,
    }));
  }, [pumpModelClusters, isEmpty]);

  // SVG viewBox height: dynamic based on cluster count
  const svgHeight = isEmpty ? 200 : Math.max(590, 50 + pumpModelClusters.length * 170 + 80);

  const diagramAriaLabel = isEmpty
    ? 'Architecture diagram — no analyses configured'
    : `ARGOS ${isPilot ? 'Pilot' : 'Production'} architecture with ${totalPumps} pumps across ${pumpModelClusters.length} model${pumpModelClusters.length > 1 ? 's' : ''}`;

  if (isEmpty) {
    return (
      <div
        className="flex min-h-[200px] items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm"
        role="img"
        aria-label={diagramAriaLabel}
      >
        <p className="text-sm text-gray-500">
          Add ROI analyses to see your deployment architecture
        </p>
      </div>
    );
  }

  // Middleware X positions
  const microPcX = 370;
  const serverX = 400;
  const syncX = 670;
  const cloudX = 930;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      aria-live="polite"
    >
      <svg
        className="block w-full"
        viewBox={`0 0 1400 ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={diagramAriaLabel}
      >
        <defs>
          <marker id="arrowAmber" markerWidth={7} markerHeight={5} refX={7} refY={2.5} orient="auto">
            <path d="M0,0 L7,2.5 L0,5" fill="none" stroke="#C88400" strokeWidth={1} />
          </marker>
          <marker id="arrowCyan" markerWidth={7} markerHeight={5} refX={7} refY={2.5} orient="auto">
            <path d="M0,0 L7,2.5 L0,5" fill="none" stroke="#0097B8" strokeWidth={1} />
          </marker>
          <marker id="arrowBlue" markerWidth={7} markerHeight={5} refX={7} refY={2.5} orient="auto">
            <path d="M0,0 L7,2.5 L0,5" fill="none" stroke="#1A6FD4" strokeWidth={1} />
          </marker>
        </defs>

        {/* Zone labels */}
        <text x={36} y={30}
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}
          className="fill-[#8B95A8]">
          SUB-FAB ENVIRONMENT
        </text>
        <text x={370} y={30}
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}
          className="fill-[#8B95A8]">
          INFRASTRUCTURE
        </text>
        <text x={670} y={30}
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}
          className="fill-[#8B95A8]">
          DATA TRANSFER
        </text>
        <text x={940} y={30}
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}
          className="fill-[#8B95A8]">
          CLOUD PLATFORM
        </text>

        {/* Pump clusters */}
        {pumpModelClusters.map((cluster, i) => (
          <PumpCluster
            key={cluster.model}
            model={cluster.model}
            quantity={cluster.quantity}
            x={36}
            y={clusterPositions[i].y}
            height={clusterPositions[i].height}
          />
        ))}

        {/* Connection lines: Pumps → Middleware */}
        {clusterPositions.map((pos, i) => {
          const pumpCenterY = pos.y + pos.height / 2;
          const targetY = isPilot ? pos.y + 60 : 50 + 180 * ((i + 0.5) / pumpModelClusters.length);
          const targetX = isPilot ? microPcX : serverX;

          return (
            <g key={`conn-${i}`}>
              {/* Pilot connection */}
              <g className={`transition-opacity duration-500 ${isPilot ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <ConnectionLine
                  d={`M 286,${pumpCenterY} L ${targetX},${pos.y + 60}`}
                  connectionType={connectionType}
                  variant="pilot"
                  label={connLabel}
                  labelX={328}
                  labelY={pumpCenterY - 10}
                />
              </g>
              {/* Production connection */}
              <g className={`transition-opacity duration-500 ${!isPilot ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <ConnectionLine
                  d={`M 286,${pumpCenterY} C 340,${pumpCenterY} 370,${targetY} ${serverX},${targetY}`}
                  connectionType={connectionType}
                  variant="production"
                  label={connLabel}
                  labelX={335}
                  labelY={pumpCenterY - 10}
                />
              </g>
            </g>
          );
        })}

        {/* PILOT: Micro-PCs */}
        <g className={`transition-opacity duration-500 ${isPilot ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {pumpModelClusters.map((cluster, i) => (
            <MicroPC
              key={`micropc-${cluster.model}`}
              x={microPcX}
              y={clusterPositions[i].y}
              clusterIndex={i}
              pumpCount={cluster.quantity}
            />
          ))}
        </g>

        {/* PRODUCTION: Central Server */}
        <g className={`transition-opacity duration-500 ${!isPilot ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <CentralServer
            x={serverX}
            y={50}
            totalPumps={totalPumps}
            processCount={analyses.length}
          />
        </g>

        {/* PILOT: Micro-PCs → Manual Sync */}
        <g className={`transition-opacity duration-500 ${isPilot ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {clusterPositions.map((pos, i) => {
            const microPcCenterY = pos.y + 60;
            return (
              <ConnectionLine
                key={`sync-conn-${i}`}
                d={`M 570,${microPcCenterY} C 620,${microPcCenterY} 640,${syncX > 600 ? 255 : microPcCenterY} 670,255`}
                connectionType={connectionType}
                variant="pilot"
                animated
              />
            );
          })}
          <ManualSync x={syncX} y={200} />
          {/* Manual Sync → Cloud */}
          <ConnectionLine
            d="M 840,255 C 880,255 900,255 930,255"
            connectionType={connectionType}
            variant="cloud"
            animated
          />
        </g>

        {/* PRODUCTION: Server → Auto Pipeline → Cloud */}
        <g className={`transition-opacity duration-500 ${!isPilot ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <ConnectionLine
            d="M 620,260 C 650,260 660,260 670,260"
            connectionType={connectionType}
            variant="production"
            animated
          />
          <AutoPipeline x={syncX} y={200} />
          <ConnectionLine
            d="M 840,255 C 880,255 900,240 930,230"
            connectionType={connectionType}
            variant="cloud"
            animated
          />
        </g>

        {/* Cloud Platform (fixed component) */}
        <CloudPlatform x={cloudX} y={50} />

        {/* Deployment speed badges */}
        <g className={`transition-opacity duration-500 ${isPilot ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <g transform={`translate(${microPcX}, ${svgHeight - 66})`}>
            <rect x={0} y={0} width={200} height={50} rx={7}
              fill="rgba(200,132,0,0.05)" stroke="rgba(200,132,0,0.15)" strokeWidth={1} />
            <text x={14} y={18}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 500, letterSpacing: '0.06em' }}
              className="fill-[#C88400]">
              TOTAL DEPLOYMENT
            </text>
            <text x={14} y={38}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700 }}
              className="fill-[#C88400]">
              2-3 days
            </text>
            <text x={110} y={38}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 400, letterSpacing: '0.04em', opacity: 0.6 }}
              className="fill-[#C88400]">
              NO IT NEEDED
            </text>
          </g>
        </g>

        <g className={`transition-opacity duration-500 ${!isPilot ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <g transform={`translate(${syncX}, 340)`}>
            <rect x={0} y={0} width={170} height={50} rx={7}
              fill="rgba(0,151,184,0.05)" stroke="rgba(0,151,184,0.15)" strokeWidth={1} />
            <text x={14} y={18}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fontWeight: 500, letterSpacing: '0.06em' }}
              className="fill-[#0097B8]">
              TOTAL DEPLOYMENT
            </text>
            <text x={14} y={38}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700 }}
              className="fill-[#0097B8]">
              3-6 months
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}

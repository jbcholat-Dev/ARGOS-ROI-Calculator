import { useAppStore } from '@/stores/app-store';
import type { DeploymentMode, ConnectionType } from '@/stores/app-store';
import { usePumpStats } from './usePumpStats';

const CONNECTION_LABELS: Record<ConnectionType, string> = {
  rs485: 'RS-485 (Wired)',
  ethernet: 'Ethernet (Wired)',
  wifi: 'WiFi (Wireless)',
};

export function DiagramControls() {
  const deploymentMode = useAppStore((state) => state.deploymentMode);
  const connectionType = useAppStore((state) => state.connectionType);
  const setDeploymentMode = useAppStore((state) => state.setDeploymentMode);
  const setConnectionType = useAppStore((state) => state.setConnectionType);
  const { totalPumps, modelCount, processCount } = usePumpStats();

  const handleToggle = (mode: DeploymentMode) => {
    setDeploymentMode(mode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setDeploymentMode(deploymentMode === 'pilot' ? 'production' : 'pilot');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-gray-100 bg-white p-3 px-5 shadow-sm">
      {/* Deployment toggle */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-medium uppercase tracking-widest text-gray-400"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Deployment
        </span>
        <div
          className="relative flex gap-0.5 rounded-[10px] border border-gray-200 bg-gray-100 p-[3px]"
          role="radiogroup"
          aria-label="Deployment mode"
        >
          {/* Sliding background */}
          <div
            className={`absolute top-[3px] h-[calc(100%-6px)] rounded-[7px] transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              deploymentMode === 'pilot'
                ? 'left-[3px] w-[68px] bg-gradient-to-br from-[#E09000] to-[#C07800] shadow-[0_2px_8px_rgba(200,132,0,0.12)]'
                : 'left-[73px] w-[90px] bg-gradient-to-br from-[#0097B8] to-[#007A96] shadow-[0_2px_8px_rgba(0,151,184,0.12)]'
            }`}
          />
          <button
            type="button"
            role="radio"
            aria-checked={deploymentMode === 'pilot'}
            tabIndex={deploymentMode === 'pilot' ? 0 : -1}
            className={`relative z-10 rounded-[7px] px-4 py-[7px] text-xs font-medium transition-colors duration-200 ${
              deploymentMode === 'pilot' ? 'text-white' : 'text-gray-400 hover:text-gray-500'
            }`}
            onClick={() => handleToggle('pilot')}
            onKeyDown={handleKeyDown}
          >
            Pilot
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={deploymentMode === 'production'}
            tabIndex={deploymentMode === 'production' ? 0 : -1}
            className={`relative z-10 rounded-[7px] px-4 py-[7px] text-xs font-medium transition-colors duration-200 ${
              deploymentMode === 'production' ? 'text-white' : 'text-gray-400 hover:text-gray-500'
            }`}
            onClick={() => handleToggle('production')}
            onKeyDown={handleKeyDown}
          >
            Production
          </button>
        </div>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200" />

      {/* Connection type dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-medium uppercase tracking-widest text-gray-400"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Connection
        </span>
        <select
          value={connectionType}
          onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
          aria-label="Connection type"
          className="rounded-[10px] border border-gray-200 bg-gray-100 px-3 py-[7px] text-xs font-medium text-gray-900 outline-none transition-colors hover:border-red-200 focus:border-red-300"
        >
          {(Object.entries(CONNECTION_LABELS) as [ConnectionType, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200" />

      {/* Inline stats */}
      <div className="flex items-center gap-1">
        <span className="text-[9px] font-medium uppercase tracking-widest text-gray-400"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Pumps
        </span>
        <span className="text-base font-bold text-gray-900">{totalPumps}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[9px] font-medium uppercase tracking-widest text-gray-400"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Models
        </span>
        <span className="text-base font-bold text-gray-900">{modelCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[9px] font-medium uppercase tracking-widest text-gray-400"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Processes
        </span>
        <span className="text-base font-bold text-gray-900">{processCount}</span>
      </div>

      {/* Mode badge */}
      <div className={`ml-auto flex items-center gap-[7px] rounded-full px-3 py-[5px] text-[10px] font-medium tracking-wide ${
        deploymentMode === 'pilot'
          ? 'border border-[rgba(200,132,0,0.20)] bg-[rgba(200,132,0,0.08)] text-[#C88400]'
          : 'border border-[rgba(0,151,184,0.20)] bg-[rgba(0,151,184,0.08)] text-[#0097B8]'
      }`}
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        <div className={`h-[5px] w-[5px] animate-pulse rounded-full ${
          deploymentMode === 'pilot' ? 'bg-[#C88400]' : 'bg-[#0097B8]'
        }`} />
        {deploymentMode === 'pilot' ? 'Pilot Mode \u2014 Operational Day 1' : 'Production Mode \u2014 Full Integration'}
      </div>
    </div>
  );
}

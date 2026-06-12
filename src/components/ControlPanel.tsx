import { PhysicsSettings } from '../types';
import { Play, Pause, RotateCcw, Crosshair, Sparkles, Orbit, Trash2, Sliders, ToggleLeft, ToggleRight } from 'lucide-react';

interface ControlPanelProps {
  settings: PhysicsSettings;
  setSettings: (updater: (prev: PhysicsSettings) => PhysicsSettings) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  onClearParticles: () => void;
  onInjectPhotonBeam: () => void;
  onInjectProbe: () => void;
  onInjectMatterCluster: () => void;
  activeView: 'orbits' | 'lens';
  setActiveView: (view: 'orbits' | 'lens') => void;
}

export default function ControlPanel({
  settings,
  setSettings,
  isPaused,
  setIsPaused,
  onClearParticles,
  onInjectPhotonBeam,
  onInjectProbe,
  onInjectMatterCluster,
  activeView,
  setActiveView
}: ControlPanelProps) {

  const updateSetting = <K extends keyof PhysicsSettings>(key: K, value: PhysicsSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl p-6 shadow-2xl flex flex-col gap-6 font-sans text-white" id="control-panel">
      {/* View Selection Mode */}
      <div>
        <div className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-3">Visualization Model</div>
        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveView('orbits')}
            className={`py-2 px-3 text-xs font-mono font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeView === 'orbits'
                ? 'bg-white/10 text-orange-400 border border-white/10 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
            }`}
            id="view-toggle-orbits"
          >
            <Orbit className="w-3.5 h-3.5" />
            Warped Orbits (2D)
          </button>
          <button
            onClick={() => setActiveView('lens')}
            className={`py-2 px-3 text-xs font-mono font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeView === 'lens'
                ? 'bg-white/10 text-orange-400 border border-white/10 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
            }`}
            id="view-toggle-lens"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Relativistic Lens
          </button>
        </div>
      </div>

      {/* Physics sliders */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <Sliders className="w-4 h-4 text-orange-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 font-mono">Relativity Controls</h3>
        </div>

        {/* Mass Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-mono text-gray-300">
            <span>Singularity Mass (M)</span>
            <span className="text-orange-400 font-bold">{settings.mass.toFixed(0)} M☉</span>
          </div>
          <input
            type="range"
            min="2"
            max="100"
            step="1"
            value={settings.mass}
            onChange={(e) => updateSetting('mass', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500"
            id="slider-mass"
          />
          <div className="flex justify-between text-[9px] text-gray-500 font-mono tracking-wider">
            <span>STELLAR CYCLE</span>
            <span>SUPERMASSIVE SHIELD</span>
          </div>
        </div>

        {/* Dynamic Controls based on view */}
        {activeView === 'orbits' ? (
          <>
            {/* General Relativistic Correction Strength */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono text-gray-300">
                <span>Einsteinian Warp Correction</span>
                <span className="text-amber-400 font-bold">{settings.relativisticCorrection.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.1"
                value={settings.relativisticCorrection}
                onChange={(e) => updateSetting('relativisticCorrection', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500"
                id="slider-gr"
              />
              <div className="flex justify-between text-[9px] text-gray-500 font-mono tracking-wider">
                <span>NEWTON (0.0)</span>
                <span>EINSTEIN-SCHWARZSCHILD (3.0)</span>
              </div>
            </div>

            {/* Display Toggles */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => updateSetting('showPhotonSphere', !settings.showPhotonSphere)}
                className={`py-2 px-2.5 text-[10px] uppercase font-mono border rounded-lg transition-all text-left flex justify-between items-center cursor-pointer ${
                  settings.showPhotonSphere
                    ? 'border-orange-500/30 bg-orange-500/10 text-orange-300'
                    : 'border-white/5 bg-white/[0.02] text-gray-400'
                }`}
                id="toggle-photon"
              >
                <span>Photon Sphere</span>
                <span className="font-bold">{settings.showPhotonSphere ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => updateSetting('showISCO', !settings.showISCO)}
                className={`py-2 px-2.5 text-[10px] uppercase font-mono border rounded-lg transition-all text-left flex justify-between items-center cursor-pointer ${
                  settings.showISCO
                    ? 'border-orange-500/30 bg-orange-500/10 text-orange-300'
                    : 'border-white/5 bg-white/[0.02] text-gray-400'
                }`}
                id="toggle-isco"
              >
                <span>ISCO Limits</span>
                <span className="font-bold">{settings.showISCO ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => updateSetting('showGrid', !settings.showGrid)}
                className={`py-2 px-2.5 text-[10px] uppercase font-mono border rounded-lg transition-all text-left flex justify-between items-center cursor-pointer ${
                  settings.showGrid
                    ? 'border-orange-500/30 bg-orange-500/10 text-orange-300'
                    : 'border-white/5 bg-white/[0.02] text-gray-400'
                }`}
                id="toggle-grid"
              >
                <span>Spacetime Grid</span>
                <span className="font-bold">{settings.showGrid ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => updateSetting('hawkingRadiationEnabled', !settings.hawkingRadiationEnabled)}
                className={`py-2 px-2.5 text-[10px] uppercase font-mono border rounded-lg transition-all text-left flex justify-between items-center cursor-pointer ${
                  settings.hawkingRadiationEnabled
                    ? 'border-rose-500/30 bg-rose-500/15 text-rose-300 animate-pulse'
                    : 'border-white/5 bg-white/[0.02] text-gray-400'
                }`}
                id="toggle-hawking"
              >
                <span>Hawking Rad</span>
                <span className="font-bold">{settings.hawkingRadiationEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Lensing Specific Controls */}
            {/* Disk Inclination / Angle */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono text-gray-300">
                <span>Accretion Disk Inclination</span>
                <span className="text-cyan-400 font-bold">{settings.tiltAngle}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="2"
                value={settings.tiltAngle}
                onChange={(e) => updateSetting('tiltAngle', parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500"
                id="slider-tilt"
              />
              <div className="flex justify-between text-[9px] text-gray-500 font-mono tracking-wider">
                <span>SOUTH POLE (-45°)</span>
                <span>EQUATOR (0°)</span>
                <span>NORTH POLE (45°)</span>
              </div>
            </div>

            {/* Accretion Disk Outer Size */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono text-gray-300">
                <span>Disk Width Boundaries</span>
                <span className="text-cyan-400 font-bold">{settings.diskInnerRadius} to {settings.diskOuterRadius} R_s</span>
              </div>
              <input
                type="range"
                min="6"
                max="25"
                step="1"
                value={settings.diskOuterRadius}
                onChange={(e) => updateSetting('diskOuterRadius', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500"
                id="slider-diskOuter"
              />
            </div>

            {/* Quasar Jets */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-300">Polar Relativistic Jets</span>
                <button
                  onClick={() => updateSetting('showRelativisticJets', !settings.showRelativisticJets)}
                  className={`text-[9.5px] uppercase font-mono px-2.5 py-1 rounded-md transition-all border cursor-pointer ${
                    settings.showRelativisticJets
                      ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                      : 'text-gray-400 border-white/5 bg-white/5'
                  }`}
                  id="toggle-jets"
                >
                  {settings.showRelativisticJets ? 'Active' : 'Disabled'}
                </button>
              </div>

              {settings.showRelativisticJets && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex justify-between text-[9px] font-mono text-gray-500">
                    <span>Jet Luminosity Output</span>
                    <span>{(settings.jetsIntensity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.jetsIntensity}
                    onChange={(e) => updateSetting('jetsIntensity', parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400"
                    id="slider-jets-intensity"
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Time Step & Play Speed Slider */}
        <div className="space-y-2 pt-3 border-t border-white/5 animate-fadeIn">
          <div className="flex justify-between text-[11px] font-mono text-gray-300">
            <span>Simulation Time Scalar</span>
            <span className="text-orange-400 font-bold">{settings.simSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={settings.simSpeed}
            onChange={(e) => updateSetting('simSpeed', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500"
            id="slider-speed"
          />
        </div>
      </div>

      {/* Physics Injector Block */}
      {activeView === 'orbits' && (
        <div className="space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 font-mono">
              Spacetime Particle Injector
            </span>
          </div>

          <p className="text-[11px] text-gray-400 font-sans leading-normal">
            Drag vectors in orbit view to fling matter. Or invoke discrete system injects:
          </p>

          <div className="grid grid-cols-1 gap-2 pt-1 font-mono">
            <button
              onClick={onInjectPhotonBeam}
              className="py-2 px-3 bg-white/5 hover:bg-white/10 text-amber-300 border border-white/5 hover:border-white/10 rounded-xl text-[10px] transition text-left flex justify-between items-center cursor-pointer uppercase tracking-wider"
              id="fire-photon"
            >
              <span>⚡ Fire Multi-Photon Beam</span>
              <span className="text-[9px] text-amber-500">v = c</span>
            </button>
            <button
              onClick={onInjectProbe}
              className="py-2 px-3 bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/5 hover:border-white/10 rounded-xl text-[10px] transition text-left flex justify-between items-center cursor-pointer uppercase tracking-wider"
              id="fire-probe"
            >
              <span>🚀 Launch Explorer Probe</span>
              <span className="text-[9px] text-cyan-500">v &lt; c</span>
            </button>
            <button
              onClick={onInjectMatterCluster}
              className="py-2 px-3 bg-white/5 hover:bg-white/10 text-emerald-300 border border-white/5 hover:border-white/10 rounded-xl text-[10px] transition text-left flex justify-between items-center cursor-pointer uppercase tracking-wider"
              id="fire-dust"
            >
              <span>🪐 Inject Accretion Clump</span>
              <span className="text-[9px] text-emerald-500">Orbit</span>
            </button>
          </div>
        </div>
      )}

      {/* Simulation Controls (Play, Pause, Clear, Speed) */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isPaused
                ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-400'
                : 'bg-white/10 hover:bg-white/20 border border-white/15 text-white shadow-md'
            }`}
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            id="control-play-pause"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          {activeView === 'orbits' && (
            <button
              onClick={onClearParticles}
              className="w-11 h-11 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/10 text-gray-400 hover:text-rose-400 transition cursor-pointer flex items-center justify-center"
              title="Clear Particles"
              id="control-clear"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
          STATE: {isPaused ? <span className="text-amber-500 font-bold">PAUSED</span> : <span className="text-green-500 font-bold">OPTIMAL</span>}
        </span>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { PhysicsSettings, OrbitParticle } from './types';
import SimCanvas from './components/SimCanvas';
import ControlPanel from './components/ControlPanel';
import MetricsPanel from './components/MetricsPanel';
import PresetsPanel, { PRESETS } from './components/PresetsPanel';
import { Orbit, Compass, Cpu, HelpCircle, Activity, Info, BookOpen } from 'lucide-react';

export default function App() {
  // Global simulation state
  const [settings, setSettings] = useState<PhysicsSettings>({
    mass: 35, // starting middle mass
    gravitationalConstant: 6.6743e-11,
    speedOfLight: 2.99792458e8,
    relativisticCorrection: 1.0,
    simSpeed: 1.0,
    showPhotonSphere: true,
    showISCO: true,
    showGrid: true,
    showRelativisticJets: false,
    jetsIntensity: 0.4,
    hawkingRadiationEnabled: false,
    tiltAngle: 18,
    diskOuterRadius: 16,
    diskInnerRadius: 3
  });

  const [isPaused, setIsPaused] = useState(false);
  const [activePresetId, setActivePresetId] = useState('sgrA');
  const [activeView, setActiveView] = useState<'orbits' | 'lens'>('orbits');
  const [particles, setParticles] = useState<OrbitParticle[]>([]);

  // Spawn generic particle callback
  const handleSpawnParticle = (p: OrbitParticle) => {
    setParticles((prev) => [...prev, p]);
  };

  // Switch presets callback
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setActivePresetId(presetId);
    setParticles([]); // Flush old particles for new system state

    setSettings((prev) => ({
      ...prev,
      mass: preset.massSettings,
      showRelativisticJets: preset.jetsEnabled,
      jetsIntensity: preset.jetsIntensity,
      hawkingRadiationEnabled: preset.hawkingEnabled,
      relativisticCorrection: preset.relativisticCorrection,
      diskOuterRadius: preset.diskOuterRadius
    }));
  };

  // Launch pre-calculated particle streams from coordinates
  const handleInjectPhotonBeam = () => {
    // We launch 5 parallel photons from the left heading right
    const freshPhotons: OrbitParticle[] = [];
    const step = 20;
    
    // Middle altitude (approx center Y) is ~225 on 450 height canvas
    const startY = 225;

    for (let i = -2; i <= 2; i++) {
      const py = startY + i * 22;
      freshPhotons.push({
        id: Math.random().toString(),
        x: 40,
        y: py,
        vx: 4.0, // photon constant scaled speed
        vy: 0,
        type: 'photon',
        path: [{ x: 40, y: py }],
        maxPathLength: 180,
        color: 'rgba(251, 191, 36, 0.9)',
        absorbed: false,
        escaped: false,
        distanceToSingularity: 999,
        velocityMagnitude: 4.0,
        mass: 0
      });
    }

    setParticles((prev) => [...prev, ...freshPhotons]);
  };

  const handleInjectProbe = () => {
    // Spawns a cool cyan probe setup in stable orbital inclination
    const probe: OrbitParticle = {
      id: Math.random().toString(),
      x: 180,
      y: 90,
      vx: 2.3,
      vy: 1.15,
      type: 'probe',
      path: [{ x: 180, y: 90 }],
      maxPathLength: 300,
      color: 'rgba(34, 211, 238, 0.95)',
      absorbed: false,
      escaped: false,
      distanceToSingularity: 999,
      velocityMagnitude: 2.5,
      mass: 100
    };
    setParticles((prev) => [...prev, probe]);
  };

  const handleInjectMatterCluster = () => {
    // Spawns swirling ring clump of green stellar dust
    const dustParticles: OrbitParticle[] = [];
    const count = 18;
    const baseAngle = -Math.PI / 4;

    for (let i = 0; i < count; i++) {
      // Small dispersion offsets
      const offsetRadius = 120 + (Math.random() - 0.5) * 20;
      const angle = baseAngle + (Math.random() - 0.5) * 0.3;
      
      const x = 300 + Math.cos(angle) * offsetRadius;
      const y = 225 + Math.sin(angle) * offsetRadius;

      // Keplerian velocity tangent directions
      const speed = 2.0 + Math.random() * 0.4;
      const vx = -Math.sin(angle) * speed;
      const vy = Math.cos(angle) * speed;

      dustParticles.push({
        id: Math.random().toString(),
        x,
        y,
        vx,
        vy,
        type: 'matter',
        path: [{ x, y }],
        maxPathLength: 100,
        color: 'rgba(52, 211, 153, 0.75)',
        absorbed: false,
        escaped: false,
        distanceToSingularity: 999,
        velocityMagnitude: speed,
        mass: 1
      });
    }

    setParticles((prev) => [...prev, ...dustParticles]);
  };

  const activePreset = PRESETS.find(p => p.id === activePresetId) || PRESETS[0];

  return (
    <div className="min-h-screen bg-[#05060b] text-white flex flex-col relative overflow-x-hidden font-sans" id="app-root">
      
      {/* Decorative glass aura backgrounds (Frosted Glass Theme Accents) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[700px] h-[700px] bg-orange-600/10 rounded-full blur-[140px] top-10 left-10"></div>
        <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] bottom-10 right-10"></div>
        <div className="absolute w-[900px] h-[160px] border-[30px] border-orange-500/10 rounded-[100%] blur-[60px] rotate-[-12deg] top-1/3"></div>
        <div className="absolute w-[800px] h-[100px] border-[2px] border-white/5 rounded-[100%] rotate-[-12deg] top-1/3"></div>
      </div>

      {/* 1. APP PRIMARY HEADER WITH FROSTED GLASS STYLE */}
      <header className="h-16 flex items-center justify-between px-6 sm:px-8 bg-white/5 backdrop-blur-xl border-b border-white/10 z-30 shrink-0" id="app-header">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-orange-500 rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-transform hover:scale-105 cursor-pointer">
            <span className="text-black font-black -rotate-45 text-sm font-mono">Ω</span>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-[0.2em] uppercase text-white font-sans">
              Event Horizon Simulator v4.1
            </h1>
            <p className="text-[9px] text-orange-400 font-mono tracking-widest uppercase">
              Kerr-Schwarzschild Metric | System Active
            </p>
          </div>
        </div>

        <div className="hidden md:flex gap-12 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
          <span>RA: 17h 45.6m | DEC: -29.01°</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-400">Engine Synchronized ({particles.filter(p => !p.absorbed && !p.escaped).length} entities)</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-30" id="main-layout">
        
        {/* Left Column: Preset Catalog and Physics Control (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6" id="left-sidebar">
          {/* Preset Catalog Section */}
          <PresetsPanel
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
          />

          {/* Controls Section */}
          <ControlPanel
            settings={settings}
            setSettings={setSettings}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            onClearParticles={() => setParticles([])}
            onInjectPhotonBeam={handleInjectPhotonBeam}
            onInjectProbe={handleInjectProbe}
            onInjectMatterCluster={handleInjectMatterCluster}
            activeView={activeView}
            setActiveView={setActiveView}
          />
        </div>

        {/* Right Column: Visualization Viewport and Diagnostics HUD (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6" id="right-viewport">
          {/* Custom Physical Simulation Canvas */}
          <SimCanvas
            settings={settings}
            setSettings={setSettings}
            isPaused={isPaused}
            activeView={activeView}
            particles={particles}
            setParticles={setParticles}
            onSpawnParticle={handleSpawnParticle}
          />

          {/* Diagnostics Diagnostics Hub */}
          <MetricsPanel
            massSolar={activePreset.id === 'primordial' ? settings.mass * 1.5e-19 : settings.mass * (activePreset.id === 'cygnus' ? 1.8 : 7.0e7)}
          />

          {/* 3. RELATIVISTIC EDU GUIDE PANEL (Frosted style) */}
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl p-6 shadow-2xl" id="edu-guide-panel">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-orange-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                Spacetime Physics Compendium
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-2 bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="font-semibold text-orange-400 block tracking-wider uppercase text-[10px] font-mono">Schwarzschild Horizon</span>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  The gravitational boundary where escape velocity equals light speed. Inside this threshold ($R_s = 2GM/c^2$), spacetime curved loops prevent anything from escaping.
                </p>
              </div>

              <div className="space-y-2 bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="font-semibold text-blue-400 block tracking-wider uppercase text-[10px] font-mono">Einstein Deflection</span>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  Light passing an massive well shifts trajectory twice as much as Newtonian physics asserts, producing gravitational lensing and the iconic visual "double halo".
                </p>
              </div>

              <div className="space-y-2 bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="font-semibold text-gray-300 block tracking-wider uppercase text-[10px] font-mono">Hawking Evaporation</span>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  Virtual quantum energy fluctuations split at the horizon. One particle falls in while the other escapes, causing black holes to steadily radiate away energy and eventually explode.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. APP FOOTER */}
      <footer className="h-20 bg-white/5 backdrop-blur-3xl border-t border-white/10 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-2 z-30 font-mono text-[10px] text-gray-500" id="app-footer">
        <div className="flex items-center gap-4">
          <span className="uppercase tracking-widest text-orange-500 font-bold">SOLVER: SECOND-ORDER GEODESICS</span>
        </div>
        <div className="text-center sm:text-right">
          <p>Einstein Field Equations resolved in real-time. Google AI Studio Sandbox © 2026</p>
        </div>
      </footer>
    </div>
  );
}

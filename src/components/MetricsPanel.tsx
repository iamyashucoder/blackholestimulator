import { calculateBlackHoleMetrics, formatValue, formatLifetime } from '../physics';
import { Shield, Sparkles, Thermometer, Flame, HelpCircle } from 'lucide-react';

interface MetricsPanelProps {
  massSolar: number;
}

export default function MetricsPanel({ massSolar }: MetricsPanelProps) {
  const metrics = calculateBlackHoleMetrics(massSolar);

  // Determine size comparison
  const getComparativeSize = (rs: number) => {
    if (rs < 1e-12) return 'Subatomic particle size';
    if (rs < 1e-3) return 'Sand grain';
    if (rs < 0.1) return 'Size of a tennis ball';
    if (rs < 2000) return 'Height of a mountain';
    if (rs < 20000) return 'Size of a large metropolis';
    if (rs < 1.3e7) return 'Smaller than Earth (continental scale)';
    if (rs < 1.4e9) return 'Size of our Sun';
    if (rs < 3e11) return 'Size of the inner Solar System (Mercury to Mars boundary)';
    return 'Size of the entire Solar System & beyond!';
  };

  // Determine tidal forces comparison
  const getTidalForcesDescription = (factor: number) => {
    // factor is force scale: proportional to 1 / (M^2)
    if (factor < 1e-8) {
      return 'Extreme low tidal force at boundary. An astronaut crossing the horizon survives spaghettification initially.';
    }
    if (factor < 1e-2) {
      return 'Moderate tidal forces. Minor elongation before crossing.';
    }
    if (factor < 100) {
      return 'Severe tidal forces. Visible distortion of physical objects occurs outside the event horizon.';
    }
    return 'Hyper-intense spaghettification. Any matter is instantly shredded into atomic strands long before crossing.';
  };

  // Temperature description
  const getTempDescription = (temp: number) => {
    if (temp < 2.73) {
      return 'Colder than the cosmic microwave background (current universe). Absorbs more CMB than it radiates.';
    }
    if (temp < 1000) {
      return 'Warm quantum state. Negligible evaporation rate.';
    }
    if (temp < 1e6) {
      return 'Hot thermal emitter. Steady particle pair production.';
    }
    return 'Superhot quantum furnace. Rapidly ejecting gamma rays and high-energy particles!';
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl p-6 shadow-2xl" id="metrics-panel">
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <Shield className="w-4 h-4 text-orange-500" id="icon-metrics-title" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 font-mono">
          Singularity Diagnostics Console (HUD)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Dimensions */}
        <div className="space-y-3">
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Solar Mass Scale (M)</div>
            <div className="text-xl font-bold font-mono text-orange-400 mt-1" id="metric-mass">
              {massSolar < 0.01 ? massSolar.toExponential(4) : massSolar.toLocaleString(undefined, { maximumFractionDigits: 1 })} M☉
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Matter equivalence: <span className="text-gray-300">{formatValue(metrics.massKg, 'kg')}</span>.
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1">
              Event Horizon Radius (R_s)
              <span className="text-cyan-400">*</span>
            </div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1" id="metric-rs">
              {formatValue(metrics.RsMeters, 'meters')}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Scale relative comparison: <span className="text-cyan-300 font-medium">{getComparativeSize(metrics.RsMeters)}</span>.
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Photon Sphere Horizon (Lensing boundary)</div>
            <div className="text-sm font-bold font-mono text-amber-400 mt-1">
              {formatValue(metrics.photonSphereMeters, 'meters')} (1.5 R_s)
            </div>
            <p className="text-[11px] text-gray-400 leading-normal mt-1.5">
              Boundary where gravity forces photons to travel in unstable rings.
            </p>
          </div>
        </div>

        {/* Right Column: Thermodynamics & Relativity */}
        <div className="space-y-3">
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-rose-400" />
              Hawking Temperature (T_H)
            </div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1" id="metric-temp">
              {formatValue(metrics.hawkingTempKelvin, 'Kelvins')}
            </div>
            <div className="text-xs text-slate-400 mt-1 leading-normal">
              Quantum status: <span className="text-rose-300">{getTempDescription(metrics.hawkingTempKelvin)}</span>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              Evaporation Lifetime
            </div>
            <div className="text-sm font-bold font-mono text-orange-400 mt-1" id="metric-lifetime">
              {formatLifetime(metrics.lifetimeYears)}
            </div>
            <p className="text-[11px] text-gray-400 leading-normal mt-1.5">
              Expected survival duration under quantum pair evaporation.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1">
              Horizon Space Tidal Forces
            </div>
            <p className="text-[11px] text-gray-300 leading-normal font-sans mt-1" id="metric-tidal">
              {getTidalForcesDescription(metrics.tidalForceFactor)}
            </p>
          </div>
        </div>
      </div>

      {/* Physics guide footer info box */}
      <div className="mt-5 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl flex gap-3 items-start">
        <HelpCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
          <strong>Interactive Relativistic Engine:</strong> Toggle <span className="text-slate-200">Warped Orbits</span> to manually shoot matter or light probes and witness precession, deflection, and Schwarzschild tidal absorption. Toggle <span className="text-slate-200">Relativistic Lens</span> to view accretion-disk gravitational lensing.
        </p>
      </div>
    </div>
  );
}

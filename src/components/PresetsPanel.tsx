import { Preset } from '../types';
import { Sparkles, Milestone, ShieldAlert, Zap, Orbit } from 'lucide-react';

export const PRESETS: Preset[] = [
  {
    id: 'sgrA',
    name: 'Sagittarius A*',
    description: 'The supermassive black hole sits at the very heart of our Milky Way galaxy. It has a relatively quiet accretion disk and a massive gravitational grip.',
    massSolar: 4.15e6,         // 4.15 million M_sun
    massSettings: 45,
    diskOuterRadius: 12,
    jetsEnabled: false,
    jetsIntensity: 0.1,
    hawkingEnabled: false,
    relativisticCorrection: 1.0,
    classification: 'Supermassive Black Hole'
  },
  {
    id: 'm87',
    name: 'Messier 87*',
    description: 'The first black hole ever directly photographed. Located in the Virgo A cluster, it is a cosmic giant producing a relativistic jet stretching 5,000 light-years!',
    massSolar: 6.5e9,          // 6.5 billion M_sun
    massSettings: 95,
    diskOuterRadius: 16,
    jetsEnabled: true,
    jetsIntensity: 0.9,
    hawkingEnabled: false,
    relativisticCorrection: 1.2,
    classification: 'Hypermassive Quasar'
  },
  {
    id: 'gargantua',
    name: 'Gargantua',
    description: 'Inspired by relativistic physics models, this colossal black hole possesses an extremely bright and massive accretion disk with stable tidal forces.',
    massSolar: 1.0e8,          // 100 million M_sun
    massSettings: 65,
    diskOuterRadius: 20,
    jetsEnabled: false,
    jetsIntensity: 0.3,
    hawkingEnabled: false,
    relativisticCorrection: 1.5,
    classification: 'Kerr-like Extremal Hole'
  },
  {
    id: 'cygnus',
    name: 'Cygnus X-1',
    description: 'A stellar-mass black hole in the constellation Cygnus. It is locked in a tight dance with a blue supergiant companion star, ripping off stellar material.',
    massSolar: 21.2,           // 21.2 M_sun
    massSettings: 12,
    diskOuterRadius: 8,
    jetsEnabled: true,
    jetsIntensity: 0.4,
    hawkingEnabled: false,
    relativisticCorrection: 1.0,
    classification: 'Stellar Mass Black Hole'
  },
  {
    id: 'primordial',
    name: 'Quantum Primordial',
    description: 'Hypothetical tiny black hole born in the dense soup of the early universe. Its mass is so small that Hawking radiation is extreme, leading to a fiery evaporation.',
    massSolar: 1.0e-19,        // Microscopic mass (ex: 10^11 kg)
    massSettings: 2,
    diskOuterRadius: 0,
    jetsEnabled: false,
    jetsIntensity: 0.0,
    hawkingEnabled: true,
    relativisticCorrection: 2.5,
    classification: 'Primordial Micro Hole'
  }
];

interface PresetsPanelProps {
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
}

export default function PresetsPanel({ activePresetId, onSelectPreset }: PresetsPanelProps) {
  const getPresetIcon = (id: string) => {
    switch (id) {
      case 'm87':
        return <Zap className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'gargantua':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'cygnus':
        return <Orbit className="w-4 h-4 text-orange-400 animate-spin" style={{ animationDuration: '6s' }} />;
      case 'primordial':
        return <ShieldAlert className="w-4 h-4 text-rose-500 animate-bounce" />;
      default:
        return <Milestone className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl p-6 shadow-2xl" id="presets-panel">
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <Sparkles className="w-4 h-4 text-orange-500" id="icon-presets-title" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 font-mono">
          Spacetime Catalog Singularity Preset
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {PRESETS.map((preset) => {
          const isActive = preset.id === activePresetId;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'bg-white/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/20'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/5'
              }`}
              id={`preset-btn-${preset.id}`}
            >
              {/* Highlight background decoration on hover / active */}
              {isActive && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/15 to-transparent rounded-bl-full pointer-events-none" />
              )}

              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {getPresetIcon(preset.id)}
                  <span className={`font-semibold text-sm transition-colors ${isActive ? 'text-orange-400' : 'text-slate-100 group-hover:text-orange-300'}`}>
                    {preset.name}
                  </span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/60 border border-white/5 text-gray-400 uppercase tracking-widest">
                  {preset.classification}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors line-clamp-2">
                {preset.description}
              </p>

              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-gray-400 border-t border-white/5 pt-2.5">
                <span>Mass: {preset.id === 'primordial' ? '~10¹¹ kg' : `${preset.massSolar.toExponential(1)} M☉`}</span>
                {preset.jetsEnabled && <span className="text-amber-500 font-medium">Relatvistic Jets ON</span>}
                {preset.hawkingEnabled && <span className="text-rose-400 animate-pulse font-medium">Quantum Rad ON</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

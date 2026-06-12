export interface PhysicsSettings {
  mass: number;                // Relative mass parameter (controls Schwarzschild radius on canvas)
  gravitationalConstant: number; // G
  speedOfLight: number;        // c
  relativisticCorrection: number; // multiplier for 3GM/r^2 (GR correction)
  simSpeed: number;            // multiplier for physics dt
  showPhotonSphere: boolean;
  showISCO: boolean;
  showGrid: boolean;
  showRelativisticJets: boolean;
  jetsIntensity: number;       // 0 to 1
  hawkingRadiationEnabled: boolean;
  tiltAngle: number;           // degree inclination for Lensing view
  diskOuterRadius: number;     // in Rs units
  diskInnerRadius: number;     // in Rs units
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  massSolar: number;          // Mass in solar masses (M_sun)
  massSettings: number;       // Value for settings.mass
  diskOuterRadius: number;
  jetsEnabled: boolean;
  jetsIntensity: number;
  hawkingEnabled: boolean;
  relativisticCorrection: number;
  classification: string;
}

export interface OrbitParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'photon' | 'matter' | 'probe' | 'radiation';
  path: { x: number; y: number }[];
  maxPathLength: number;
  color: string;
  absorbed: boolean;
  escaped: boolean;
  distanceToSingularity: number;
  velocityMagnitude: number;
  mass: number; // 0 for photon, > 0 for probe/matter
}

export interface GridPoint {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  displacement: number;
}

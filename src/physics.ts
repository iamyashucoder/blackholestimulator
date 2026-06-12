// Physics constants and formulas for the Black Hole Simulation

export const G = 6.6743e-11;      // m^3 kg^-1 s^-2
export const c = 2.99792458e8;    // m/s
export const hbar = 1.0545718e-34; // J s
export const k_B = 1.380649e-23;  // J/K
export const M_sun = 1.989e30;     // kg

/**
 * Calculates physical attributes of a black hole based on its Mass (in Solar Masses).
 */
export function calculateBlackHoleMetrics(massSolar: number) {
  const kg = massSolar * M_sun;

  // Schwarzschild Radius: Rs = 2GM / c^2
  const Rs = (2 * G * kg) / (c * c);

  // Hawking Temperature: T_H = (hbar * c^3) / (8 * pi * G * M * kB)
  const HawkingTemp = (hbar * Math.pow(c, 3)) / (8 * Math.PI * G * kg * k_B);

  // Evaporation lifetime (seconds): t = 5120 * pi * G^2 * M^3 / (hbar * c^4)
  const lifetimeSeconds = (5120 * Math.PI * G * G * Math.pow(kg, 3)) / (hbar * Math.pow(c, 4));
  const lifetimeYears = lifetimeSeconds / (365.25 * 24 * 3600);

  // Tidal force scale (at the event horizon)
  // F_tidal prop to G * M / r^3. At R_s: G * M / (2GM/c^2)^3 = c^6 / (8 G^2 M^2) -> larger holes have smaller tidal forces!
  const tidalForceFactor = Math.pow(c, 6) / (8 * G * G * kg * kg);

  // Photon Sphere Radius is 1.5 * Rs
  const photonSphere = 1.5 * Rs;

  // Innermost Stable Circular Orbit (ISCO) is 3 * Rs
  const isco = 3 * Rs;

  return {
    massKg: kg,
    RsMeters: Rs,
    hawkingTempKelvin: HawkingTemp,
    lifetimeYears: lifetimeYears,
    tidalForceFactor: tidalForceFactor,
    photonSphereMeters: photonSphere,
    iscoMeters: isco,
  };
}

/**
 * Accretion disk temperature gradient.
 * Temp approx (M)^-1/2 * (r)^-3/4
 */
export function getAccretionDiskTemp(massSolar: number, radiusInRs: number): number {
  if (radiusInRs < 3) return 0; // Inside ISCO, gas plummets fast and stays cool/absorbed
  // Standard disk model peak temperature approximation
  // Hotter for smaller black holes, cooler for supermassive ones!
  const baseTemp = 1e7 * Math.pow(massSolar, -0.25);
  return baseTemp * Math.pow(radiusInRs / 3, -0.75);
}

/**
 * Formats a number to beautiful scientific or readable notation
 */
export function formatValue(value: number, unit: string): string {
  if (value === 0) return `0 ${unit}`;
  
  if (value < 1e-4 || value > 1e9) {
    const exponent = Math.floor(Math.log10(value));
    const mantissa = value / Math.pow(10, exponent);
    return `${mantissa.toFixed(3)} × 10^{${exponent}} ${unit}`;
  }

  // Comma separator for standard values
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
}

/**
 * Format Hawking Lifetime in years into something easy to grasp
 */
export function formatLifetime(years: number): string {
  if (years < 1e-6) {
    return `${(years * 365.25 * 24 * 3600).toFixed(4)} seconds`;
  }
  if (years < 1e-3) {
    return `${(years * 365.25 * 24).toFixed(2)} hours`;
  }
  if (years < 1) {
    return `${(years * 365.25).toFixed(1)} days`;
  }
  if (years > 1e50) {
    return "Infinite (Cosmic scale / beyond heat death)";
  }
  return formatValue(years, "years");
}

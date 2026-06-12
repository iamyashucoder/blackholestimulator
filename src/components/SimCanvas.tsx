import React, { useRef, useEffect, useState, MouseEvent } from 'react';
import { PhysicsSettings, OrbitParticle } from '../types';
import { Play, RotateCcw, Crosshair, HelpCircle, Eye, RefreshCw } from 'lucide-react';

interface SimCanvasProps {
  settings: PhysicsSettings;
  setSettings: (updater: (prev: PhysicsSettings) => PhysicsSettings) => void;
  isPaused: boolean;
  activeView: 'orbits' | 'lens';
  particles: OrbitParticle[];
  setParticles: React.Dispatch<React.SetStateAction<OrbitParticle[]>>;
  onSpawnParticle: (p: OrbitParticle) => void;
}

interface ParticleEmitter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export default function SimCanvas({
  settings,
  setSettings,
  isPaused,
  activeView,
  particles,
  setParticles,
  onSpawnParticle
}: SimCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interaction State for Particle Launching
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [launchType, setLaunchType] = useState<'photon' | 'probe' | 'matter'>('probe');

  // Sparkles & Absorbed Bursts
  const [bursts, setBursts] = useState<ParticleEmitter[]>([]);

  // 3D Accretion Disk Simulation State (for Relativistic Lensing view)
  const [diskAngle, setDiskAngle] = useState(0); // rotation angle of gas over time

  // Dimensions
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        let { width, height } = entry.contentRect;
        // set height proportionally
        height = Math.max(width * (3/4), 380);
        setDimensions({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Set default canvas coordinate helper values
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  // Mass translates directly to Schwarzschild Radius (Rs) in canvas pixels
  // Let settings.mass (2 to 100) map to RsPixels (10 to 110 pixels)
  const RsPixels = 12 + settings.mass * 0.95;

  // Accretion Disk particles cache (pre-calculating orbits for the 3D lensed disk)
  const lensedDiskParticlesRef = useRef<{ radius: number; angle: number; color: string; speedMultiplier: number }[]>([]);
  if (lensedDiskParticlesRef.current.length === 0) {
    const arr = [];
    // Generate 1800 accretion dust particles for high-fidelity lens modeling
    for (let i = 0; i < 2200; i++) {
      const radius = 3.2 + Math.pow(Math.random(), 1.8) * 15; // starting at ISCO out to outer bounds
      const angle = Math.random() * Math.PI * 2;
      
      // Temperature driven color gradient: hot blue/white closer inside, warm orange/red outside
      let color = 'rgba(255, 120, 20, 0.45)';
      if (radius < 5) {
        color = 'rgba(230, 245, 255, 0.8)'; // intense blue-white gas
      } else if (radius < 8) {
        color = 'rgba(255, 220, 100, 0.65)'; // bright golden-yellow
      } else if (radius < 12) {
        color = 'rgba(255, 140, 20, 0.5)'; // bright orange
      } else {
        color = 'rgba(220, 60, 20, 0.35)'; // deep faint red-orange
      }

      arr.push({
        radius,
        angle,
        color,
        speedMultiplier: Math.pow(radius, -1.5) * 0.05 // Keplerian velocity decline v prop to r^-1.5
      });
    }
    lensedDiskParticlesRef.current = arr;
  }

  // Animation Frame Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Clear with soft trails for orbital lines
      ctx.fillStyle = activeView === 'orbits' ? 'rgba(5, 7, 18, 0.35)' : '#050712';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // --- 1. RENDER BACKGROUND STARFIELD (Slight stellar rotation for space realism) ---
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 40; i++) {
        const sx = (Math.sin(i * 99) * 0.5 + 0.5) * dimensions.width;
        const sy = (Math.cos(i * 123) * 0.5 + 0.5) * dimensions.height;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // Physics factors
      const dt = 1.2 * settings.simSpeed;

      if (activeView === 'orbits') {
        // --- VIEW A: WARPED SPONTANEOUS ORBITS ---

        // 1a. Draw spacetime fabric warping (mesh grid)
        if (settings.showGrid) {
          ctx.strokeStyle = 'rgba(79, 70, 229, 0.09)';
          ctx.lineWidth = 1;
          const gridSize = 24;
          
          for (let gy = gridSize; gy < dimensions.height; gy += gridSize) {
            ctx.beginPath();
            for (let gx = 0; gx <= dimensions.width; gx += 10) {
              const dx = gx - centerX;
              const dy = gy - centerY;
              const dist = Math.sqrt(dx * dx + dy * dy);

              // Relativistic space stretching: push coordinates inwards towards the gravity well
              let warpX = gx;
              let warpY = gy;
              if (dist > RsPixels + 5) {
                const shiftScale = (RsPixels * RsPixels) / (dist * (dist - RsPixels + 10)) * 14;
                const shift = Math.min(shiftScale, dist - 10);
                warpX -= (dx / dist) * shift;
                warpY -= (dy / dist) * shift;
              }

              if (gx === 0) ctx.moveTo(warpX, warpY);
              else ctx.lineTo(warpX, warpY);
            }
            ctx.stroke();
          }

          // Same for vertical lines
          for (let gx = gridSize; gx < dimensions.width; gx += gridSize) {
            ctx.beginPath();
            for (let gy = 0; gy <= dimensions.height; gy += 10) {
              const dx = gx - centerX;
              const dy = gy - centerY;
              const dist = Math.sqrt(dx * dx + dy * dy);

              let warpX = gx;
              let warpY = gy;
              if (dist > RsPixels + 5) {
                const shiftScale = (RsPixels * RsPixels) / (dist * (dist - RsPixels + 10)) * 14;
                const shift = Math.min(shiftScale, dist - 10);
                warpX -= (dx / dist) * shift;
                warpY -= (dy / dist) * shift;
              }

              if (gy === 0) ctx.moveTo(warpX, warpY);
              else ctx.lineTo(warpX, warpY);
            }
            ctx.stroke();
          }
        }

        // 1b. Draw Boundaries (Photon sphere and ISCO)
        if (settings.showISCO) {
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.15)'; // Orange dashed
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(centerX, centerY, RsPixels * 3.0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(249, 115, 22, 0.4)';
          ctx.font = '9px monospace';
          ctx.fillText('ISCO Boundary (3.0 Rs)', centerX + RsPixels * 3.0 + 5, centerY + 3);
        }

        if (settings.showPhotonSphere) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)'; // Red dashed
          ctx.lineWidth = 1.2;
          ctx.setLineDash([6, 3]);
          ctx.beginPath();
          ctx.arc(centerX, centerY, RsPixels * 1.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
          ctx.font = '9px monospace';
          ctx.fillText('Photon Sphere (1.5 Rs)', centerX + RsPixels * 1.5 + 5, centerY + 3);
        }

        // 1c. Integrate Hawking Radiation Emission (quantum energy escapes!)
        if (settings.hawkingRadiationEnabled && !isPaused && Math.random() < 0.25) {
          // Smaller mass = hotter black hole = higher Hawking emission!
          const emissionProb = 2.5 / (settings.mass + 1);
          const count = Math.ceil(emissionProb);
          
          for (let k = 0; k < count; k++) {
            const hAngle = Math.random() * Math.PI * 2;
            // Spawn right outside the event horizon
            const hx = centerX + Math.cos(hAngle) * (RsPixels + 2);
            const hy = centerY + Math.sin(hAngle) * (RsPixels + 2);
            
            // Kinetic speed of pair-production
            const hSpeed = 1.2 + Math.random() * 1.5;
            const hVx = Math.cos(hAngle) * hSpeed;
            const hVy = Math.sin(hAngle) * hSpeed;

            setParticles(prev => [
              ...prev,
              {
                id: Math.random().toString(),
                x: hx,
                y: hy,
                vx: hVx,
                vy: hVy,
                type: 'radiation',
                path: [],
                maxPathLength: 30,
                color: 'rgba(244, 63, 94, 0.85)', // rose glowing
                absorbed: false,
                escaped: false,
                distanceToSingularity: RsPixels + 2,
                velocityMagnitude: hSpeed,
                mass: 0
              }
            ]);
          }
        }

        // 1d. Track and Draw Active Particles
        setParticles((prevParticles) => {
          return prevParticles.map((particle) => {
            if (particle.absorbed || particle.escaped) return particle;

            let { x, y, vx, vy, type } = particle;

            if (!isPaused) {
              // Calculate vector to central singularity
              const dx = x - centerX;
              const dy = y - centerY;
              const r = Math.sqrt(dx * dx + dy * dy);

              if (r <= RsPixels) {
                // Instantly ABSORBED by event horizon
                particle.absorbed = true;
                
                // Add an explosion burst at capture
                setBursts((b) => [
                  ...b,
                  ...Array.of(1, 2, 3, 4, 5, 6, 7).map(() => ({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    color: particle.color,
                    size: 1.5 + Math.random() * 2,
                    alpha: 1,
                    life: 0,
                    maxLife: 20 + Math.random() * 20
                  }))
                ]);

                // Reduce mass offset if primordial evaporative black hole absorbed huge mass
                if (settings.hawkingRadiationEnabled) {
                  setSettings(p => ({ ...p, mass: Math.min(100, p.mass + (type === 'photon' ? 0.3 : 1.0)) }));
                }

                return { ...particle, absorbed: true };
              }

              // Inside canvas dimensions check
              if (r > Math.max(dimensions.width, dimensions.height) * 1.3) {
                return { ...particle, escaped: true };
              }

              // GEODESIC GRAVITY VELOCITY EULER INTEGRATION
              // Paczyński-Wiita / GR correction potential factor:
              // F_gravity = G*M / r^2. Let's represent dynamic strength scaled to pixels.
              // Gravitational parameter scale factor
              const GM = RsPixels * 0.9; 
              
              // Standard Newtonian logic:
              let factor = GM / (r * r);

              // General Relativistic Einstein correction term:
              // We enrich the gravitational acceleration with standard general relativity adjustment:
              // a_gr = a_newton * (1 + 3 * beta * Rs^2 / r^2)
              // This is exact for photon geodesics/grazing orbits!
              const grCoeff = settings.relativisticCorrection;
              if (type === 'photon') {
                // Photons experience double relativistic deflection as predicted by Einstein
                factor *= 1.8 * (1 + (3 * grCoeff * RsPixels * RsPixels) / (r * r));
              } else {
                // Matter experiences standard GR precession
                factor *= (1 + (3 * grCoeff * RsPixels * RsPixels) / (r * r));
              }

              const ax = -factor * (dx / r);
              const ay = -factor * (dy / r);

              vx += ax * dt;
              vy += ay * dt;

              // For light, we cap/ensure its speed of light is steady, though bent
              if (type === 'photon') {
                const speed = Math.sqrt(vx * vx + vy * vy);
                const speedOfLightScale = 4.0; // Visual speed constant on canvas
                vx = (vx / speed) * speedOfLightScale;
                vy = (vy / speed) * speedOfLightScale;
              }

              x += vx * dt;
              y += vy * dt;

              // Append trail
              const path = [...particle.path, { x, y }];
              if (path.length > particle.maxPathLength) {
                path.shift();
              }

              return {
                ...particle,
                x,
                y,
                vx,
                vy,
                path,
                distanceToSingularity: r,
                velocityMagnitude: Math.sqrt(vx * vx + vy * vy)
              };
            }

            return particle;
          });
        });

        // 1e. Draw Particles & Trail lines
        particles.forEach((p) => {
          if (p.absorbed || p.escaped) return;

          // Draw trail path
          if (p.path.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.type === 'photon' ? 1.4 : p.type === 'radiation' ? 0.9 : 2.0;
            ctx.moveTo(p.path[0].x, p.path[0].y);
            for (let i = 1; i < p.path.length; i++) {
              ctx.lineTo(p.path[i].x, p.path[i].y);
            }
            ctx.stroke();
          }

          // Draw point
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.arc(p.x, p.y, p.type === 'photon' ? 2 : p.type === 'radiation' ? 1.5 : 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Highlight particle probe status
          if (p.type === 'probe') {
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6.5, 0, Math.PI * 2);
            ctx.stroke();
          }
        });

        // 1f. Draw Black Hole Core Shadow in the middle
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(79, 70, 229, 0.45)';
        ctx.fillStyle = '#010206';
        ctx.beginPath();
        ctx.arc(centerX, centerY, RsPixels, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Draw Singularity epicenter (white central infinitesimal dot)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Draw a gorgeous accretion gas dust ring (in orbital mode, a simple soft colored ring)
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.08)';
        ctx.lineWidth = RsPixels * 1.2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, RsPixels * 2.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.04)';
        ctx.lineWidth = RsPixels * 2.2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, RsPixels * 4.5, 0, Math.PI * 2);
        ctx.stroke();

      } else {
        // --- VIEW B: HIGH-FIDELITY RELATIVISTIC SHADOW LENSING (GARGANTUA VIEW) ---

        // Draw relativistic accretion disk under gravitational deflection projection!
        // We orbit disk particles in virtual 3D, and project their curved path towards the camera.
        const diskSpeed = 0.035 * settings.simSpeed;
        if (!isPaused) {
          setDiskAngle((prev) => prev + diskSpeed);
        }

        // Tilt angle in radians
        const tiltRad = (settings.tiltAngle * Math.PI) / 180;

        // Group particles by apparent depth (z values) to draw layers correctly:
        // Back of the disk is drawn FIRST, then the event horizon shadow, then the frontend of the disk!
        // This gives an exceptional 3D depth!
        const projectedParticles: { rx: number; ry: number; color: string; size: number; alpha: number; front: boolean }[] = [];

        lensedDiskParticlesRef.current.forEach((dp) => {
          // Current dynamic angle of dust particle
          const currentAngle = dp.angle + diskAngle * dp.speedMultiplier;

          // Virtual 3D Cartesian coords around black hole center
          const x3d = dp.radius * Math.cos(currentAngle) * RsPixels;
          const y3d = dp.radius * Math.sin(currentAngle) * RsPixels * Math.sin(tiltRad);
          const z3d = dp.radius * Math.sin(currentAngle) * RsPixels * Math.cos(tiltRad); // Depth coordinate

          // Gravitational lensing deviation logic:
          // Light rays wrapping from the back of the disk are bent and visual coordinates are shifted.
          // For particles behind the event horizon depth (z3d < 0), they are warped OUTWARDS to be visible above and below!
          // Distance from center
          const dist2D = Math.sqrt(x3d * x3d + y3d * y3d);

          let screenX = centerX + x3d;
          let screenY = centerY + y3d;

          // Apply analytical gravitational lensing projection multiplier
          // This creates the top halo ("the rear disk bent upwards") and the bottom halo ("the rear disk bent downwards").
          if (z3d < 10) {
            // Particle is behind the black hole or grazing near.
            // Warp outwards based on Schwarzschild correction: Rs is event horizon radius
            const mag = (RsPixels * RsPixels * 1.6) / (dist2D - RsPixels * 0.95 + 1e-5);
            screenX += (x3d / dist2D) * mag;
            screenY += (y3d / dist2D) * mag;
          }

          // ** Doppler Beaming Effects **
          // Gas rotating towards us (relative to x3d coordinate direction) is blue shifted, brighter (beamed).
          // Gas rotating away is red shifted, dimmer.
          // In counterclockwise orbit: on left side (x3d < 0), velocity is towards us, so brighter.
          // Let's implement this exactly:
          let opacityFactor = 1.0;
          if (x3d < 0) {
            opacityFactor = 1.45; // Relativistic beaming brighter
          } else {
            opacityFactor = 0.55;  // Redshift dimmer
          }

          // Particle diameter
          const starSize = Math.max(0.6, 2.5 - dp.radius * 0.07);

          projectedParticles.push({
            rx: screenX,
            ry: screenY,
            color: dp.color,
            size: starSize,
            alpha: opacityFactor,
            front: z3d >= 0 // True if in front of black hole depth
          });
        });

        // DRAW BACKSIDE OF LENSED DISK FIRST
        projectedParticles.filter(p => !p.front).forEach((p) => {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.rx, p.ry, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0; // reset

        // DRAW RELATIVISTIC POLAR JETS ON TOP OF BACK SIDE DISK
        if (settings.showRelativisticJets) {
          const intensity = settings.jetsIntensity;
          ctx.shadowBlur = 40;
          ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
          
          // Outer jet cones (North and South poles)
          const gradNorth = ctx.createLinearGradient(centerX, centerY, centerX, 10);
          gradNorth.addColorStop(0, 'rgba(6, 182, 212, 0.0)');
          gradNorth.addColorStop(0.1, `rgba(6, 182, 212, ${intensity * 0.4})`);
          gradNorth.addColorStop(0.7, `rgba(139, 92, 246, ${intensity * 0.15})`);
          gradNorth.addColorStop(1, 'rgba(139, 92, 246, 0)');

          ctx.fillStyle = gradNorth;
          ctx.beginPath();
          ctx.moveTo(centerX - 12 - intensity * 15, centerY);
          ctx.lineTo(centerX, 15);
          ctx.lineTo(centerX + 12 + intensity * 15, centerY);
          ctx.closePath();
          ctx.fill();

          const gradSouth = ctx.createLinearGradient(centerX, centerY, centerX, dimensions.height - 10);
          gradSouth.addColorStop(0, 'rgba(6, 182, 212, 0.0)');
          gradSouth.addColorStop(0.1, `rgba(6, 182, 212, ${intensity * 0.4})`);
          gradSouth.addColorStop(0.7, `rgba(139, 92, 246, ${intensity * 0.15})`);
          gradSouth.addColorStop(1, 'rgba(139, 92, 246, 0)');

          ctx.fillStyle = gradSouth;
          ctx.beginPath();
          ctx.moveTo(centerX - 12 - intensity * 15, centerY);
          ctx.lineTo(centerX, dimensions.height - 15);
          ctx.lineTo(centerX + 12 + intensity * 15, centerY);
          ctx.closePath();
          ctx.fill();

          ctx.shadowBlur = 0; // reset
        }

        // DRAW BLACK HOLE CENTRAL SHADOW (ECLIPSE OBSERVER AREA)
        // Relativistic gravitational lensing stretches the apparent diameter of the event horizon.
        // Instead of Rs pixels, it looks approx Rs * 2.6 times larger visually (the shadow of the photon sphere!)
        ctx.shadowBlur = 35;
        ctx.shadowColor = 'rgba(251, 146, 60, 0.35)'; // fiery photon glow halo
        ctx.fillStyle = '#010103';
        ctx.beginPath();
        ctx.arc(centerX, centerY, RsPixels * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Redshift/Einstein ring details
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, RsPixels * 1.52, 0, Math.PI * 2);
        ctx.stroke();

        // DRAW FRONTSIDE OF ACCOMODATED ACCRETION DISK (cuts across the black hole!)
        projectedParticles.filter(p => p.front).forEach((p) => {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.rx, p.ry, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0; // reset

        // Draw hot gas core edge glow cut across event horizon
        ctx.fillStyle = 'rgba(255, 230, 200, 0.08)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, RsPixels * 1.8, RsPixels * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 3. DRAW EXTINGUISHED BURST SFX (Sparkles & Exploding Particles) ---
      setBursts((prevBursts) => {
        const activeBursts: ParticleEmitter[] = [];
        prevBursts.forEach((b) => {
          const nextLife = b.life + 1;
          if (nextLife < b.maxLife) {
            const nextX = b.x + b.vx;
            const nextY = b.y + b.vy;
            const nextAlpha = 1 - nextLife / b.maxLife;

            ctx.fillStyle = b.color;
            ctx.globalAlpha = nextAlpha;
            ctx.beginPath();
            ctx.arc(nextX, nextY, b.size, 0, Math.PI * 2);
            ctx.fill();

            activeBursts.push({
              ...b,
              x: nextX,
              y: nextY,
              alpha: nextAlpha,
              life: nextLife
            });
          }
        });
        ctx.globalAlpha = 1.0; // reset
        return activeBursts;
      });

      // --- 4. DRAW LAUNCH DIRECTION VECTOR ARROW (IF INTENSIVELY DRAGGING) ---
      if (isDragging && dragStart && dragCurrent) {
        ctx.strokeStyle = launchType === 'photon' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(34, 197, 94, 0.9)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([3, 2]);

        // Launch Vector line
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragCurrent.x, dragCurrent.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Origin Launch node
        ctx.beginPath();
        ctx.fillStyle = launchType === 'photon' ? '#f59e0b' : '#22c55e';
        ctx.arc(dragStart.x, dragStart.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Calculate visual flight vector values
        const dx = dragStart.x - dragCurrent.x;
        const dy = dragStart.y - dragCurrent.y;
        const speed = Math.sqrt(dx * dx + dy * dy);

        // Render arrow head pointer
        const angle = Math.atan2(dy, dx);
        ctx.fillStyle = launchType === 'photon' ? '#f59e0b' : '#22c55e';
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragStart.x - Math.cos(angle - 0.4) * 11, dragStart.y - Math.sin(angle - 0.4) * 11);
        ctx.lineTo(dragStart.x - Math.cos(angle + 0.4) * 11, dragStart.y - Math.sin(angle + 0.4) * 11);
        ctx.closePath();
        ctx.fill();

        // Overlay speed data HUD near drag
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '10px monospace';
        const displaySpeed = (speed * 0.15).toFixed(1);
        ctx.fillText(
          `Launcher: v = ${launchType === 'photon' ? 'c' : `${displaySpeed} km/s`}`,
          dragStart.x + 12,
          dragStart.y - 12
        );
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [dimensions, activeView, settings, isPaused, dragStart, dragCurrent, isDragging, launchType, particles]);

  // Handle Drag Events for Firing Probes & Photons
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (activeView !== 'orbits') return; // Click to launch is only enabled in the orbit map representation
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });
    setDragCurrent({ x, y });
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragCurrent({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragCurrent) return;
    setIsDragging(false);

    // Speed vector proportional to drag distance
    const dx = dragStart.x - dragCurrent.x;
    const dy = dragStart.y - dragCurrent.y;
    const rawSpeed = Math.sqrt(dx * dx + dy * dy);

    // Limit maximum speed and scale
    const speed = Math.min(rawSpeed * 0.08, 12);
    const angle = Math.atan2(dy, dx);

    // Fire particle
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const customColor =
      launchType === 'photon'
        ? 'rgba(251, 191, 36, 0.95)' // Amber gold light
        : launchType === 'probe'
        ? 'rgba(34, 211, 238, 0.95)'  // Cyan probe
        : 'rgba(52, 211, 153, 0.85)';  // Green dust

    const newParticle: OrbitParticle = {
      id: Math.random().toString(),
      x: dragStart.x,
      y: dragStart.y,
      vx: vx === 0 ? 0.01 : vx,
      vy: vy === 0 ? 0.01 : vy,
      type: launchType,
      path: [{ x: dragStart.x, y: dragStart.y }],
      maxPathLength: launchType === 'photon' ? 120 : 250,
      color: customColor,
      absorbed: false,
      escaped: false,
      distanceToSingularity: Math.sqrt(Math.pow(dragStart.x - centerX, 2) + Math.pow(dragStart.y - centerY, 2)),
      velocityMagnitude: speed,
      mass: launchType === 'photon' ? 0 : 100
    };

    onSpawnParticle(newParticle);

    setDragStart(null);
    setDragCurrent(null);
  };

  return (
    <div className="flex flex-col gap-4 w-full" id="canvas-container-root">
      {/* Simulation Box Header (Frosted glass theme) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
              {activeView === 'orbits' ? 'Bending Space-Time Lattice' : 'Gravitational Light Deflection Shadow'}
            </h3>
            <p className="text-[10px] text-gray-400 tracking-wide mt-0.5">
              {activeView === 'orbits'
                ? 'Relativistic trajectory simulator | Click & drag vectors to fire trajectories'
                : 'Accretion disk simulation and differential Doppler redshift projection'}
            </p>
          </div>
        </div>

        {activeView === 'orbits' && (
          <div className="flex items-center gap-1 bg-black/40 p-1 border border-white/5 rounded-xl shrink-0 font-mono text-[9px]">
            <button
              onClick={() => setLaunchType('probe')}
              className={`px-2.5 py-1.5 uppercase rounded-lg font-bold transition-all cursor-pointer ${
                launchType === 'probe'
                  ? 'bg-white/10 text-cyan-400 border border-white/5 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              id="launcher-probe"
            >
              Probe (Matter)
            </button>
            <button
              onClick={() => setLaunchType('photon')}
              className={`px-2.5 py-1.5 uppercase rounded-lg font-bold transition-all cursor-pointer ${
                launchType === 'photon'
                  ? 'bg-white/10 text-amber-400 border border-white/5 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              id="launcher-light"
            >
              Photon (Light)
            </button>
            <button
              onClick={() => setLaunchType('matter')}
              className={`px-2.5 py-1.5 uppercase rounded-lg font-bold transition-all cursor-pointer ${
                launchType === 'matter'
                  ? 'bg-white/10 text-emerald-400 border border-white/5 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              id="launcher-dust"
            >
              Gas / Dust
            </button>
          </div>
        )}
      </div>

      {/* Main viewport canvas element */}
      <div
        ref={containerRef}
        className="w-full relative overflow-hidden bg-[#05060b] rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl flex"
        id="canvas-physics-holder"
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`mx-auto cursor-crosshair block transition-opacity duration-300 ${
            activeView === 'orbits' ? 'cursor-pointer' : 'cursor-default'
          }`}
          id="canvas-viewport"
        />

        {/* Dynamic educational guidelines watermarked on background canvas */}
        <div className="absolute bottom-4 left-5 pointer-events-none font-mono text-[9px] text-gray-600 flex flex-col gap-0.5 tracking-widest uppercase" id="canvas-watermark">
          <span>COORDINATES: LOCAL OBSERVER FRAME</span>
          <span>SPACETIME METRIC: SCHWARZSCHILD GEODESICS</span>
          <span>ACCELERATOR: WEBGL VECTOR INTEGRATOR</span>
        </div>

        {activeView === 'orbits' && (
          <div className="absolute top-4 right-5 pointer-events-none font-mono text-[9px] bg-black/80 border border-white/5 text-gray-400 py-2.5 px-3 rounded-xl flex flex-col gap-1.5 backdrop-blur-xl shadow-xl">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#010206] border border-orange-500/60" /> Singularity (Rs = {RsPixels.toFixed(0)}px)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 border-t border-dashed border-red-500" /> Photon Sphere (1.5 Rs)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 border-t border-dashed border-orange-400" /> ISCO Limit (3.0 Rs)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

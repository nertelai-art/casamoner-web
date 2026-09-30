import { easeInOutCubic, lerp, segment } from '@/lib/motion/timeline';

/**
 * Escena 2 v2 (spec 002): el pastís entra a la seva foto caminant a
 * trompicons. x i y en % del quadre; rotació en graus (positiu = horari),
 * al voltant de la base del pastís.
 */
export const CAKE_WALK = {
  walk: [0.08, 0.7],
  settle: [0.7, 0.86],
  steps: 7,
  /** Passa en què ensopega (0-based). */
  stumbleStep: 4,
  stepTilt: 6,
  stumbleTilt: 17,
  // la vora esquerra del pastís és al 20 % de la foto: 82 + 20 = 102 % (just fora)
  startX: 82,
  hop: 5,
} as const;

export interface CakeWalkFrame {
  x: number;
  y: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
  /** Escala de l'ombra (1 = a terra). */
  shadow: number;
}

const REST: CakeWalkFrame = { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, shadow: 1 };

export function cakeWalkFrame(progress: number): CakeWalkFrame {
  const [w0, w1] = CAKE_WALK.walk;
  const [, s1] = CAKE_WALK.settle;

  if (progress < w0) return { ...REST, x: CAKE_WALK.startX };

  if (progress < w1) {
    const walked = segment(progress, w0, w1) * CAKE_WALK.steps;
    const step = Math.min(Math.floor(walked), CAKE_WALK.steps - 1);
    const t = walked - step;
    const arc = Math.sin(Math.PI * t);
    const stumbling = step === CAKE_WALK.stumbleStep;
    // Cada passa avança amb un impuls; entre passes hi ha un instant quiet.
    const advance = (step + easeInOutCubic(t)) / CAKE_WALK.steps;
    const side = step % 2 === 0 ? -1 : 1;
    const tilt = stumbling
      ? // s'abalança endavant de cop i es redreça a poc a poc
        -CAKE_WALK.stumbleTilt * Math.sin(Math.PI * Math.min(1, t * 1.6)) ** 0.7 * (1 - t * 0.3)
      : side * CAKE_WALK.stepTilt * arc;
    const hop = (stumbling ? 0.45 : 1) * CAKE_WALK.hop * arc;
    return {
      x: lerp(CAKE_WALK.startX, 0, advance),
      y: -hop,
      rotate: tilt,
      scaleX: 1 - 0.03 * arc,
      scaleY: 1 + 0.04 * arc,
      shadow: 1 - 0.35 * arc,
    };
  }

  if (progress < s1) {
    // Aterra: s'aixafa i rebota, cada cop menys.
    const t = segment(progress, w1, s1);
    const squash = 0.14 * Math.exp(-3.5 * t) * Math.cos(3 * Math.PI * t) * (1 - t);
    return { ...REST, scaleY: 1 - squash, scaleX: 1 + squash * 0.6 };
  }

  return REST;
}

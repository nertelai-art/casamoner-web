import { createPrng } from '@/lib/motion/prng';
import { lerp, quantize, segment } from '@/lib/motion/timeline';
import { REST, type LayerState } from './layer';

/**
 * Escena 2 (spec 002): el pastís entra des de dalt a la dreta a trompicons,
 * com una pel·lícula antiga, i en aturar-se recupera el color.
 */
export const OLD_FILM_PHASES = {
  leader: [0, 0.14],
  entry: [0.14, 0.72],
  colour: [0.76, 0.9],
  title: [0.8, 0.94],
} as const;

export interface OldFilmConfig {
  /** Fotogrames de l'entrada: com menys, més a salts. */
  frames: number;
  seed: number;
}

export interface OldFilmFrame {
  /** Compte enrere de la cua de pel·lícula (3, 2, 1) o null. */
  leader: number | null;
  card: LayerState;
  sepia: number;
  contrast: number;
  brightness: number;
  grain: number;
  title: number;
}

// Trajectòria amb aturades: l'objecte avança, s'encalla i torna a avançar.
const STUMBLE: readonly (readonly [number, number])[] = [
  [0, 0],
  [0.18, 0.28],
  [0.3, 0.3],
  [0.5, 0.6],
  [0.62, 0.63],
  [0.85, 0.96],
  [1, 1],
];

function stumble(t: number): number {
  for (let i = 1; i < STUMBLE.length; i++) {
    const [x1, y1] = STUMBLE[i]!;
    const [x0, y0] = STUMBLE[i - 1]!;
    if (t <= x1) return lerp(y0, y1, segment(t, x0, x1));
  }
  return 1;
}

const START = { x: 36, y: -50, rotate: 16, scale: 0.72 };

export function oldFilmFrame(progress: number, { frames, seed }: OldFilmConfig): OldFilmFrame {
  const [l0, l1] = OLD_FILM_PHASES.leader;
  const leaderT = segment(progress, l0, l1);
  const leader = progress < l1 ? 3 - Math.min(2, Math.floor(leaderT * 3)) : null;

  const q = quantize(segment(progress, ...OLD_FILM_PHASES.entry), frames);
  const frameIndex = Math.round(q * frames);
  const rand = createPrng(seed * 1000 + frameIndex);
  const shake = 1 - q;

  let card: LayerState;
  if (q === 1) {
    card = REST;
  } else {
    const pos = stumble(q);
    card = {
      opacity: progress < l1 ? 0 : 1,
      x: lerp(START.x, 0, pos) + (rand() - 0.5) * 6 * shake,
      y: lerp(START.y, 0, pos) + (rand() - 0.5) * 6 * shake,
      rotate: lerp(START.rotate, 0, pos) + (rand() - 0.5) * 4 * shake,
      scale: lerp(START.scale, 1, pos),
    };
  }

  const colour = segment(progress, ...OLD_FILM_PHASES.colour);
  const flicker = colour === 1 ? 0 : (createPrng(seed + Math.floor(progress * 90))() - 0.5) * 0.24;

  return {
    leader,
    card,
    sepia: 1 - colour,
    contrast: lerp(1.35, 1, colour),
    brightness: 1 + flicker * (1 - colour),
    grain: lerp(0.4, 0.1, colour),
    title: segment(progress, ...OLD_FILM_PHASES.title),
  };
}

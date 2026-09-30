import { createPrng } from '@/lib/motion/prng';
import { easeOutBack, easeOutBounce, easeOutCubic, lerp, segment } from '@/lib/motion/timeline';
import { HIDDEN, type LayerState } from './layer';

/**
 * Escena 3 (spec 002 v2): apareix el panettone, cauen els cítrics i després els
 * trossets de fruita confitada. Els intervals no se solapen (A-2, A-3).
 */
export const CITRUS_PHASES = {
  panettone: [0.04, 0.26],
  citrus: [0.28, 0.62],
  crumbs: [0.64, 0.92],
} as const;

const CITRUS_DURATION = 0.14;
const CRUMB_DURATION = 0.1;

export interface CitrusConfig {
  citrusCount: number;
  crumbCount: number;
  seed: number;
}

export interface CitrusFrame {
  panettone: LayerState;
  citrus: LayerState[];
  crumbs: LayerState[];
}

interface Drop {
  start: number;
  fromY: number;
  fromX: number;
  fromRotate: number;
}

// Els paràmetres aleatoris es calculen una sola vegada per configuració.
const dropsCache = new Map<string, { citrus: Drop[]; crumbs: Drop[] }>();

function dropsFor({ citrusCount, crumbCount, seed }: CitrusConfig) {
  const key = `${citrusCount}:${crumbCount}:${seed}`;
  const cached = dropsCache.get(key);
  if (cached) return cached;

  const rand = createPrng(seed);
  const [c0, c1] = CITRUS_PHASES.citrus;
  const citrusStagger = citrusCount > 1 ? (c1 - c0 - CITRUS_DURATION) / (citrusCount - 1) : 0;
  const citrus = Array.from({ length: citrusCount }, (_, i) => ({
    start: c0 + i * citrusStagger,
    fromY: -(110 + rand() * 50),
    fromX: (rand() - 0.5) * 16,
    fromRotate: (rand() - 0.5) * 120,
  }));

  const [k0, k1] = CITRUS_PHASES.crumbs;
  const crumbs = Array.from({ length: crumbCount }, () => ({
    start: k0 + rand() * (k1 - k0 - CRUMB_DURATION),
    fromY: -(25 + rand() * 45),
    fromX: (rand() - 0.5) * 6,
    fromRotate: (rand() - 0.5) * 70,
  }));

  const drops = { citrus, crumbs };
  dropsCache.set(key, drops);
  return drops;
}

function fall(progress: number, drop: Drop, duration: number): LayerState {
  const t = segment(progress, drop.start, drop.start + duration);
  if (t === 0) return HIDDEN;
  const drop01 = easeOutBounce(t);
  const settle = easeOutCubic(t);
  return {
    opacity: segment(t, 0, 0.15),
    x: t === 1 ? 0 : lerp(drop.fromX, 0, settle),
    y: t === 1 ? 0 : lerp(drop.fromY, 0, drop01),
    rotate: t === 1 ? 0 : lerp(drop.fromRotate, 0, settle),
    scale: 1,
  };
}

export function citrusFrame(progress: number, config: CitrusConfig): CitrusFrame {
  const drops = dropsFor(config);
  const [m0, m1] = CITRUS_PHASES.panettone;
  const m = segment(progress, m0, m1);

  const panettone: LayerState =
    m === 0
      ? HIDDEN
      : {
          opacity: segment(m, 0, 0.3),
          x: 0,
          y: m === 1 ? 0 : lerp(14, 0, easeOutCubic(m)),
          rotate: 0,
          scale: m === 1 ? 1 : lerp(0.25, 1, easeOutBack(m)),
        };

  return {
    panettone,
    citrus: drops.citrus.map((d) => fall(progress, d, CITRUS_DURATION)),
    crumbs: drops.crumbs.map((d) => fall(progress, d, CRUMB_DURATION)),
  };
}

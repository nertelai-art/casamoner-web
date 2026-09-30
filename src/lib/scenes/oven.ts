import { easeInOutCubic, easeOutBack, lerp, segment } from '@/lib/motion/timeline';

/**
 * Escena 3 (spec 002): les barres fermenten (s'inflen de dalt a baix), entren
 * al forn (resplendor, calor, es dauren) i surten fumejant.
 */
export const OVEN_PHASES = {
  proof: [0.04, 0.5],
  heat: [0.46, 0.92],
  temperature: [0.5, 0.75],
  steam: [0.82, 0.96],
} as const;

const RISE_DURATION = 0.22;

export type OvenStage = 'fermentacio' | 'forn' | 'acabat';

export interface LoafState {
  /** 0–1: quant ha fermentat. */
  rise: number;
  /** 0–1: quant s'ha daurat. */
  golden: number;
  scaleY: number;
  scaleX: number;
  saturate: number;
  brightness: number;
}

export interface OvenFrame {
  loaves: LoafState[];
  glow: number;
  shimmer: number;
  steam: number;
  gauge: { hours: number; celsius: number };
  stage: OvenStage;
}

export function ovenFrame(progress: number, loafCount: number): OvenFrame {
  const [p0, p1] = OVEN_PHASES.proof;
  const stagger = loafCount > 1 ? (p1 - p0 - RISE_DURATION) / (loafCount - 1) : 0;

  const loaves = Array.from({ length: loafCount }, (_, i): LoafState => {
    const riseStart = p0 + i * stagger;
    const riseEnd = riseStart + RISE_DURATION;
    const rise = segment(progress, riseStart, riseEnd);
    const goldenStart = Math.max(riseEnd, OVEN_PHASES.heat[0] + 0.04) + i * 0.03;
    const golden = segment(progress, goldenStart, goldenStart + 0.22);
    return {
      rise,
      golden,
      scaleY: lerp(0.5, 1, easeOutBack(rise)),
      scaleX: lerp(0.94, 1, rise),
      saturate: lerp(0.45, 1, golden),
      brightness: lerp(1.12, 1, golden),
    };
  });

  const heat = segment(progress, ...OVEN_PHASES.heat);
  const glow = Math.sin(Math.PI * easeInOutCubic(heat));

  return {
    loaves,
    glow,
    shimmer: glow * 0.8,
    steam: segment(progress, ...OVEN_PHASES.steam),
    gauge: {
      hours: Math.round(24 * segment(progress, p0, p1)),
      celsius: Math.round(lerp(20, 240, segment(progress, ...OVEN_PHASES.temperature))),
    },
    stage: progress < p1 ? 'fermentacio' : progress < OVEN_PHASES.steam[0] ? 'forn' : 'acabat',
  };
}

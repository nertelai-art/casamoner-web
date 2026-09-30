import { easeInOutCubic, easeOutCubic, lerp, segment } from '@/lib/motion/timeline';

/** Escena 1 v3 (spec 002): pastar → forn → pa acabat, amb fotos reals. */
export const BAKERY_PHASES = {
  knead: [0, 0.32],
  oven: [0.28, 0.42],
  heat: [0.42, 0.76],
  close: [0.76, 0.84],
  loaf: [0.84, 0.94],
  steam: [0.88, 0.98],
} as const;

export interface BakeryFrame {
  /** Zoom lent sobre la foto de pastar (escalar). */
  kneadZoom: number;
  /** 0–1: obertura de la porta del forn (cercle que revela les safates). */
  oven: number;
  /** Resplendor i onada de calor. */
  heat: number;
  ovenZoom: number;
  /** 0–1: el forn es tanca i desapareix. */
  close: number;
  /** 0–1: el pa apareix i s'assenta. */
  loaf: number;
  loafScale: number;
  steam: number;
  stage: 0 | 1 | 2;
}

export function bakeryFrame(progress: number): BakeryFrame {
  const P = BAKERY_PHASES;
  const heat = segment(progress, ...P.heat);
  const loaf = easeOutCubic(segment(progress, ...P.loaf));
  return {
    kneadZoom: 1 + 0.18 * easeInOutCubic(segment(progress, ...P.knead)),
    oven: easeInOutCubic(segment(progress, ...P.oven)),
    heat: heat === 1 ? 0 : Math.sin(Math.PI * easeInOutCubic(heat)),
    ovenZoom: 1 + 0.2 * easeInOutCubic(segment(progress, P.oven[0], P.close[1])),
    close: easeInOutCubic(segment(progress, ...P.close)),
    loaf,
    loafScale: lerp(1.25, 1, loaf),
    steam: segment(progress, ...P.steam),
    stage: progress < P.heat[0] ? 0 : progress < P.close[1] ? 1 : 2,
  };
}

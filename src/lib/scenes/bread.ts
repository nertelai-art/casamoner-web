import { easeInOutCubic, easeOutBack, easeOutCubic, lerp, segment } from '@/lib/motion/timeline';

/** Escena 1 v2 (spec 002): la barra fermenta, es cou i fumeja. Model pur per a la vista 3D. */
export const BREAD_PHASES = {
  proof: [0.04, 0.42],
  heat: [0.44, 0.9],
  bake: [0.48, 0.84],
  steam: [0.84, 0.96],
} as const;

export interface BreadFrame {
  /** 0–1: quant ha fermentat. */
  rise: number;
  /** Alçada relativa de la massa (pot passar d'1 un moment, com quan la massa "salta"). */
  height: number;
  /** 0–1: de color massa a crosta torrada. */
  golden: number;
  /** 0–1: obertura de les greixes. */
  scoreOpen: number;
  glow: number;
  steam: number;
  /** Pas del text: 0 fermentació, 1 forn, 2 acabat. */
  stage: 0 | 1 | 2;
}

export function breadFrame(progress: number): BreadFrame {
  const rise = easeOutCubic(segment(progress, ...BREAD_PHASES.proof));
  const golden = easeInOutCubic(segment(progress, ...BREAD_PHASES.bake));
  const heat = segment(progress, ...BREAD_PHASES.heat);
  return {
    rise,
    height: rise === 1 ? 1 : lerp(0.4, 1, easeOutBack(rise)),
    golden,
    scoreOpen: golden,
    glow: heat === 1 ? 0 : Math.sin(Math.PI * easeInOutCubic(heat)),
    steam: segment(progress, ...BREAD_PHASES.steam),
    stage: progress < BREAD_PHASES.heat[0] ? 0 : progress < BREAD_PHASES.steam[0] ? 1 : 2,
  };
}

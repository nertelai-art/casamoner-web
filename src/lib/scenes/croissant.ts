import { easeInOutCubic, easeOutBounce, easeOutCubic, segment } from '@/lib/motion/timeline';

/** Escena del croissant i el cafè (spec 005). Model pur per a la vista 3D. */
export const CROISSANT_PHASES = {
  plate: [0.02, 0.16],
  croissant: [0.16, 0.36],
  cup: [0.36, 0.5],
  coffee: [0.5, 0.62],
  steam: [0.6, 0.72],
  bite: [0.8, 0.82],
  crumbs: [0.82, 0.94],
} as const;

export interface CroissantFrame {
  plate: number;
  croissant: number;
  cup: number;
  coffee: number;
  steam: number;
  bite: number;
  crumbs: number;
  /** Alçada del croissant sobre el plat (1 = a dalt de tot, 0 = reposant). */
  height: number;
  /** 0–1: el tros mossegat s'aixeca i desapareix. */
  piece: number;
  /** Pas del text: 0 plat i croissant, 1 cafè, 2 mossegada. */
  stage: 0 | 1 | 2;
}

export function croissantFrame(progress: number): CroissantFrame {
  const P = CROISSANT_PHASES;
  const drop = segment(progress, ...P.croissant);
  return {
    plate: easeOutCubic(segment(progress, ...P.plate)),
    croissant: segment(progress, ...P.croissant),
    cup: easeOutCubic(segment(progress, ...P.cup)),
    coffee: easeInOutCubic(segment(progress, ...P.coffee)),
    steam: segment(progress, ...P.steam),
    bite: segment(progress, ...P.bite),
    crumbs: segment(progress, ...P.crumbs),
    height: drop === 1 ? 0 : Math.max(0, 1 - easeOutBounce(drop)),
    piece: easeOutCubic(segment(progress, P.bite[1], P.bite[1] + 0.08)),
    stage: progress < P.cup[0] ? 0 : progress < P.bite[0] - 0.04 ? 1 : 2,
  };
}

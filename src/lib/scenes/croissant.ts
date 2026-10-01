import { easeInOutCubic, easeOutBounce, easeOutCubic, segment } from '@/lib/motion/timeline';

/** Escena de l'esmorzar a la safata (spec 005). Model pur per a la vista. */
export const CROISSANT_PHASES = {
  tray: [0.02, 0.1],
  plate: [0.1, 0.18],
  croissant: [0.18, 0.34],
  cup: [0.34, 0.44],
  coffee: [0.44, 0.54],
  steam: [0.52, 0.62],
  sandwich: [0.6, 0.72],
  juice: [0.72, 0.82],
  bite: [0.88, 0.9],
  crumbs: [0.9, 0.98],
} as const;

export interface CroissantFrame {
  tray: number;
  plate: number;
  croissant: number;
  cup: number;
  coffee: number;
  steam: number;
  /** 0–1: l'entrepà apareix i se serveix. */
  sandwich: number;
  /** Alçada del plat de l'entrepà sobre la safata (1 = a dalt, 0 = reposant). */
  sandwichHeight: number;
  juice: number;
  bite: number;
  crumbs: number;
  /** Alçada del croissant sobre el plat (1 = a dalt de tot, 0 = reposant). */
  height: number;
  /** 0–1: el tros mossegat s'aixeca i desapareix. */
  piece: number;
  /** Pas del text: 0 croissant, 1 cafè, 2 entrepà i suc, 3 mossegada. */
  stage: 0 | 1 | 2 | 3;
}

export function croissantFrame(progress: number): CroissantFrame {
  const P = CROISSANT_PHASES;
  const drop = segment(progress, ...P.croissant);
  const serve = segment(progress, ...P.sandwich);
  return {
    tray: easeOutCubic(segment(progress, ...P.tray)),
    plate: easeOutCubic(segment(progress, ...P.plate)),
    croissant: segment(progress, ...P.croissant),
    cup: easeOutCubic(segment(progress, ...P.cup)),
    coffee: easeInOutCubic(segment(progress, ...P.coffee)),
    steam: segment(progress, ...P.steam),
    sandwich: serve,
    sandwichHeight: 1 - easeOutCubic(serve),
    juice: easeOutCubic(segment(progress, ...P.juice)),
    bite: segment(progress, ...P.bite),
    crumbs: segment(progress, ...P.crumbs),
    height: drop === 1 ? 0 : Math.max(0, 1 - easeOutBounce(drop)),
    piece: easeOutCubic(segment(progress, P.bite[1], P.bite[1] + 0.08)),
    stage: progress < P.cup[0] ? 0 : progress < P.sandwich[0] ? 1 : progress < P.bite[0] - 0.03 ? 2 : 3,
  };
}

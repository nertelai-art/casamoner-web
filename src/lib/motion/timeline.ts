/** Primitives pures per construir línies de temps lligades a un progrés 0–1. */

export const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

/** Progrés local 0–1 dins de [start, end] (M-1). */
export function segment(progress: number, start: number, end: number): number {
  if (end <= start) return progress >= start ? 1 : 0;
  return clamp((progress - start) / (end - start));
}

/** Arrodoneix cap avall a `frames` fotogrames (M-2). */
export function quantize(progress: number, frames: number): number {
  if (progress >= 1) return 1;
  return Math.floor(clamp(progress) * frames) / frames;
}

export type Easing = (t: number) => number;

export const easeOutCubic: Easing = (t) => 1 - (1 - t) ** 3;

export const easeInOutCubic: Easing = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

export const easeOutBack: Easing = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

export const easeOutBounce: Easing = (t) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

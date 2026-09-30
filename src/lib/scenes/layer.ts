/**
 * Estat d'una capa d'escena en un fotograma. Translacions en % de la mida de
 * l'escenari, rotació en graus. La vista el tradueix a `transform`/`opacity`.
 */
export interface LayerState {
  readonly opacity: number;
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly rotate: number;
}

export const REST: LayerState = { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 };
export const HIDDEN: LayerState = { ...REST, opacity: 0 };

const EPSILON = 1e-6;

/** Sense translació, rotació ni escala (M-5). No mira l'opacitat. */
export const isAtRest = (s: LayerState): boolean =>
  Math.abs(s.x) < EPSILON && Math.abs(s.y) < EPSILON && Math.abs(s.rotate) < EPSILON && Math.abs(s.scale - 1) < EPSILON;

export const toTransform = (s: LayerState): string =>
  `translate3d(${s.x.toFixed(3)}%, ${s.y.toFixed(3)}%, 0) rotate(${s.rotate.toFixed(3)}deg) scale(${s.scale.toFixed(4)})`;

import { clamp } from './timeline';

/**
 * Progrés 0–1 d'un contenidor alt amb un escenari `sticky` a dins: 0 quan el
 * contenidor toca la part de dalt de la finestra, 1 quan se n'acaba el recorregut.
 */
export function scrollProgress(rect: { top: number; height: number }, viewportHeight: number, offsetTop = 0): number {
  const travel = rect.height - (viewportHeight - offsetTop);
  if (travel <= 0) return 1;
  return clamp((offsetTop - rect.top) / travel);
}

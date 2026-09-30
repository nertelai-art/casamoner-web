/**
 * Clau de color per a fotos de producte sobre fons blanc (s'usa en compilar,
 * a `scripts/scene-layers.ts`). Sense imports amb àlies: Node l'executa directament.
 */

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Com més lluny del blanc (per foscor o per saturació), més opac. El color dels
 * píxels semitransparents es «descontamina» del blanc perquè sobre un fons fosc
 * no quedi halo clar.
 */
export function keyWhite(r: number, g: number, b: number): Rgba {
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  // La foscor pesa poc: el fons té vinyetatge gris i ha de desaparèixer igualment.
  // Els primers 18 punts de saturació són el reflex càlid de la fruita sobre el blanc.
  const distance = Math.max((255 - min) * 0.35, (max - min - 18) * 1.2);
  const alpha = smoothstep(18, 55, distance);
  if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };
  if (alpha === 1) return { r, g, b, a: 255 };
  const un = (c: number) => Math.round(Math.min(255, Math.max(0, (c - (1 - alpha) * 255) / alpha)));
  return { r: un(r), g: un(g), b: un(b), a: Math.round(alpha * 255) };
}

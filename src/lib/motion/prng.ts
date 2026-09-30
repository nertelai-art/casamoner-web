/**
 * Generador pseudoaleatori amb llavor (mulberry32). Les animacions en fan servir
 * perquè cada fotograma sigui reproduïble i provable (M-3).
 */
export function createPrng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededValues(seed: number, count: number): number[] {
  const next = createPrng(seed);
  return Array.from({ length: count }, next);
}

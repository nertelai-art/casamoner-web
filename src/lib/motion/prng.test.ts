import { createPrng, seededValues } from './prng';

describe('prng (M-3)', () => {
  it('is deterministic for the same seed', () => {
    expect(seededValues(42, 5)).toEqual(seededValues(42, 5));
  });

  it('differs between seeds', () => {
    expect(seededValues(1, 5)).not.toEqual(seededValues(2, 5));
  });

  it('returns values in [0, 1)', () => {
    const next = createPrng(7);
    for (let i = 0; i < 1000; i++) {
      const v = next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

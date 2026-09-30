import { CITRUS_PHASES, citrusFrame } from './citrus';
import { isAtRest } from './layer';

const config = { citrusCount: 7, crumbCount: 24, seed: 11 };
const samples = Array.from({ length: 401 }, (_, i) => i / 400);

describe('citrus scene', () => {
  it('A-1 shows no foreground layer at progress 0', () => {
    const f = citrusFrame(0, config);
    expect(f.madeleine.opacity).toBe(0);
    expect(f.citrus.every((l) => l.opacity === 0)).toBe(true);
    expect(f.crumbs.every((l) => l.opacity === 0)).toBe(true);
  });

  it('A-2 the madeleine is fully visible and settled before any citrus starts falling', () => {
    for (const p of samples) {
      const f = citrusFrame(p, config);
      if (f.citrus.some((l) => l.opacity > 0)) {
        expect(f.madeleine.opacity).toBe(1);
        expect(isAtRest(f.madeleine)).toBe(true);
      }
    }
  });

  it('A-3 no crumb starts falling before every citrus has landed', () => {
    for (const p of samples) {
      const f = citrusFrame(p, config);
      if (f.crumbs.some((l) => l.opacity > 0)) {
        expect(f.citrus.every((l) => l.opacity === 1 && isAtRest(l))).toBe(true);
      }
    }
  });

  it('citrus fall from above the frame', () => {
    const start = citrusFrame(CITRUS_PHASES.citrus[0] + 0.005, config);
    const falling = start.citrus.find((l) => l.opacity > 0);
    expect(falling?.y).toBeLessThan(-50);
  });

  it('A-4 / M-5 every layer is at rest at progress 1 and the photo is complete', () => {
    const f = citrusFrame(1, config);
    expect(isAtRest(f.madeleine)).toBe(true);
    expect(f.citrus.every(isAtRest)).toBe(true);
    expect(f.crumbs.every(isAtRest)).toBe(true);
    expect(f.finish).toBe(1);
  });

  it('is deterministic', () => {
    expect(citrusFrame(0.5, config)).toEqual(citrusFrame(0.5, config));
  });
});

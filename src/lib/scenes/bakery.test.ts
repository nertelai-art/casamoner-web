import { BAKERY_PHASES, bakeryFrame } from './bakery';

const samples = Array.from({ length: 401 }, (_, i) => i / 400);

describe('bakery scene (real photos)', () => {
  it('P-1 starts on the kneading photo, with oven and loaf hidden', () => {
    const f = bakeryFrame(0);
    expect(f.oven).toBe(0);
    expect(f.loaf).toBe(0);
    expect(f.stage).toBe(0);
  });

  it('P-2 the oven door is fully open before the heat peaks, and the loaf waits for the oven to close', () => {
    const peak = samples.reduce((best, p) => (bakeryFrame(p).heat > bakeryFrame(best).heat ? p : best), 0);
    expect(bakeryFrame(peak).oven).toBe(1);
    for (const p of samples) {
      const f = bakeryFrame(p);
      if (f.loaf > 0) expect(f.close).toBe(1);
    }
    expect(BAKERY_PHASES.loaf[0]).toBeGreaterThanOrEqual(BAKERY_PHASES.close[1]);
  });

  it('P-3 every zoom is a single scalar that stays close to 1', () => {
    for (const p of samples) {
      const f = bakeryFrame(p);
      for (const z of [f.kneadZoom, f.ovenZoom, f.loafScale]) {
        expect(typeof z).toBe('number');
        expect(z).toBeGreaterThanOrEqual(1);
        expect(z).toBeLessThanOrEqual(1.35);
      }
    }
  });

  it('P-4 ends with the loaf at rest, steaming, and no glow', () => {
    const f = bakeryFrame(1);
    expect(f).toMatchObject({ loaf: 1, loafScale: 1, steam: 1, stage: 2 });
    expect(f.heat).toBeCloseTo(0);
  });

  it('names the stage for the step list', () => {
    expect(bakeryFrame(0.1).stage).toBe(0);
    expect(bakeryFrame((BAKERY_PHASES.heat[0] + BAKERY_PHASES.heat[1]) / 2).stage).toBe(1);
  });
});

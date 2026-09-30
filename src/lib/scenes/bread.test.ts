import { BREAD_PHASES, breadFrame } from './bread';

const samples = Array.from({ length: 401 }, (_, i) => i / 400);

describe('bread scene (3D)', () => {
  it('P-1 starts low and raw', () => {
    const f = breadFrame(0);
    expect(f.height).toBeLessThanOrEqual(0.55);
    expect(f.golden).toBe(0);
  });

  it('P-2 rises monotonically during proofing and reaches full height', () => {
    let previous = 0;
    for (const p of samples.filter((p) => p <= BREAD_PHASES.proof[1])) {
      const { rise } = breadFrame(p);
      expect(rise).toBeGreaterThanOrEqual(previous);
      previous = rise;
    }
    expect(breadFrame(BREAD_PHASES.proof[1]).rise).toBe(1);
  });

  it('P-3 only browns after proofing has finished', () => {
    for (const p of samples) {
      const f = breadFrame(p);
      if (f.golden > 0) expect(f.rise).toBe(1);
    }
  });

  it('P-4 the scores open as the crust browns', () => {
    for (const p of samples) {
      const f = breadFrame(p);
      expect(f.scoreOpen).toBeCloseTo(f.golden, 5);
    }
  });

  it('glows while baking, not before nor after', () => {
    expect(breadFrame(0.1).glow).toBe(0);
    expect(Math.max(...samples.map((p) => breadFrame(p).glow))).toBeGreaterThan(0.9);
  });

  it('P-5 ends fully risen, golden, with steam and no glow', () => {
    const f = breadFrame(1);
    expect(f).toMatchObject({ rise: 1, height: 1, golden: 1, scoreOpen: 1 });
    expect(f.glow).toBeCloseTo(0);
    expect(f.steam).toBe(1);
  });

  it('names the stage for the step list', () => {
    expect(breadFrame(0.1).stage).toBe(0);
    expect(breadFrame(0.6).stage).toBe(1);
    expect(breadFrame(0.98).stage).toBe(2);
  });
});

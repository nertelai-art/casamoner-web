import { ovenFrame } from './oven';

const samples = Array.from({ length: 201 }, (_, i) => i / 200);

describe('oven scene', () => {
  it('P-1 loaves start flat and pale', () => {
    const f = ovenFrame(0, 5);
    expect(f.loaves).toHaveLength(5);
    for (const loaf of f.loaves) {
      expect(loaf.scaleY).toBeLessThanOrEqual(0.6);
      expect(loaf.saturate).toBeLessThan(1);
    }
  });

  it('P-2 loaves rise one after another, top first', () => {
    const f = ovenFrame(0.2, 5);
    const heights = f.loaves.map((l) => l.scaleY);
    expect(heights[0]).toBeGreaterThan(heights[4]!);
    const risingOrder = samples.map((p) => ovenFrame(p, 5).loaves.map((l) => l.rise));
    for (const rises of risingOrder) {
      for (let i = 1; i < rises.length; i++) expect(rises[i]!).toBeLessThanOrEqual(rises[i - 1]!);
    }
  });

  it('P-3 a loaf only turns golden after it has risen', () => {
    for (const p of samples) {
      for (const loaf of ovenFrame(p, 5).loaves) {
        if (loaf.golden > 0) expect(loaf.rise).toBe(1);
      }
    }
  });

  it('P-4 the gauge only moves forward', () => {
    let previous = ovenFrame(0, 5).gauge;
    for (const p of samples) {
      const { gauge } = ovenFrame(p, 5);
      expect(gauge.hours).toBeGreaterThanOrEqual(previous.hours);
      expect(gauge.celsius).toBeGreaterThanOrEqual(previous.celsius);
      previous = gauge;
    }
    expect(ovenFrame(0, 5).gauge).toEqual({ hours: 0, celsius: 20 });
    expect(ovenFrame(1, 5).gauge).toEqual({ hours: 24, celsius: 240 });
  });

  it('P-5 the photo is untouched at progress 1', () => {
    for (const loaf of ovenFrame(1, 5).loaves) {
      expect(loaf).toMatchObject({ scaleY: 1, scaleX: 1, saturate: 1, brightness: 1 });
    }
    expect(ovenFrame(1, 5).glow).toBeCloseTo(0);
  });

  it('the oven glows in the middle of the bake', () => {
    const peak = Math.max(...samples.map((p) => ovenFrame(p, 5).glow));
    expect(peak).toBeGreaterThan(0.9);
  });

  it('names the current stage', () => {
    expect(ovenFrame(0.1, 5).stage).toBe('fermentacio');
    expect(ovenFrame(0.65, 5).stage).toBe('forn');
    expect(ovenFrame(0.97, 5).stage).toBe('acabat');
  });
});

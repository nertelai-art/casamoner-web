import { clamp, easeOutBack, easeOutBounce, easeOutCubic, lerp, quantize, segment } from './timeline';

describe('timeline', () => {
  it('clamp limits a value to a range', () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('lerp interpolates linearly', () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 0.5)).toBe(15);
    expect(lerp(10, 20, 1)).toBe(20);
  });

  describe('segment (M-1)', () => {
    it('is 0 before the interval and 1 after it', () => {
      expect(segment(0.1, 0.2, 0.6)).toBe(0);
      expect(segment(0.9, 0.2, 0.6)).toBe(1);
    });

    it('maps the interval to 0..1', () => {
      expect(segment(0.4, 0.2, 0.6)).toBeCloseTo(0.5);
    });

    it('treats an empty interval as a step', () => {
      expect(segment(0.49, 0.5, 0.5)).toBe(0);
      expect(segment(0.5, 0.5, 0.5)).toBe(1);
    });
  });

  describe('quantize (M-2)', () => {
    it('floors progress to n frames', () => {
      expect(quantize(0.26, 4)).toBe(0.25);
      expect(quantize(0.49, 4)).toBe(0.25);
      expect(quantize(0.5, 4)).toBe(0.5);
    });

    it('keeps the end exactly at 1', () => {
      expect(quantize(1, 7)).toBe(1);
    });
  });

  it.each([
    ['easeOutCubic', easeOutCubic],
    ['easeOutBack', easeOutBack],
    ['easeOutBounce', easeOutBounce],
  ])('%s starts at 0 and ends at 1', (_, ease) => {
    expect(ease(0)).toBeCloseTo(0);
    expect(ease(1)).toBeCloseTo(1);
  });

  it('easeOutBack overshoots before settling', () => {
    const samples = Array.from({ length: 50 }, (_, i) => easeOutBack(i / 49));
    expect(Math.max(...samples)).toBeGreaterThan(1);
  });
});

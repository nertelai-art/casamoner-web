import { biteCircles } from './bite';

describe('biteCircles (forma d’una mossegada)', () => {
  const bite = { cx: 100, cy: 100, r: 50, facing: Math.PI, teeth: 7 };
  const circles = biteCircles(bite);

  it('is the main bite plus one bump per tooth', () => {
    expect(circles).toHaveLength(8);
    expect(circles[0]).toEqual({ cx: 100, cy: 100, r: 50 });
  });

  it('places the teeth on the edge that faces the food', () => {
    for (const t of circles.slice(1)) {
      const d = Math.hypot(t.cx - 100, t.cy - 100);
      expect(d).toBeCloseTo(50, 5);
      // facing = π (cap a l'esquerra): totes les dents a la meitat esquerra
      expect(t.cx).toBeLessThan(100);
    }
  });

  it('spreads the teeth symmetrically around the facing direction', () => {
    const ys = circles.slice(1).map((t) => t.cy - 100).sort((a, b) => a - b);
    expect(ys[0]!).toBeCloseTo(-ys.at(-1)!, 5);
  });

  it('is deterministic', () => {
    expect(biteCircles(bite)).toEqual(circles);
  });
});

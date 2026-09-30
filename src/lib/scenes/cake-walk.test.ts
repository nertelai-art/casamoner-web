import layers from '@/data/scenes/layers.json';
import { CAKE_WALK, cakeWalkFrame } from './cake-walk';

// Vora esquerra i dreta del pastís dins la foto, en %.
const CAKE_LEFT = (layers.cake.cake.x / layers.cake.width) * 100;

const samples = Array.from({ length: 801 }, (_, i) => i / 800);
const [w0, w1] = CAKE_WALK.walk;

describe('cake walk scene', () => {
  it('C-1 starts just outside the frame, to the right', () => {
    const x = cakeWalkFrame(0).x;
    expect(x + CAKE_LEFT).toBeGreaterThanOrEqual(100);
    // …però no gaire més enllà: al primer pas ja ha de treure el cap.
    expect(x + CAKE_LEFT).toBeLessThan(110);
  });

  it('C-2 walks in steps: feet touch the ground between steps and lift during them', () => {
    const lifts = [];
    for (let s = 0; s < CAKE_WALK.steps; s++) {
      const start = w0 + ((w1 - w0) * s) / CAKE_WALK.steps;
      const mid = w0 + ((w1 - w0) * (s + 0.5)) / CAKE_WALK.steps;
      expect(cakeWalkFrame(start).y).toBeCloseTo(0, 5);
      lifts.push(cakeWalkFrame(mid).y);
    }
    for (const y of lifts) expect(y).toBeLessThan(0);
  });

  it('x only moves towards the resting place', () => {
    let previous = Infinity;
    for (const p of samples) {
      const { x } = cakeWalkFrame(p);
      expect(x).toBeLessThanOrEqual(previous + 1e-9);
      previous = x;
    }
  });

  it('C-3 stumbles once, leaning further than a normal step', () => {
    const tilts = samples.filter((p) => p > w0 && p < w1).map((p) => Math.abs(cakeWalkFrame(p).rotate));
    const stumble = Math.max(...tilts);
    expect(stumble).toBeGreaterThan(CAKE_WALK.stepTilt * 1.8);
  });

  it('C-4 squashes on landing, then recovers', () => {
    const landing = samples.filter((p) => p > w1 && p < CAKE_WALK.settle[1]).map((p) => cakeWalkFrame(p).scaleY);
    expect(Math.min(...landing)).toBeLessThan(0.95);
    expect(cakeWalkFrame(1).scaleY).toBe(1);
  });

  it('C-5 ends exactly in place, untouched', () => {
    expect(cakeWalkFrame(1)).toMatchObject({ x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1 });
  });

  it('C-6 the shadow follows and shrinks while airborne', () => {
    const grounded = cakeWalkFrame(w0);
    const airborne = cakeWalkFrame(w0 + (w1 - w0) / CAKE_WALK.steps / 2);
    expect(airborne.shadow).toBeLessThan(grounded.shadow);
    expect(cakeWalkFrame(1).shadow).toBe(1);
  });
});

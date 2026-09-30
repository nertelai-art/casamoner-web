import { CROISSANT_PHASES, croissantFrame } from './croissant';

const samples = Array.from({ length: 401 }, (_, i) => i / 400);

describe('croissant & coffee scene (3D)', () => {
  it('K-1 phases run in order: plate → croissant → cup → coffee → steam → bite', () => {
    const order = ['plate', 'croissant', 'cup', 'coffee', 'steam', 'bite'] as const;
    for (let i = 1; i < order.length; i++) {
      expect(CROISSANT_PHASES[order[i]!][0]).toBeGreaterThanOrEqual(CROISSANT_PHASES[order[i - 1]!][0]);
    }
    // cada peça s'ha assentat abans que aparegui la següent
    expect(CROISSANT_PHASES.croissant[0]).toBeGreaterThanOrEqual(CROISSANT_PHASES.plate[1]);
    expect(CROISSANT_PHASES.cup[0]).toBeGreaterThanOrEqual(CROISSANT_PHASES.croissant[1]);
    expect(CROISSANT_PHASES.bite[0]).toBeGreaterThanOrEqual(CROISSANT_PHASES.steam[0]);
  });

  it('K-2 shows nothing at 0 and the full breakfast at 1', () => {
    const start = croissantFrame(0);
    expect([start.plate, start.croissant, start.cup, start.coffee, start.steam, start.bite]).toEqual([0, 0, 0, 0, 0, 0]);
    const end = croissantFrame(1);
    expect([end.plate, end.croissant, end.cup, end.coffee, end.steam, end.bite]).toEqual([1, 1, 1, 1, 1, 1]);
  });

  it('K-3 coffee level only grows', () => {
    let previous = 0;
    for (const p of samples) {
      const { coffee } = croissantFrame(p);
      expect(coffee).toBeGreaterThanOrEqual(previous);
      previous = coffee;
    }
  });

  it('K-4 the bite is a single quick snap and crumbs fall afterwards', () => {
    const [b0, b1] = CROISSANT_PHASES.bite;
    expect(b1 - b0).toBeLessThanOrEqual(0.03);
    for (const p of samples) {
      const f = croissantFrame(p);
      if (f.crumbs > 0) expect(f.bite).toBe(1);
    }
  });
});

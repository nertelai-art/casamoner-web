import { bandMask, clipPath, featherMask, gridTiles, shapeOrigin } from './shapes';

const size = { width: 2000, height: 1000 };

describe('shapes', () => {
  it('converts an ellipse in pixels to a CSS ellipse in %', () => {
    expect(clipPath({ kind: 'ellipse', cx: 500, cy: 250, rx: 100, ry: 50 }, size)).toBe(
      'ellipse(5% 5% at 25% 25%)',
    );
  });

  it('converts a polygon', () => {
    expect(
      clipPath({ kind: 'polygon', points: [[0, 0], [1000, 0], [1000, 500]] }, size),
    ).toBe('polygon(0% 0%, 50% 0%, 50% 50%)');
  });

  it('converts a rectangle to inset()', () => {
    expect(clipPath({ kind: 'rect', x: 200, y: 100, w: 400, h: 200 }, size)).toBe('inset(10% 70% 70% 10%)');
  });

  it('computes the transform origin at the shape centre', () => {
    expect(shapeOrigin({ kind: 'ellipse', cx: 500, cy: 250, rx: 1, ry: 1 }, size)).toBe('25% 25%');
    expect(shapeOrigin({ kind: 'rect', x: 0, y: 0, w: 1000, h: 1000 }, size)).toBe('25% 50%');
    expect(shapeOrigin({ kind: 'polygon', points: [[0, 0], [1000, 0], [1000, 1000], [0, 1000]] }, size)).toBe(
      '25% 50%',
    );
  });

  it('feathers a rectangle into a soft radial mask that overflows the tile', () => {
    expect(featherMask({ kind: 'rect', x: 200, y: 100, w: 400, h: 200 }, size)).toBe(
      'radial-gradient(ellipse 15% 15% at 20% 20%, #000 55%, transparent 100%)',
    );
  });

  it('builds a vertical mask with transparent holes for each band', () => {
    expect(bandMask([{ top: 100, bottom: 200 }, { top: 500, bottom: 600 }], 1000)).toBe(
      'linear-gradient(to bottom, #000 0% 10%, transparent 10% 20%, #000 20% 50%, transparent 50% 60%, #000 60% 100%)',
    );
  });

  it('splits a region into a grid of rectangles', () => {
    const tiles = gridTiles({ x: 0, y: 500, w: 2000, h: 500 }, 4, 2);
    expect(tiles).toHaveLength(8);
    expect(tiles[0]).toEqual({ kind: 'rect', x: 0, y: 500, w: 500, h: 250 });
    expect(tiles[7]).toEqual({ kind: 'rect', x: 1500, y: 750, w: 500, h: 250 });
  });
});

import { scrollProgress } from './scroll';

describe('scrollProgress', () => {
  // Contenidor de 3000 px en una finestra de 1000 px: 2000 px de recorregut enganxat.
  it('is 0 while the container top is still below the viewport top', () => {
    expect(scrollProgress({ top: 400, height: 3000 }, 1000)).toBe(0);
  });

  it('grows while the stage is pinned', () => {
    expect(scrollProgress({ top: -1000, height: 3000 }, 1000)).toBe(0.5);
  });

  it('is 1 once the container has scrolled past', () => {
    expect(scrollProgress({ top: -2500, height: 3000 }, 1000)).toBe(1);
  });

  it('pins below a fixed header: starts when the track reaches the header', () => {
    // capçalera de 100 px: recorregut = 3000 - (1000 - 100) = 2100
    expect(scrollProgress({ top: 100, height: 3000 }, 1000, 100)).toBe(0);
    expect(scrollProgress({ top: -950, height: 3000 }, 1000, 100)).toBe(0.5);
    expect(scrollProgress({ top: -2000, height: 3000 }, 1000, 100)).toBe(1);
  });

  it('is 1 when the container is not taller than the viewport', () => {
    expect(scrollProgress({ top: 0, height: 800 }, 1000)).toBe(1);
  });
});

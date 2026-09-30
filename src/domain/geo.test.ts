import { distanceKm, nearest } from './geo';

const gironaCathedral = { lat: 41.9875, lng: 2.8255 };
const blanes = { lat: 41.6746, lng: 2.7903 };

describe('geo', () => {
  it('computes great-circle distance in km', () => {
    // Girona–Blanes en línia recta ≈ 35 km
    expect(distanceKm(gironaCathedral, blanes)).toBeGreaterThan(33);
    expect(distanceKm(gironaCathedral, blanes)).toBeLessThan(37);
    expect(distanceKm(blanes, blanes)).toBe(0);
  });

  it('returns the n nearest items, closest first, excluding the origin (B-13)', () => {
    const items = [
      { slug: 'origin', coords: gironaCathedral },
      { slug: 'far', coords: blanes },
      { slug: 'near', coords: { lat: 41.985, lng: 2.823 } },
      { slug: 'mid', coords: { lat: 41.96, lng: 2.8 } },
    ];
    const result = nearest(items, items[0]!, 2);
    expect(result.map((r) => r.item.slug)).toEqual(['near', 'mid']);
    expect(result[0]!.km).toBeLessThan(1);
  });
});

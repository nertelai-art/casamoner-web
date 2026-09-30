import { ALL_DAYS } from '@/domain/store';
import { storeRepository } from './stores';

const stores = storeRepository.all();

describe('store data', () => {
  it('B-1 has 21 stores with unique slugs', () => {
    expect(stores).toHaveLength(21);
    expect(new Set(stores.map((s) => s.slug)).size).toBe(21);
  });

  it.each(stores.map((s) => [s.slug, s] as const))('B-2 %s has a URL-safe slug', (slug) => {
    expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(stores.map((s) => [s.slug, s] as const))('B-3 %s is inside Girona province', (_, store) => {
    expect(store.coords.lat).toBeGreaterThan(41.6);
    expect(store.coords.lat).toBeLessThan(42.5);
    expect(store.coords.lng).toBeGreaterThan(2.3);
    expect(store.coords.lng).toBeLessThan(3.4);
  });

  it.each(stores.map((s) => [s.slug, s] as const))('B-4 %s has hours for every weekday', (_, store) => {
    const covered = new Set(store.hours.flatMap((slot) => slot.days));
    expect([...covered].sort()).toEqual([...ALL_DAYS]);
    for (const slot of store.hours) {
      expect(slot.opens).toMatch(/^\d{2}:\d{2}$/);
      expect(slot.closes).toMatch(/^\d{2}:\d{2}$/);
      expect(slot.opens < slot.closes).toBe(true);
    }
  });

  it.each(stores.map((s) => [s.slug, s] as const))('%s has an image under /images/botigues', (_, store) => {
    expect(store.image).toMatch(/^\/images\/botigues\/[a-z0-9-]+\.jpg$/);
  });
});

describe('storeRepository (B-8)', () => {
  it('finds a store by slug', () => {
    expect(storeRepository.bySlug('santa-clara')?.name).toBe('Santa Clara');
  });

  it('returns undefined for an unknown slug', () => {
    expect(storeRepository.bySlug('no-existeix')).toBeUndefined();
  });

  it('groups stores by locality, Girona first', () => {
    const groups = storeRepository.byLocality();
    expect([...groups.keys()][0]).toBe('Girona');
    const total = [...groups.values()].reduce((n, list) => n + list.length, 0);
    expect(total).toBe(21);
  });
});

import type { Store } from './store';
import { filterStores } from './store-filter';

const make = (slug: string, locality: string, opens: string, closes: string): Store => ({
  slug,
  name: slug,
  address: { street: 'x', postalCode: '17000', locality },
  image: '/images/botigues/x.jpg',
  ametllerOrigen: false,
  coords: { lat: 42, lng: 2.8 },
  hours: [{ days: [1, 2, 3, 4, 5, 6, 7], opens, closes }],
});

const stores = [
  make('girona-mati', 'Girona', '07:00', '14:00'),
  make('girona-tarda', 'Girona', '15:00', '21:00'),
  make('blanes', 'Blanes', '08:00', '21:00'),
];

// Dimecres 2026-09-30 a les 16:00 de Madrid
const afternoon = new Date('2026-09-30T16:00:00+02:00');

describe('filterStores (B-12)', () => {
  it('filters by locality', () => {
    expect(filterStores(stores, { locality: 'Girona', openOnly: false }, afternoon).map((r) => r.store.slug)).toEqual([
      'girona-tarda',
      'girona-mati',
    ]);
  });

  it('keeps every locality when none is selected', () => {
    expect(filterStores(stores, { locality: null, openOnly: false }, afternoon)).toHaveLength(3);
  });

  it('shows open stores first, keeping the original order otherwise', () => {
    expect(filterStores(stores, { locality: null, openOnly: false }, afternoon).map((r) => r.store.slug)).toEqual([
      'girona-tarda',
      'blanes',
      'girona-mati',
    ]);
  });

  it('can show only open stores', () => {
    expect(filterStores(stores, { locality: null, openOnly: true }, afternoon).map((r) => r.store.slug)).toEqual([
      'girona-tarda',
      'blanes',
    ]);
  });

  it('keeps the original order and unknown status before the clock is known', () => {
    const result = filterStores(stores, { locality: null, openOnly: true }, null);
    expect(result.map((r) => r.store.slug)).toEqual(['girona-mati', 'girona-tarda', 'blanes']);
    expect(result[0]!.status).toBeNull();
  });
});

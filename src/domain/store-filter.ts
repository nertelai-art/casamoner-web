import { describeStatus, type StoreStatus } from './opening-hours';
import type { Store } from './store';

export interface StoreFilter {
  locality: string | null;
  openOnly: boolean;
}

export interface StoreResult {
  store: Store;
  /** null mentre no sabem l'hora (render de servidor). */
  status: StoreStatus | null;
}

/** Filtra per població i posa primer les obertes (B-12). `now` entra per paràmetre. */
export function filterStores(stores: readonly Store[], filter: StoreFilter, now: Date | null): StoreResult[] {
  const results = stores
    .filter((s) => !filter.locality || s.address.locality === filter.locality)
    .map((store) => ({ store, status: now ? describeStatus(store.hours, now) : null }));

  if (!now) return results;

  const visible = filter.openOnly ? results.filter((r) => r.status?.open) : results;
  // sort és estable: dins de cada grup es manté l'ordre original.
  return visible.sort((a, b) => Number(b.status?.open) - Number(a.status?.open));
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { filterStores } from '@/domain/store-filter';
import type { Store } from '@/domain/store';
import { useNow } from '@/lib/hooks/useNow';
import { MapView } from '@/components/map/MapView';
import type { MapMarker } from '@/components/map/types';
import { StatusBadge } from './OpenStatus';
import styles from './StoreFinder.module.css';

interface StoreFinderProps {
  stores: readonly Store[];
  localities: readonly string[];
}

const toMarker = (s: Store): MapMarker => ({
  id: s.slug,
  lat: s.coords.lat,
  lng: s.coords.lng,
  title: `casamoner ${s.name}`,
  subtitle: `${s.address.street} · ${s.address.locality}`,
  href: `/botigues/${s.slug}`,
});

export function StoreFinder({ stores, localities }: StoreFinderProps) {
  const now = useNow();
  const [locality, setLocality] = useState<string | null>(null);
  const [openOnly, setOpenOnly] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const list = useRef<HTMLOListElement>(null);
  const mapWrap = useRef<HTMLDivElement>(null);

  const results = useMemo(() => filterStores(stores, { locality, openOnly }, now), [stores, locality, openOnly, now]);
  const markers = useMemo(() => stores.map(toMarker), [stores]);
  const openCount = now ? results.filter((r) => r.status?.open).length : null;

  const selectFromMap = (id: string) => {
    setSelected(id);
    list.current?.querySelector(`[data-slug="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const selectFromList = (id: string) => {
    setSelected(id);
    // En mòbil el mapa és a sobre de la llista: el portem a la vista.
    if (window.matchMedia('(max-width: 860px)').matches) mapWrap.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className={styles.finder}>
      <div className={styles.controls}>
        <div className={styles.chips} role="group" aria-label="Filtra per població">
          <button type="button" aria-pressed={locality === null} onClick={() => setLocality(null)}>
            Totes
          </button>
          {localities.map((l) => (
            <button key={l} type="button" aria-pressed={locality === l} onClick={() => setLocality(l)}>
              {l}
            </button>
          ))}
        </div>
        <label className={styles.toggle}>
          <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
          <span>Només obertes ara</span>
        </label>
      </div>

      <p className={styles.count} aria-live="polite">
        {results.length} {results.length === 1 ? 'botiga' : 'botigues'}
        {openCount !== null && ` · ${openCount} obertes ara`}
      </p>

      <div className={styles.split}>
        <ol ref={list} className={styles.list}>
          {results.map(({ store, status }) => (
            <li key={store.slug} data-slug={store.slug} data-selected={selected === store.slug}>
              <article className={styles.card}>
                <Image
                  src={store.image}
                  alt={`Botiga casamoner ${store.name}`}
                  width={160}
                  height={120}
                  sizes="96px"
                  className={styles.thumb}
                />
                <div className={styles.body}>
                  <h3 className={styles.name}>
                    <Link href={`/botigues/${store.slug}`} className={styles.stretched}>
                      {store.name}
                    </Link>
                  </h3>
                  <p className={styles.address}>
                    {store.address.street} · {store.address.locality}
                  </p>
                  <StatusBadge status={status} />
                </div>
                <button
                  type="button"
                  className={styles.locate}
                  onClick={() => selectFromList(store.slug)}
                  aria-label={`Mostra ${store.name} al mapa`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                  </svg>
                </button>
              </article>
            </li>
          ))}
        </ol>

        <div ref={mapWrap} className={styles.map}>
          <MapView
            className={styles.mapInner}
            label="Mapa de les botigues casamoner"
            markers={markers}
            selectedId={selected}
            onSelect={selectFromMap}
          />
        </div>
      </div>
    </div>
  );
}

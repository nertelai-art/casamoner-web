'use client';

import { useRouter } from 'next/navigation';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { MapViewProps } from './types';
import styles from './MapView.module.css';

// El proveïdor (Leaflet + OSM) només es descarrega quan el mapa és a prop de la vista (B-11, R-4).
const ProviderMap = lazy(() => import('./leaflet/LeafletMap'));

export function MapView(props: MapViewProps) {
  const router = useRouter();
  const holder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const placeholder = <div className={styles.placeholder}>Carregant el mapa…</div>;

  return (
    <div ref={holder} className={`${styles.map} ${props.className ?? ''}`} role="region" aria-label={props.label}>
      {visible ? (
        <Suspense fallback={placeholder}>
          <ProviderMap onNavigate={(href) => router.push(href)} {...props} />
        </Suspense>
      ) : (
        placeholder
      )}
    </div>
  );
}

'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { MapMarker, MapViewProps } from '../types';
import './leaflet-theme.css';

// Frontera del proveïdor: l'únic lloc de l'app que coneix Leaflet i OpenStreetMap.
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const pinIcon = (selected: boolean) =>
  L.divIcon({
    className: `cm-pin${selected ? ' cm-pin--selected' : ''}`,
    html: '<span></span>',
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36],
  });

const popupHtml = (m: MapMarker) => {
  const external = !m.href.startsWith('/');
  const link = external
    ? `<a href="${escapeHtml(m.href)}" target="_blank" rel="noopener" data-map-link>Com arribar-hi →</a>`
    : `<a href="${escapeHtml(m.href)}" data-map-link>Veure la botiga →</a>`;
  return `<div class="cm-popup"><strong>${escapeHtml(m.title)}</strong><span>${escapeHtml(m.subtitle)}</span>${link}</div>`;
};

export default function LeafletMap({ markers, selectedId, onSelect, onNavigate, center, zoom }: MapViewProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layers = useRef(new Map<string, L.Marker>());
  const callbacks = useRef({ onSelect, onNavigate });

  useEffect(() => {
    callbacks.current = { onSelect, onNavigate };
  });

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const instance = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19, detectRetina: true }).addTo(instance);

    for (const m of markers) {
      const marker = L.marker([m.lat, m.lng], { icon: pinIcon(false), title: m.title, alt: m.title, keyboard: true })
        .bindPopup(popupHtml(m), { closeButton: false, offset: [0, 0] })
        .on('click', () => callbacks.current.onSelect?.(m.id))
        .addTo(instance);
      layers.current.set(m.id, marker);
    }

    if (center) instance.setView([center.lat, center.lng], zoom ?? 15);
    else instance.fitBounds(L.latLngBounds(markers.map((m) => [m.lat, m.lng])), { padding: [36, 36] });

    // Navegació SPA des de l'enllaç de la targeta (B-10).
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-map-link]');
      const href = link?.getAttribute('href');
      if (!href?.startsWith('/') || !callbacks.current.onNavigate || event.metaKey || event.ctrlKey) return;
      event.preventDefault();
      callbacks.current.onNavigate(href);
    };
    // Fase de captura: Leaflet atura la propagació dels clics dins les targetes.
    el.addEventListener('click', onClick, true);
    map.current = instance;
    const markerLayers = layers.current;

    return () => {
      el.removeEventListener('click', onClick, true);
      instance.remove();
      markerLayers.clear();
      map.current = null;
    };
    // Els marcadors es creen un cop; la selecció s'actualitza a l'efecte següent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    for (const [id, marker] of layers.current) marker.setIcon(pinIcon(id === selectedId));
    const selected = selectedId ? layers.current.get(selectedId) : undefined;
    if (selected && map.current) {
      map.current.flyTo(selected.getLatLng(), Math.max(map.current.getZoom(), 14), { duration: 0.8 });
      selected.openPopup();
    }
  }, [selectedId]);

  return <div ref={container} style={{ position: 'absolute', inset: 0 }} />;
}

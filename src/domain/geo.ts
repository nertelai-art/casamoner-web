import type { LatLng } from './store';

const EARTH_RADIUS_KM = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Distància de cercle màxim (haversine). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

interface Located {
  readonly slug: string;
  readonly coords: LatLng;
}

export function nearest<T extends Located>(items: readonly T[], origin: T, count: number) {
  return items
    .filter((item) => item.slug !== origin.slug)
    .map((item) => ({ item, km: distanceKm(origin.coords, item.coords) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count);
}

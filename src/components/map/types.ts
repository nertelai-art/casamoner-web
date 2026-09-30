/** Port del mapa: la resta de l'app no sap quin proveïdor hi ha darrere. */
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  href: string;
}

export interface MapViewProps {
  markers: readonly MapMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Crida en clicar «Veure la botiga» dins la targeta del marcador. */
  onNavigate?: (href: string) => void;
  /** Si no s'indica, s'ajusta per mostrar tots els marcadors. */
  center?: { lat: number; lng: number };
  zoom?: number;
  label: string;
  className?: string;
}

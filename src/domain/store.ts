/** Dia ISO: 1 = dilluns … 7 = diumenge. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Franja horària en hora local de Madrid, `HH:MM`. */
export interface OpeningSlot {
  readonly days: readonly IsoWeekday[];
  readonly opens: string;
  readonly closes: string;
}

export type OpeningHours = readonly OpeningSlot[];

export interface LatLng {
  readonly lat: number;
  readonly lng: number;
}

export interface Store {
  readonly slug: string;
  /** Nom curt, sense la marca: «Santa Clara». */
  readonly name: string;
  readonly subtitle?: string;
  readonly address: {
    readonly street: string;
    readonly postalCode: string;
    readonly locality: string;
  };
  readonly phone?: string;
  readonly image: string;
  readonly ametllerOrigen: boolean;
  readonly coords: LatLng;
  /** Coordenades aproximades, pendents de validar amb el client. */
  readonly approximateLocation?: boolean;
  readonly hours: OpeningHours;
}

/** Port d'accés a les botigues (D de SOLID): la UI no sap d'on surten. */
export interface StoreRepository {
  all(): readonly Store[];
  bySlug(slug: string): Store | undefined;
  byLocality(): ReadonlyMap<string, readonly Store[]>;
}

export const ALL_DAYS: readonly IsoWeekday[] = [1, 2, 3, 4, 5, 6, 7];

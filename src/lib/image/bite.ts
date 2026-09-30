/**
 * Forma d'una mossegada: un cercle gran (la boca) més un bony petit per cada
 * dent, repartits a la vora que mira cap al menjar. S'usa en compilar
 * (`scripts/breakfast-layers.ts`), sense imports amb àlies.
 */
export interface Circle {
  cx: number;
  cy: number;
  r: number;
}

export interface Bite {
  cx: number;
  cy: number;
  r: number;
  /** Angle (radians) cap a on hi ha el menjar, vist des del centre de la mossegada. */
  facing: number;
  teeth: number;
  /** Obertura de l'arc de dents (radians). Per defecte, 140°. */
  spread?: number;
}

export function biteCircles({ cx, cy, r, facing, teeth, spread = (140 * Math.PI) / 180 }: Bite): Circle[] {
  const toothR = r * 0.2;
  const out: Circle[] = [{ cx, cy, r }];
  for (let i = 0; i < teeth; i++) {
    const a = facing - spread / 2 + (spread * i) / Math.max(1, teeth - 1);
    out.push({ cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, r: toothR });
  }
  return out;
}

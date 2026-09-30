/** Formes definides en píxels de la foto original; la vista les passa a `clip-path` en %. */
export type Shape =
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { kind: 'polygon'; points: readonly (readonly [number, number])[] }
  | { kind: 'rect'; x: number; y: number; w: number; h: number };

export type RectShape = Extract<Shape, { kind: 'rect' }>;

export interface Size {
  width: number;
  height: number;
}

const pct = (value: number, total: number) => `${+((value / total) * 100).toFixed(3)}%`;

export function clipPath(shape: Shape, { width, height }: Size): string {
  switch (shape.kind) {
    case 'ellipse':
      return `ellipse(${pct(shape.rx, width)} ${pct(shape.ry, height)} at ${pct(shape.cx, width)} ${pct(shape.cy, height)})`;
    case 'polygon':
      return `polygon(${shape.points.map(([x, y]) => `${pct(x, width)} ${pct(y, height)}`).join(', ')})`;
    case 'rect':
      return `inset(${pct(shape.y, height)} ${pct(width - shape.x - shape.w, width)} ${pct(height - shape.y - shape.h, height)} ${pct(shape.x, width)})`;
  }
}

export function shapeOrigin(shape: Shape, { width, height }: Size): string {
  let cx: number;
  let cy: number;
  if (shape.kind === 'ellipse') [cx, cy] = [shape.cx, shape.cy];
  else if (shape.kind === 'rect') [cx, cy] = [shape.x + shape.w / 2, shape.y + shape.h / 2];
  else {
    const xs = shape.points.map((p) => p[0]);
    const ys = shape.points.map((p) => p[1]);
    cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  }
  return `${pct(cx, width)} ${pct(cy, height)}`;
}

/**
 * Màscara radial difuminada per a una rajola: sobresurt un 50 % perquè les
 * rajoles veïnes se solapin i no es vegin vores rectes mentre cauen.
 */
export function featherMask(rect: RectShape, { width, height }: Size): string {
  const rx = rect.w * 0.75;
  const ry = rect.h * 0.75;
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  return `radial-gradient(ellipse ${pct(rx, width)} ${pct(ry, height)} at ${pct(cx, width)} ${pct(cy, height)}, #000 55%, transparent 100%)`;
}

/** Màscara vertical opaca amb forats transparents a cada franja (ordenades de dalt a baix). */
export function bandMask(bands: readonly { top: number; bottom: number }[], height: number): string {
  const stops: string[] = [];
  let cursor = 0;
  for (const { top, bottom } of bands) {
    stops.push(`#000 ${pct(cursor, height)} ${pct(top, height)}`, `transparent ${pct(top, height)} ${pct(bottom, height)}`);
    cursor = bottom;
  }
  stops.push(`#000 ${pct(cursor, height)} 100%`);
  return `linear-gradient(to bottom, ${stops.join(', ')})`;
}

export function gridTiles(region: { x: number; y: number; w: number; h: number }, cols: number, rows: number): RectShape[] {
  const w = region.w / cols;
  const h = region.h / rows;
  return Array.from({ length: cols * rows }, (_, i) => ({
    kind: 'rect' as const,
    x: region.x + (i % cols) * w,
    y: region.y + Math.floor(i / cols) * h,
    w,
    h,
  }));
}

import { gridTiles, type Shape } from '@/lib/scenes/shapes';

/** Formes en píxels de `dolcos/panettone.jpg` (2000 × 1333). */
export const CITRUS_IMAGE = { src: '/images/dolcos/panettone.jpg', width: 2000, height: 1333 } as const;

export const MADELEINE: Shape = {
  kind: 'polygon',
  points: [
    [668, 650], [676, 560], [706, 478], [756, 416], [826, 362], [918, 322], [1020, 300], [1122, 304],
    [1214, 326], [1294, 366], [1354, 428], [1400, 508], [1422, 600], [1420, 680], [1392, 734],
    [1386, 850], [1374, 948], [1250, 968], [1050, 976], [850, 972], [712, 954], [696, 840], [686, 732],
  ],
};

/** Ordenats per ordre de caiguda: primer els del fons, després els del davant. */
export const CITRUS: readonly Shape[] = [
  { kind: 'ellipse', cx: 795, cy: 150, rx: 165, ry: 175 },
  { kind: 'ellipse', cx: 1590, cy: 300, rx: 168, ry: 172 },
  { kind: 'ellipse', cx: 1850, cy: 262, rx: 180, ry: 170 },
  { kind: 'ellipse', cx: 395, cy: 372, rx: 172, ry: 102 },
  { kind: 'ellipse', cx: 280, cy: 695, rx: 236, ry: 238 },
  { kind: 'ellipse', cx: 1450, cy: 965, rx: 232, ry: 142 },
  { kind: 'ellipse', cx: 575, cy: 1075, rx: 182, ry: 112 },
  { kind: 'ellipse', cx: 1895, cy: 1185, rx: 152, ry: 172 },
];

/** Trossets de fruita confitada: la franja de baix, en rajoles que cauen una a una. */
export const CRUMBS = gridTiles({ x: 0, y: 640, w: 2000, h: 693 }, 12, 4);

export const CONFIG = { citrusCount: CITRUS.length, crumbCount: CRUMBS.length, seed: 11 } as const;

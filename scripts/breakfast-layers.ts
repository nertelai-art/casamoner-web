// Capes de l'escena de la cafeteria (spec 005 v2), a partir de fotos reals
// (docs/CREDITS.md): plat, tassa, cafè, croissant, croissant mossegat, el tros
// que s'arrenca i molles. Ús: pnpm breakfast
import { mkdir, writeFile } from 'node:fs/promises';
import { biteCircles } from '../src/lib/image/bite.ts';
import { keyWhite } from '../src/lib/image/chroma-key.ts';
import { alphaBox, mask, rgb, smoothstep, writeRgba, type Box } from './lib/raster.ts';

const SRC = 'assets-src/stock';
const OUT = 'public/images/scenes/cafeteria';
const URL = '/images/scenes/cafeteria';

type Pt = [number, number];
const circle = (cx: number, cy: number, r: number) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const polygon = (pts: readonly Pt[]) => `<polygon points="${pts.map((p) => p.join(',')).join(' ')}"/>`;
const scalePts = (pts: readonly Pt[], k: number): Pt[] => pts.map(([x, y]) => [Math.round(x * k), Math.round(y * k)]);

interface Sprite {
  src: string;
  /** Mida original (px de la foto) del retall: la vista en fa servir la proporció. */
  w: number;
  h: number;
}

/** Imatge RGBA amb el color de la foto i l'alfa donada. */
function withAlpha(data: Uint8Array, n: number, alpha: (i: number) => number, color?: (i: number) => [number, number, number]) {
  const rgba = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    const a = alpha(i);
    if (a <= 0) continue;
    const [r, g, b] = color ? color(i) : [data[i * 3]!, data[i * 3 + 1]!, data[i * 3 + 2]!];
    rgba.set([r, g, b, Math.round(Math.min(1, a) * 255)], i * 4);
  }
  return rgba;
}

async function save(rgba: Uint8Array, width: number, height: number, box: Box, name: string, scale: number): Promise<Sprite> {
  await writeRgba(rgba, width, height, box, `${OUT}/${name}`, scale);
  return { src: `${URL}/${name}`, w: box.w, h: box.h };
}

// ── Plat ────────────────────────────────────────────────────────────────
async function plate() {
  const { data, width, height } = await rgb(`${SRC}/plat.jpg`);
  const [cx, cy, r] = [1182, 828, 700];
  const m = await mask(width, height, circle(cx, cy, r), 2);
  const rgba = withAlpha(data, width * height, (i) => m[i]! / 255);
  return save(rgba, width, height, { x: cx - r - 4, y: cy - r - 4, w: 2 * r + 8, h: 2 * r + 8 }, 'plat.webp', 0.5);
}

// ── Tassa amb platet ────────────────────────────────────────────────────
async function cup() {
  const { data, width, height } = await rgb(`${SRC}/tassa.jpg`);
  const saucer = { cx: 1238, cy: 858, r: 378 };
  const handle: Pt[] = [
    [870, 1056], [882, 1022], [924, 1006], [972, 998], [1008, 1014], [1020, 1050],
    [996, 1086], [948, 1110], [912, 1122], [882, 1110], [866, 1086],
  ];
  const m = await mask(width, height, circle(saucer.cx, saucer.cy, saucer.r) + polygon(handle), 1.5);
  const rgba = withAlpha(data, width * height, (i) => m[i]! / 255);
  const box = alphaBox(rgba, width, { x: 0, y: 0, w: width, h: height })!;
  const sprite = await save(rgba, width, height, box, 'tassa.webp', 0.7);
  // Interior de la tassa (on hi va el cafè), en fracció de la caixa del retall.
  const interior = { cx: 1230, cy: 854, r: 258 };
  return {
    ...sprite,
    interior: { cx: (interior.cx - box.x) / box.w, cy: (interior.cy - box.y) / box.h, r: interior.r / box.w },
  };
}

// ── Cafè (només la superfície del líquid) ───────────────────────────────
async function coffee() {
  const { data, width, height } = await rgb(`${SRC}/cafe.jpg`);
  const [cx, cy, r] = [1174, 1140, 418];
  const m = await mask(width, height, circle(cx, cy, r), 3);
  const rgba = withAlpha(data, width * height, (i) => m[i]! / 255);
  return save(rgba, width, height, { x: cx - r - 4, y: cy - r - 4, w: 2 * r + 8, h: 2 * r + 8 }, 'cafe.webp', 0.6);
}

// ── Croissant, mossegat, tros i molles ──────────────────────────────────
const CROISSANT: Pt[] = scalePts(
  [
    [760, 1020], [700, 960], [640, 880], [600, 800], [585, 720], [595, 640], [620, 560], [650, 490],
    [690, 455], [760, 440], [830, 452], [900, 450], [990, 440], [1070, 455], [1130, 490], [1180, 530],
    [1220, 580], [1245, 640], [1242, 700], [1215, 750], [1175, 772], [1140, 768], [1128, 745],
    [1105, 722], [1075, 705], [1045, 706], [1000, 720], [960, 742], [928, 765], [900, 805],
    [882, 845], [898, 882], [928, 928], [946, 965], [922, 992], [882, 1016], [832, 1032], [790, 1032],
  ],
  1.2,
);

async function croissant() {
  const { data, width, height } = await rgb(`${SRC}/croissant.jpg`);
  const n = width * height;
  const poly = polygon(CROISSANT);
  // Contorn generós i, dins, fora tot el que sigui gris (plat i ombra).
  const outline = await mask(width, height, `<g stroke="#fff" stroke-width="24" stroke-linejoin="round">${poly}</g>`, 2);
  const core = await mask(width, height, poly, 28);
  const alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * 3]!, g = data[i * 3 + 1]!, b = data[i * 3 + 2]!;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    const inside = core[i]! > 250 ? 1 : 0;
    alpha[i] = (outline[i]! / 255) * Math.max(smoothstep(22, 50, sat), inside);
  }

  // Mossegada a la punta de la dreta, amb les dents cap al cos del croissant.
  const bite = { cx: 1500, cy: 830, r: 130 };
  const facing = Math.atan2(840 - bite.cy, 1080 - bite.cx);
  const circles = biteCircles({ ...bite, facing, teeth: 7 });
  const biteBody = circles.map((c) => circle(c.cx, c.cy, c.r)).join('');
  const hole = await mask(width, height, biteBody, 1.2);
  const rim = await mask(width, height, `<g stroke="#fff" stroke-width="44">${biteBody}</g>${biteBody}`, 3);

  // Textura de l'interior fullat (foto de la molla), en mosaic.
  const molla = await rgb(`${SRC}/molla.jpg`);
  const tex = { x: 992, y: 1120, w: 224, h: 640 };
  const crumbAt = (i: number): [number, number, number] => {
    const x = tex.x + ((i % width) % tex.w);
    const y = tex.y + (Math.floor(i / width) % tex.h);
    const j = (y * molla.width + x) * 3;
    return [molla.data[j]!, molla.data[j + 1]!, molla.data[j + 2]!];
  };

  const box = alphaBox(withAlpha(data, n, (i) => alpha[i]!), width, { x: 0, y: 0, w: width, h: height })!;
  const whole = withAlpha(data, n, (i) => alpha[i]!);
  const bitten = withAlpha(
    data,
    n,
    (i) => alpha[i]! * (1 - hole[i]! / 255),
    (i) => {
      // A la vora de la mossegada es veu l'interior (més clar, fullat) i una mica d'ombra.
      const edge = (rim[i]! / 255) * (1 - hole[i]! / 255);
      if (edge <= 0.02) return [data[i * 3]!, data[i * 3 + 1]!, data[i * 3 + 2]!];
      const [cr, cg, cb] = crumbAt(i);
      const k = Math.min(1, edge * 1.4);
      const shade = 0.82 + 0.18 * k;
      return [
        Math.round((data[i * 3]! * (1 - k) + cr * k) * shade),
        Math.round((data[i * 3 + 1]! * (1 - k) + cg * k) * shade),
        Math.round((data[i * 3 + 2]! * (1 - k) + cb * k) * shade),
      ];
    },
  );
  const piece = withAlpha(data, n, (i) => alpha[i]! * (hole[i]! / 255));

  const scale = 0.6;
  const sprites = {
    croissant: await save(whole, width, height, box, 'croissant.webp', scale),
    mossegat: await save(bitten, width, height, box, 'croissant-mossegat.webp', scale),
    tros: await save(piece, width, height, box, 'croissant-tros.webp', scale),
  };
  return {
    ...sprites,
    bite: { cx: (bite.cx - box.x) / box.w, cy: (bite.cy - box.y) / box.h },
  };
}

async function crumbs() {
  const { data, width, height } = await rgb(`${SRC}/molla.jpg`);
  const n = width * height;
  const boxes: Box[] = [
    { x: 1936, y: 1336, w: 144, h: 112 },
    { x: 2176, y: 1592, w: 104, h: 128 },
    { x: 2024, y: 1640, w: 128, h: 112 },
    { x: 1400, y: 2344, w: 232, h: 136 },
    { x: 2096, y: 1432, w: 80, h: 64 },
  ];
  const keyed = new Uint8Array(n * 4);
  for (const b of boxes)
    for (let y = b.y; y < b.y + b.h; y++)
      for (let x = b.x; x < b.x + b.w; x++) {
        const i = y * width + x;
        const k = keyWhite(data[i * 3]!, data[i * 3 + 1]!, data[i * 3 + 2]!);
        keyed.set([k.r, k.g, k.b, k.a], i * 4);
      }
  const out: Sprite[] = [];
  for (const [i, b] of boxes.entries()) {
    const tight = alphaBox(keyed, width, b);
    if (tight) out.push(await save(keyed, width, height, tight, `molla-${i}.webp`, 0.6));
  }
  return out;
}

await mkdir(OUT, { recursive: true });
const layers = { plate: await plate(), cup: await cup(), coffee: await coffee(), ...(await croissant()), crumbs: await crumbs() };
await writeFile('src/data/scenes/breakfast.json', JSON.stringify(layers, null, 2) + '\n');
console.log('cafeteria:', Object.keys(layers).join(', '), `(${layers.crumbs.length} molles)`);

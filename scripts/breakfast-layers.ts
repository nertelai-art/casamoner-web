// Capes de l'escena de la cafeteria (spec 005 v2), a partir de fotos reals
// (docs/CREDITS.md): safata, plat, tassa, cafè, croissant, croissant mossegat,
// el tros que s'arrenca, molles, entrepà i suc de taronja. Ús: pnpm breakfast
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
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

// ── Safata ──────────────────────────────────────────────────────────────
// L'única peça que no és una foto: una safata llisa de plàstic mat, del verd
// oliva apagat de les cafeteries casamoner. Vora arrodonida i fons enfonsat.
async function tray(): Promise<Sprite> {
  const [w, h, r, lip] = [1600, 980, 110, 46];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#a9b48b"/><stop offset="1" stop-color="#7f8a63"/>
      </linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8f9b70"/><stop offset="1" stop-color="#9aa67b"/>
      </linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
      <clipPath id="in"><rect x="${lip}" y="${lip}" width="${w - 2 * lip}" height="${h - 2 * lip}" rx="${r - lip * 0.6}"/></clipPath>
    </defs>
    <rect width="${w}" height="${h}" rx="${r}" fill="url(#rim)"/>
    <rect x="${lip}" y="${lip}" width="${w - 2 * lip}" height="${h - 2 * lip}" rx="${r - lip * 0.6}" fill="url(#floor)"/>
    <g clip-path="url(#in)" filter="url(#soft)" fill="none">
      <path d="M${lip} ${h - lip} V${lip + r} Q${lip} ${lip} ${lip + r} ${lip} H${w - lip}" stroke="#5c6644" stroke-opacity="0.75" stroke-width="30"/>
      <path d="M${lip} ${h - lip} H${w - lip - r} Q${w - lip} ${h - lip} ${w - lip} ${h - lip - r} V${lip}" stroke="#c3cca8" stroke-opacity="0.6" stroke-width="22"/>
    </g>
    <rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="${r - 5}" fill="none" stroke="#c9d2ad" stroke-opacity="0.55" stroke-width="5"/>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 80, alphaQuality: 80, effort: 6 }).toFile(`${OUT}/safata.webp`);
  return { src: `${URL}/safata.webp`, w, h };
}

// ── Entrepà (retallat del plat de la foto) ───────────────────────────────
const SANDWICH: Pt[] = scalePts(
  [
    [1185, 392], [1240, 358], [1320, 348], [1400, 380], [1500, 436], [1620, 506], [1740, 576], [1822, 636],
    [1860, 700], [1864, 780], [1852, 850], [1812, 902], [1772, 930], [1740, 962], [1690, 974], [1630, 966],
    [1550, 926], [1410, 852], [1330, 802], [1260, 762], [1190, 712], [1138, 674], [1108, 640], [1100, 590],
    [1102, 548], [1140, 486], [1156, 466], [1162, 428],
  ],
  1.2,
);

async function sandwich() {
  const { data, width, height } = await rgb(`${SRC}/entrepa.jpg`);
  const n = width * height;
  const poly = polygon(SANDWICH);
  // Contorn generós i, dins, fora el plat i l'ombra: són freds (blau ≥ vermell),
  // i el pa, l'enciam i el formatge són càlids o verds.
  const outline = await mask(width, height, `<g stroke="#fff" stroke-width="20" stroke-linejoin="round">${poly}</g>`, 2);
  const core = await mask(width, height, poly, 12);
  const alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * 3]!, g = data[i * 3 + 1]!, b = data[i * 3 + 2]!;
    const food = smoothstep(4, 26, Math.max(r, g) - b);
    // A la vora, l'ombra que l'entrepà fa al plat (fosca i gairebé grisa) tampoc hi va.
    const lit = smoothstep(70, 120, (r + g + b) / 3 + 2 * (Math.max(r, g, b) - Math.min(r, g, b)));
    alpha[i] = (outline[i]! / 255) * Math.max(food * lit, core[i]! > 250 ? 1 : 0);
  }
  // La foto és fosca i freda (llum de finestra); se li dona la llum càlida i
  // viva de les altres peces: exposició, una corba que aixeca les ombres i saturació.
  const lit = (i: number): [number, number, number] => {
    const c = [data[i * 3]! * 1.04, data[i * 3 + 1]!, data[i * 3 + 2]! * 0.94].map((v) => 255 * Math.pow(Math.min(1, (v / 255) * 1.3), 0.82));
    const luma = 0.3 * c[0]! + 0.59 * c[1]! + 0.11 * c[2]!;
    return c.map((v) => Math.max(0, Math.min(255, Math.round(luma + (v - luma) * 1.22)))) as [number, number, number];
  };
  const rgba = withAlpha(data, n, (i) => alpha[i]!, lit);
  const box = alphaBox(rgba, width, { x: 0, y: 0, w: width, h: height })!;
  return save(rgba, width, height, box, 'entrepa.webp', 0.6);
}

// ── Suc de taronja (got vist des de dalt) ───────────────────────────────
async function juice() {
  const { data, width, height } = await rgb(`${SRC}/suc.jpg`);
  const glass = { cx: 1310, cy: 818, r: 520 };
  const liquid = { cx: 1300, cy: 816, r: 380 };
  const outer = await mask(width, height, circle(glass.cx, glass.cy, glass.r), 2);
  const inner = await mask(width, height, circle(liquid.cx, liquid.cy, liquid.r), 6);
  // El vidre és translúcid: a la paret del got s'hi ha de veure la safata, no el
  // marbre de la foto. El suc i el seu reflex taronja a la paret, opacs.
  const rgba = withAlpha(data, width * height, (i) => {
    const yellow = smoothstep(30, 110, data[i * 3]! - data[i * 3 + 2]!);
    const wall = Math.max(0.42, yellow);
    return (outer[i]! / 255) * Math.max(inner[i]! / 255, wall);
  });
  const d = glass.r + 4;
  return save(rgba, width, height, { x: glass.cx - d, y: glass.cy - d, w: 2 * d, h: 2 * d }, 'suc.webp', 0.5);
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
const layers = { tray: await tray(), sandwich: await sandwich(), juice: await juice(), plate: await plate(), cup: await cup(), coffee: await coffee(), ...(await croissant()), crumbs: await crumbs() };
await writeFile('src/data/scenes/breakfast.json', JSON.stringify(layers, null, 2) + '\n');
console.log('cafeteria:', Object.keys(layers).join(', '), `(${layers.crumbs.length} molles)`);

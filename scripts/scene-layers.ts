// Genera les capes de les escenes a partir de les fotos del client (spec 002):
//  - Pastís: fons sense el pastís + pastís retallat.
//  - Panettone: cada peça retallada amb fons transparent.
// Ús: pnpm scenes   (sortida a public/images/scenes i src/data/scenes/layers.json)
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { keyWhite } from '../src/lib/image/chroma-key.ts';
import { alphaBox, clampBox, mask, rgb, writeRgba, type Box } from './lib/raster.ts';

const OUT = 'public/images/scenes';
/** Escala de sortida: a pantalla les capes no passen de ~1300 px d'ample. */
const SCALE = 0.65;
type Layer = Box & { src: string };

async function write(rgba: Uint8Array, width: number, height: number, box: Box, file: string): Promise<Layer> {
  await writeRgba(rgba, width, height, box, `${OUT}/${file}`, SCALE);
  return { src: `/images/scenes/${file}`, ...box };
}

// ── Pastís ─────────────────────────────────────────────────────────────────
async function cake() {
  const src = 'public/images/pastissos/formatge-macadamia.jpg';
  const { data, width, height } = await rgb(src);
  // Silueta: el·lipse de dalt + costats + meitat inferior de l'el·lipse de la base.
  const silhouette = `<path d="M269 868 A403 235 0 0 1 1075 868 L1075 1180 A395 110 0 0 1 285 1180 Z"/>`;

  // Fons: la foto té poca profunditat de camp; només la franja del pastís és
  // nítida. Omplim el forat amb fusta de la MATEIXA ALÇADA (mateix enfocament),
  // agafada dels costats i traslladada (no en mirall), amb costures suaus.
  const TOP = 570;
  const BOTTOM = 1350;
  const holeMask = await mask(width, height, `<g stroke="#fff" stroke-width="64" stroke-linejoin="round">${silhouette}</g>`, 12);
  // Trams del forat i d'on surt cada un (desplaçament en x).
  // Fusta neta: esquerra 0–250 i dreta 1090–1333 (amb marge respecte al pastís).
  const spans = [
    { from: 220, to: 470, shift: -220 },
    { from: 470, to: 710, shift: 620 },
    { from: 710, to: 960, shift: -710 },
    { from: 960, to: 1125, shift: 208 },
  ];
  const SEAM = 36;
  const px = (x: number, y: number, c: number) => data[(y * width + Math.min(width - 1, Math.max(0, x))) * 3 + c]!;
  const fill = new Float32Array(width * height * 3);
  for (let y = TOP; y < BOTTOM; y++)
    for (let x = spans[0]!.from; x < spans.at(-1)!.to; x++) {
      const k = spans.findIndex((sp) => x < sp.to);
      const span = spans[k]!;
      const next = spans[k + 1];
      // A prop del final d'un tram, barreja amb el següent.
      const w = next ? Math.min(1, Math.max(0, (x - (span.to - SEAM)) / SEAM)) : 0;
      for (let c = 0; c < 3; c++) {
        const a = px(x + span.shift, y, c);
        const b = next ? px(x + next.shift, y, c) : a;
        fill[(y * width + x) * 3 + c] = a * (1 - w) + b * w;
      }
    }
  // Igualació: mitjana de l'anell (vora del forat) original vs. omplert.
  const ring = [0, 0, 0, 0, 0, 0];
  let ringCount = 0;
  for (let i = 0; i < width * height; i++) {
    const a = holeMask[i]! / 255;
    const ry = Math.floor(i / width);
    const rx = i % width;
    if (a > 0.15 && a < 0.6 && ry >= TOP && ry < BOTTOM && rx >= spans[0]!.from && rx < spans.at(-1)!.to) {
      for (let c = 0; c < 3; c++) {
        ring[c]! += data[i * 3 + c]!;
        ring[3 + c]! += fill[i * 3 + c]!;
      }
      ringCount++;
    }
  }
  const gain = [0, 1, 2].map((c) => (ringCount ? ring[c]! / Math.max(1, ring[3 + c]!) : 1));
  const plate = Buffer.from(data);
  for (let i = 0; i < width * height; i++) {
    const a = holeMask[i]! / 255;
    if (a === 0) continue;
    for (let c = 0; c < 3; c++) {
      const v = Math.min(255, fill[i * 3 + c]! * gain[c]!);
      plate[i * 3 + c] = Math.round(data[i * 3 + c]! * (1 - a) + v * a);
    }
  }
  await sharp(plate, { raw: { width, height, channels: 3 } }).resize({ width: Math.round(width * 0.75) }).webp({ quality: 80 }).toFile(`${OUT}/pastis-fons.webp`);
  console.log('guany de llum del fons:', gain.map((g) => g.toFixed(3)).join(' '));

  // Pastís retallat (vora difuminada 1,5 px).
  const cut = await mask(width, height, silhouette, 1.5);
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = data[i * 3]!;
    rgba[i * 4 + 1] = data[i * 3 + 1]!;
    rgba[i * 4 + 2] = data[i * 3 + 2]!;
    rgba[i * 4 + 3] = cut[i]!;
  }
  const box = alphaBox(rgba, width, { x: 0, y: 0, w: width, h: height })!;
  const layer = await write(rgba, width, height, box, 'pastis-retall.webp');
  return { width, height, background: '/images/scenes/pastis-fons.webp', cake: layer };
}

// ── Panettone ──────────────────────────────────────────────────────────────
interface PanettoneGeometry {
  source: string;
  width: number;
  height: number;
  panettone: [number, number][];
  citrus: { cx: number; cy: number; rx: number; ry: number; core?: number }[];
  crumbs: Box & { cols: number; rows: number };
}

async function panettone() {
  const geo: PanettoneGeometry = JSON.parse(await readFile('src/data/scenes/panettone-geometry.json', 'utf8'));
  const { data, width, height } = await rgb(geo.source);
  const n = width * height;

  const key = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    const k = keyWhite(data[i * 3]!, data[i * 3 + 1]!, data[i * 3 + 2]!);
    key.set([k.r, k.g, k.b, k.a], i * 4);
  }

  const poly = `<polygon points="${geo.panettone.map((p) => p.join(',')).join(' ')}"/>`;
  const panMask = await mask(width, height, poly, 1.5);
  // Interior: dins del contorn el sucre perlat és blanc; allà no s'aplica la clau.
  const panInner = await mask(width, height, poly, 22);
  const ellipse = (c: PanettoneGeometry['citrus'][number]) => `<ellipse cx="${c.cx}" cy="${c.cy}" rx="${c.rx}" ry="${c.ry}"/>`;
  const occupied = await mask(width, height, poly + geo.citrus.map(ellipse).join(''), 6);

  const layer = async (alphaAt: (i: number) => number, limit: Box, file: string) => {
    const rgba = Buffer.alloc(n * 4);
    for (let y = limit.y; y < limit.y + limit.h; y++)
      for (let x = limit.x; x < limit.x + limit.w; x++) {
        const i = y * width + x;
        const a = alphaAt(i);
        if (a <= 0) continue;
        // Si forcem més opacitat que la de la clau (interior sòlid), el color és l'original.
        const opaque = a * 255 > key[i * 4 + 3]! + 1;
        rgba[i * 4] = opaque ? data[i * 3]! : key[i * 4]!;
        rgba[i * 4 + 1] = opaque ? data[i * 3 + 1]! : key[i * 4 + 1]!;
        rgba[i * 4 + 2] = opaque ? data[i * 3 + 2]! : key[i * 4 + 2]!;
        rgba[i * 4 + 3] = Math.round(a * 255);
      }
    const box = alphaBox(rgba, width, limit);
    return box ? write(rgba, width, height, box, file) : null;
  };

  await mkdir(`${OUT}/panettone`, { recursive: true });
  const full = { x: 0, y: 0, w: width, h: height };

  const pan = await layer(
    (i) => (panMask[i]! / 255) * Math.max(key[i * 4 + 3]! / 255, panInner[i]! > 250 ? 1 : 0),
    full,
    'panettone/panettone.webp',
  );

  const citrus: Layer[] = [];
  for (const [index, c] of geo.citrus.entries()) {
    const m = await mask(width, height, ellipse(c), 3);
    // Fruites rodones: el cor és sòlid encara que la polpa sigui pàl·lida.
    const core = c.core ? await mask(width, height, ellipse({ ...c, rx: c.rx * c.core, ry: c.ry * c.core }), 8) : null;
    const l = await layer(
      (i) => (m[i]! / 255) * Math.max(key[i * 4 + 3]! / 255, core ? core[i]! / 255 : 0),
      clampBox({ x: c.cx - c.rx - 8, y: c.cy - c.ry - 8, w: c.rx * 2 + 16, h: c.ry * 2 + 16 }, width, height),
      `panettone/citric-${index}.webp`,
    );
    if (l) citrus.push(l);
  }

  const crumbs: Layer[] = [];
  const { cols, rows } = geo.crumbs;
  const tw = geo.crumbs.w / cols;
  const th = geo.crumbs.h / rows;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const tile = clampBox({ x: geo.crumbs.x + c * tw, y: geo.crumbs.y + r * th, w: tw, h: th }, width, height);
      const l = await layer(
        (i) => (key[i * 4 + 3]! / 255) * (1 - occupied[i]! / 255),
        tile,
        `panettone/tros-${r}-${c}.webp`,
      );
      if (l) crumbs.push(l);
    }

  return { width, height, panettone: pan!, citrus, crumbs };
}

await mkdir(OUT, { recursive: true });
const layers = { cake: await cake(), panettone: await panettone() };
await writeFile('src/data/scenes/layers.json', JSON.stringify(layers, null, 2) + '\n');
console.log(`pastís: ${layers.cake.cake.w}×${layers.cake.cake.h}; panettone: 1 + ${layers.panettone.citrus.length} cítrics + ${layers.panettone.crumbs.length} trossets`);

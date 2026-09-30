// Capes de l'escena del pa (spec 002, escena 1 v3), a partir de fotos del
// client: pastar, les barres al forn i el Pa de pagès retallat. Ús: pnpm bakery
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { alphaBox, mask, rgb, writeRgba } from './lib/raster.ts';

const OUT = 'public/images/scenes/forn';
const URL = '/images/scenes/forn';

async function photo(src: string, name: string, maxWidth: number) {
  const info = await sharp(src).resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality: 74 }).toFile(`${OUT}/${name}`);
  return { src: `${URL}/${name}`, w: info.width, h: info.height };
}

/** Pa de pagès, vist des de dalt: contorn a mà (la fusta i la crosta tenen el mateix to). */
async function loaf() {
  const { data, width, height } = await rgb('assets-src/pa-pages.jpg');
  const outline = [
    [172, 215], [180, 160], [200, 115], [235, 78], [280, 50], [330, 38], [385, 42], [430, 60], [470, 90],
    [500, 130], [522, 180], [530, 230], [522, 285], [500, 330], [465, 370], [420, 398], [370, 412],
    [315, 410], [265, 395], [222, 365], [192, 325], [175, 272],
  ];
  const m = await mask(width, height, `<polygon points="${outline.map((p) => p.join(',')).join(' ')}"/>`, 1.5);
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) rgba.set([data[i * 3]!, data[i * 3 + 1]!, data[i * 3 + 2]!, m[i]!], i * 4);
  const box = alphaBox(rgba, width, { x: 0, y: 0, w: width, h: height })!;
  await writeRgba(rgba, width, height, box, `${OUT}/pa-pages.webp`);
  return { src: `${URL}/pa-pages.webp`, w: box.w, h: box.h };
}

await mkdir(OUT, { recursive: true });
const layers = {
  knead: { ...(await photo('assets-src/obrador-portada.jpg', 'pastar.webp', 1181)), focus: '51% 57%' },
  oven: { ...(await photo('assets-src/obrador-safates.jpg', 'forn.webp', 860)), focus: '50% 45%' },
  loaf: await loaf(),
};
await writeFile('src/data/scenes/bakery.json', JSON.stringify(layers, null, 2) + '\n');
console.log('forn:', Object.entries(layers).map(([k, v]) => `${k} ${v.w}×${v.h}`).join(', '));

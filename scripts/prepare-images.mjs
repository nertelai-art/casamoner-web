// Redimensiona les fotos originals del client (assets-src/, fora de git)
// a una mida raonable per a la web. next/image en genera després AVIF/WebP.
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets-src';
const OUT = 'public/images';
const MAX = 2000;

const folderFor = (name) => {
  const prefix = name.split('-')[0];
  return { botiga: 'botigues', pastis: 'pastissos', dolc: 'dolcos', salat: 'salats' }[prefix] ?? 'general';
};

const files = (await readdir(SRC)).filter((f) => f.endsWith('.jpg'));
for (const file of files) {
  const dir = path.join(OUT, folderFor(file));
  await mkdir(dir, { recursive: true });
  const name = file.replace(/^(botiga|pastis|dolc|salat)-/, '');
  const info = await sharp(path.join(SRC, file))
    .rotate()
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(path.join(dir, name));
  console.log(`${dir}/${name} ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}KB`);
}

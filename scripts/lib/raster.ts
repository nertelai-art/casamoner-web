// Utilitats de ràster compartides pels scripts que generen capes d'escena.
import sharp from 'sharp';

export type Box = { x: number; y: number; w: number; h: number };

/** Rasteritza un SVG a una màscara d'un canal (0–255), amb difuminat opcional. */
export async function mask(width: number, height: number, body: string, blur = 0): Promise<Uint8Array> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#000"/><g fill="#fff">${body}</g></svg>`;
  let img = sharp(Buffer.from(svg)).greyscale();
  if (blur > 0) img = img.blur(blur);
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });
  return new Uint8Array(data.buffer, data.byteOffset, data.length);
}

export async function rgb(path: string) {
  const { data, info } = await sharp(path).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Caixa mínima amb alfa > 8, dins de `limit`. */
export function alphaBox(rgba: Uint8Array, width: number, limit: Box): Box | null {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let y = limit.y; y < limit.y + limit.h; y++)
    for (let x = limit.x; x < limit.x + limit.w; x++)
      if (rgba[(y * width + x) * 4 + 3]! > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

export const clampBox = (b: Box, w: number, h: number): Box => {
  const x = Math.max(0, Math.floor(b.x));
  const y = Math.max(0, Math.floor(b.y));
  return { x, y, w: Math.min(w, Math.ceil(b.x + b.w)) - x, h: Math.min(h, Math.ceil(b.y + b.h)) - y };
};

/** Escriu la regió `box` d'una imatge RGBA com a WebP amb transparència, a l'escala donada. */
export async function writeRgba(rgba: Uint8Array, width: number, height: number, box: Box, file: string, scale = 1) {
  await sharp(Buffer.from(rgba.buffer, rgba.byteOffset, rgba.length), { raw: { width, height, channels: 4 } })
    .extract({ left: box.x, top: box.y, width: box.w, height: box.h })
    .resize({ width: Math.max(1, Math.round(box.w * scale)) })
    .webp({ quality: 76, alphaQuality: 70, effort: 6, smartSubsample: true })
    .toFile(file);
}

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

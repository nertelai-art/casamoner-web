import { keyWhite } from './chroma-key';

describe('keyWhite (fons blanc → transparent)', () => {
  it('makes the white background fully transparent', () => {
    expect(keyWhite(252, 252, 250).a).toBe(0);
    expect(keyWhite(255, 255, 255).a).toBe(0);
  });

  it('keeps saturated fruit fully opaque, with its colour', () => {
    expect(keyWhite(250, 205, 30)).toEqual({ r: 250, g: 205, b: 30, a: 255 });
    expect(keyWhite(240, 140, 20).a).toBe(255);
  });

  it('keeps pale lemon flesh opaque', () => {
    expect(keyWhite(248, 238, 180).a).toBe(255);
  });

  it('treats the warm reflection of the fruit on the white backdrop as (mostly) background', () => {
    expect(keyWhite(252, 236, 213).a).toBeLessThan(60);
    expect(keyWhite(232, 230, 207).a).toBeLessThan(40);
  });

  it('treats the light grey vignette of the backdrop as background', () => {
    expect(keyWhite(228, 228, 226).a).toBe(0);
    expect(keyWhite(215, 216, 214).a).toBeLessThan(40);
  });

  it('turns a darker grey shadow into a semi-transparent dark shadow (no white halo)', () => {
    const shadow = keyWhite(185, 185, 185);
    expect(shadow.a).toBeGreaterThan(0);
    expect(shadow.a).toBeLessThan(255);
    // descontaminat del blanc: el color que queda és més fosc que el píxel original
    expect(shadow.r).toBeLessThan(225);
  });
});

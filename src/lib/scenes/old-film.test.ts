import { OLD_FILM_PHASES, oldFilmFrame } from './old-film';
import { isAtRest } from './layer';

const config = { frames: 12, seed: 3 };
const [entryStart, entryEnd] = OLD_FILM_PHASES.entry;

describe('old film scene', () => {
  it('shows a 3-2-1 countdown leader before the entry', () => {
    expect(oldFilmFrame(0.01, config).leader).toBe(3);
    expect(oldFilmFrame(entryStart - 0.01, config).leader).toBe(1);
    expect(oldFilmFrame(entryStart + 0.01, config).leader).toBeNull();
  });

  it('F-1 moves in jumps: positions inside one quantized frame are identical', () => {
    const frameLength = (entryEnd - entryStart) / config.frames;
    const a = entryStart + frameLength * 4 + frameLength * 0.1;
    const b = entryStart + frameLength * 4 + frameLength * 0.9;
    const fa = oldFilmFrame(a, config).card;
    const fb = oldFilmFrame(b, config).card;
    expect(fb).toEqual(fa);
    const next = oldFilmFrame(entryStart + frameLength * 5.1, config).card;
    expect(next).not.toEqual(fa);
  });

  it('F-2 enters from the top right and lands centred', () => {
    const first = oldFilmFrame(entryStart, config).card;
    expect(first.x).toBeGreaterThan(0);
    expect(first.y).toBeLessThan(0);
    expect(isAtRest(oldFilmFrame(1, config).card)).toBe(true);
  });

  it('F-3 is sepia while moving and full colour at the end', () => {
    expect(oldFilmFrame((entryStart + entryEnd) / 2, config).sepia).toBe(1);
    expect(oldFilmFrame(1, config).sepia).toBe(0);
  });

  it('F-4 jitter is deterministic and fades out on landing', () => {
    const p = entryStart + 0.1;
    expect(oldFilmFrame(p, config)).toEqual(oldFilmFrame(p, config));
    expect(oldFilmFrame(p, { ...config, seed: 99 }).card).not.toEqual(oldFilmFrame(p, config).card);
    expect(oldFilmFrame(entryEnd, config).card).toMatchObject({ x: 0, y: 0, rotate: 0 });
  });

  it('reveals the title card only after landing', () => {
    expect(oldFilmFrame(entryEnd - 0.01, config).title).toBe(0);
    expect(oldFilmFrame(1, config).title).toBe(1);
  });
});

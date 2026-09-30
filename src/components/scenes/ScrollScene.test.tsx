import { act, render, screen } from '@testing-library/react';
import { ScrollScene } from './ScrollScene';

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

let ioCallback: (entries: IntersectionObserverEntry[]) => void = () => {};

beforeAll(() => {
  globalThis.IntersectionObserver = class {
    constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
      ioCallback = cb;
    }
    observe() {}
    disconnect() {}
    unobserve() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = '';
    thresholds = [];
  } as unknown as typeof IntersectionObserver;
});

describe('ScrollScene', () => {
  it('M-4 jumps to the final frame without pinning when motion is reduced', () => {
    mockReducedMotion(true);
    const onFrame = vi.fn();
    render(
      <ScrollScene label="Escena de prova" onFrame={onFrame}>
        <p>contingut</p>
      </ScrollScene>,
    );
    expect(onFrame).toHaveBeenLastCalledWith(1);
    expect(screen.getByRole('figure', { name: 'Escena de prova' })).toHaveAttribute('data-reduced', 'true');
  });

  it('pins the stage inside a tall track otherwise', () => {
    mockReducedMotion(false);
    const onFrame = vi.fn();
    render(
      <ScrollScene label="Escena de prova" onFrame={onFrame} lengthVh={300}>
        <p>contingut</p>
      </ScrollScene>,
    );
    const figure = screen.getByRole('figure', { name: 'Escena de prova' });
    expect(figure).toHaveAttribute('data-reduced', 'false');
    expect(figure.style.getPropertyValue('--scene-length')).toBe('300svh');
    expect(onFrame).toHaveBeenCalled();
  });

  it('M-7 plays once: at the end it stays finished, folds its scroll track and keeps the view still', () => {
    mockReducedMotion(false);
    const onFrame = vi.fn();
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => (frames.push(cb), frames.length));
    const scrollBy = vi.fn();
    window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });

    render(
      <ScrollScene label="Escena" onFrame={onFrame} lengthVh={300}>
        <p>contingut</p>
      </ScrollScene>,
    );
    const track = screen.getByRole('figure', { name: 'Escena' });
    // Recorregut de 3000 px; un cop plegat, només l'escenari (1000 px).
    let top = 0;
    track.getBoundingClientRect = () =>
      ({ top, height: track.dataset.done === 'true' ? 1000 : 3000 }) as DOMRect;
    const scrollTo = (t: number) => {
      top = t;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
        frames.splice(0).forEach((cb) => cb(0));
      });
    };
    // Entra a la vista.
    act(() => ioCallback([{ isIntersecting: true } as IntersectionObserverEntry]));

    scrollTo(-1000);
    expect(onFrame).toHaveBeenLastCalledWith(0.5);
    expect(track.dataset.done).not.toBe('true');

    scrollTo(-2000); // arriba al final
    expect(onFrame).toHaveBeenLastCalledWith(1);
    expect(track.dataset.done).toBe('true');
    expect(scrollBy).toHaveBeenCalledWith({ top: -2000, behavior: 'instant' });

    // Tornar amunt ja no el rebobina.
    onFrame.mockClear();
    scrollTo(-500);
    expect(onFrame).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

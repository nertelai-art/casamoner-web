import { act, render } from '@testing-library/react';
import { createRef, type RefObject } from 'react';
import { Steam } from './Steam';

// Cua de rAF controlada a mà: així es pot reproduir l'ordre dels fotogrames.
let queue: FrameRequestCallback[] = [];
const flushFrame = () => {
  const run = queue;
  queue = [];
  run.forEach((cb) => cb(performance.now()));
};

let observerCallback: IntersectionObserverCallback = () => {};
const fillRect = vi.fn();

beforeEach(() => {
  queue = [];
  fillRect.mockClear();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => (queue.push(cb), queue.length));
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: IntersectionObserverCallback) {
        observerCallback = cb;
      }
      observe() {}
      disconnect() {}
    },
  );
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener() {}, removeEventListener() {} });
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    setTransform() {},
    clearRect() {},
    fillRect,
    createRadialGradient: () => ({ addColorStop() {} }),
  }) as unknown as HTMLCanvasElement['getContext'];
});

afterEach(() => vi.unstubAllGlobals());

describe('Steam', () => {
  it('starts painting when the level rises after a frame that saw no steam', () => {
    const level = createRef<number>() as RefObject<number>;
    (level as { current: number }).current = 0;
    render(<Steam level={level} />);

    // Entra a la vista i es pinta un fotograma sense vapor.
    act(() => observerCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    act(flushFrame);
    expect(fillRect).not.toHaveBeenCalled();

    // L'escena puja el nivell en un rAF posterior (sense cap scroll nou).
    (level as { current: number }).current = 1;
    act(flushFrame);
    expect(fillRect).toHaveBeenCalled();
  });
});

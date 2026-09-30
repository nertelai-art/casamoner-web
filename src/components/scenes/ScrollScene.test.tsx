import { render, screen } from '@testing-library/react';
import { ScrollScene } from './ScrollScene';

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

beforeAll(() => {
  globalThis.IntersectionObserver = class {
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
});

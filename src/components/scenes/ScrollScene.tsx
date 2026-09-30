'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { scrollProgress } from '@/lib/motion/scroll';
import styles from './ScrollScene.module.css';

interface ScrollSceneProps {
  /** Nom accessible de l'escena. */
  label: string;
  /** Rep el progrés 0–1. S'hi escriuen estils directament: no hi ha re-render de React per fotograma. */
  onFrame: (progress: number) => void;
  /** Recorregut de scroll de l'escena, en alçades de pantalla × 100. */
  lengthVh?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Motor comú de les escenes (spec 002): enganxa l'escenari i li passa el
 * progrés de scroll. Un sol bucle rAF, actiu només quan l'escena és a la vista (R-5).
 * Cada escena es reprodueix una sola vegada per visita (M-7).
 */
export function ScrollScene({ label, onFrame, lengthVh = 320, className, children }: ScrollSceneProps) {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLElement>(null);
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onFrameRef.current = onFrame;
  });

  useEffect(() => {
    if (reduced) {
      onFrameRef.current(1);
      return;
    }
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let active = false;
    let last = -1;
    let finished = false;
    // L'escenari s'enganxa sota la capçalera (--header-h).
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;

    /**
     * M-7: l'escena queda acabada i el recorregut es plega a l'alçada de
     * l'escenari. Es mesura on queda la vora de baix abans i després i es
     * corregeix només el que s'hagi mogut (el navegador pot haver-ho compensat ja).
     */
    const finish = (before: DOMRect) => {
      finished = true;
      onFrameRef.current(1);
      track.dataset.done = 'true';
      const after = track.getBoundingClientRect();
      const moved = after.top + after.height - (before.top + before.height);
      // «instant»: el document té scroll-behavior: smooth, i la compensació no s'ha de veure.
      if (moved !== 0) window.scrollBy({ top: moved, behavior: 'instant' });
      teardown();
    };

    const update = () => {
      raf = 0;
      if (finished) return;
      const rect = track.getBoundingClientRect();
      const progress = scrollProgress(rect, window.innerHeight, headerHeight);
      // Només una escena amb recorregut real (no sense maquetar) es pot donar per acabada.
      if (progress >= 1 && rect.height > window.innerHeight) {
        finish(rect);
        return;
      }
      if (progress !== last) {
        last = progress;
        onFrameRef.current(progress);
      }
    };
    const schedule = () => {
      if (active && !raf) raf = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = Boolean(entry?.isIntersecting);
        schedule();
      },
      { rootMargin: '25% 0px' },
    );
    function teardown() {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
    }

    observer.observe(track);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();

    return teardown;
  }, [reduced]);

  return (
    <figure
      ref={trackRef}
      aria-label={label}
      data-reduced={String(reduced)}
      className={`${styles.track} ${className ?? ''}`}
      style={{ '--scene-length': `${lengthVh}svh` } as CSSProperties}
    >
      <div className={styles.stage}>{children}</div>
    </figure>
  );
}

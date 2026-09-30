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
    // L'escenari s'enganxa sota la capçalera (--header-h).
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;

    const update = () => {
      raf = 0;
      const progress = scrollProgress(track.getBoundingClientRect(), window.innerHeight, headerHeight);
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
    observer.observe(track);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
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

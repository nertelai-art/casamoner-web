'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { createPrng } from '@/lib/motion/prng';

const COUNT = 34;
const LIFE = 3.4; // segons que tarda una volva a pujar

interface Puff {
  phase: number;
  drift: number;
  wobble: number;
  size: number;
}

/**
 * Vapor sobre la tassa: volves suaus que pugen ondulant. Només s'anima mentre
 * hi ha vapor i el canvas és a la vista; amb moviment reduït, un sol fotograma.
 */
export function Steam({ level, className }: { level: RefObject<number>; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const rand = createPrng(21);
    const puffs: Puff[] = Array.from({ length: COUNT }, () => ({
      phase: rand(),
      drift: (rand() - 0.5) * 0.5,
      wobble: rand() * Math.PI * 2,
      size: 0.16 + rand() * 0.14,
    }));

    let raf = 0;
    let visible = false;
    const start = performance.now();

    const draw = (now: number) => {
      raf = 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth: w, clientHeight: h } = el;
      if (el.width !== Math.round(w * dpr)) el.width = Math.round(w * dpr);
      if (el.height !== Math.round(h * dpr)) el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const amount = level.current ?? 0;
      if (amount <= 0) return;
      const t = reduced ? 1.2 : (now - start) / 1000;
      for (const p of puffs) {
        const life = ((t / LIFE + p.phase) % 1 + 1) % 1;
        const rise = life;
        const x = w / 2 + (p.drift * rise + Math.sin(p.wobble + t * 1.3 + rise * 5) * 0.12 * rise) * w;
        const y = h * (1 - rise * 0.95);
        const r = w * p.size * (0.5 + rise * 1.1);
        const alpha = amount * Math.sin(Math.PI * life) * 0.22;
        // Una ombra molt lleu perquè el vapor es llegeixi sobre fons clars…
        const shade = ctx.createRadialGradient(x, y, 0, x, y, r * 1.2);
        shade.addColorStop(0, `rgba(120, 104, 88, ${alpha * 0.18})`);
        shade.addColorStop(1, 'rgba(120, 104, 88, 0)');
        ctx.fillStyle = shade;
        ctx.fillRect(x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
        // …i el cos blanc de la volva.
        const body = ctx.createRadialGradient(x, y, 0, x, y, r);
        body.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        body.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = body;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      if (visible && !reduced) raf = requestAnimationFrame(draw);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) kick();
    });
    observer.observe(el);
    // El nivell canvia amb el scroll: tornem a pintar quan es mou la pàgina.
    window.addEventListener('scroll', kick, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', kick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [level, reduced]);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}

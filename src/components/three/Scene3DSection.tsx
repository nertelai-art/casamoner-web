'use client';

import Image from 'next/image';
import { useCallback, useRef, type ComponentType, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { ScrollScene } from '@/components/scenes/ScrollScene';
import { useNearViewport, useRenderMode } from './environment';
import type { CanvasSceneProps } from './types';
import styles from './Scene3DSection.module.css';

interface Scene3DSectionProps {
  label: string;
  /** Descripció per a lectors de pantalla i cercadors del que es veu al canvas. */
  description: string;
  lengthVh?: number;
  /** El canvas, carregat amb next/dynamic (ssr: false): three.js no entra a la càrrega inicial. */
  Canvas: ComponentType<CanvasSceneProps>;
  fallback: { src: string; alt: string };
  /** Text de l'escena (HTML real). */
  children: ReactNode;
  onProgress?: (progress: number) => void;
  tone?: 'light' | 'dark';
  className?: string;
}

export function Scene3DSection({
  label,
  description,
  lengthVh = 320,
  Canvas,
  fallback,
  children,
  onProgress,
  tone = 'light',
  className,
}: Scene3DSectionProps) {
  const holder = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const mode = useRenderMode();
  const reducedMotion = usePrefersReducedMotion();
  const near = useNearViewport(holder);

  const onFrame = useCallback(
    (p: number) => {
      progress.current = p;
      onProgress?.(p);
    },
    [onProgress],
  );

  return (
    <div ref={holder} className={className} data-tone={tone}>
      <ScrollScene label={label} onFrame={onFrame} lengthVh={mode === 'static' ? 100 : lengthVh}>
        <div className={styles.layout}>
          <div className={styles.canvas} aria-hidden="true">
            {mode === '3d' && near && <Canvas progress={progress} reducedMotion={reducedMotion} />}
            {mode === 'static' && (
              <Image src={fallback.src} alt={fallback.alt} fill sizes="(max-width: 900px) 100vw, 60vw" className={styles.fallback} />
            )}
          </div>
          <div className={styles.copy}>{children}</div>
          <p className="visually-hidden">{description}</p>
        </div>
      </ScrollScene>
    </div>
  );
}

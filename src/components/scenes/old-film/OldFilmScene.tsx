'use client';

import { getImageProps } from 'next/image';
import { useCallback, useRef } from 'react';
import type { LayerState } from '@/lib/scenes/layer';
import { OLD_FILM_PHASES, oldFilmFrame, type OldFilmFrame } from '@/lib/scenes/old-film';
import { segment } from '@/lib/motion/timeline';
import { LayerImage } from '../LayerImage';
import { ScrollScene } from '../ScrollScene';
import styles from './OldFilmScene.module.css';

const CONFIG = { frames: 11, seed: 7 } as const;
const FINAL = oldFilmFrame(1, CONFIG);

/** La targeta es mou en unitats de pantalla perquè entri des de fora del quadre. */
const cardTransform = (c: LayerState) =>
  `translate3d(${c.x.toFixed(2)}vw, ${c.y.toFixed(2)}svh, 0) rotate(${c.rotate.toFixed(2)}deg) scale(${c.scale.toFixed(3)})`;

const photoFilter = (f: OldFilmFrame) =>
  `sepia(${f.sepia.toFixed(3)}) contrast(${f.contrast.toFixed(3)}) brightness(${f.brightness.toFixed(3)})`;

export function OldFilmScene() {
  const { props: img } = getImageProps({
    src: '/images/pastissos/formatge-macadamia.jpg',
    alt: 'Pastís de formatge i macadàmia amb crocant i sucre llustre, sobre una taula de fusta',
    width: 1333,
    height: 2000,
    sizes: '(max-width: 700px) 70vw, 34vw',
  });

  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const leader = useRef<HTMLDivElement>(null);
  const leaderNumber = useRef<HTMLSpanElement>(null);
  const title = useRef<HTMLDivElement>(null);

  const onFrame = useCallback((p: number) => {
    const f = oldFilmFrame(p, CONFIG);
    if (card.current) {
      card.current.style.transform = cardTransform(f.card);
      card.current.style.opacity = String(f.card.opacity);
    }
    if (photo.current) photo.current.style.filter = photoFilter(f);
    if (stage.current) {
      stage.current.style.setProperty('--grain', f.grain.toFixed(3));
      stage.current.style.setProperty('--sepia', f.sepia.toFixed(3));
    }
    if (leader.current && leaderNumber.current) {
      leader.current.style.opacity = f.leader === null ? '0' : '1';
      leaderNumber.current.textContent = String(f.leader ?? '');
      const sweep = (segment(p, ...OLD_FILM_PHASES.leader) * 3) % 1;
      leader.current.style.setProperty('--sweep', `${(sweep * 360).toFixed(1)}deg`);
    }
    if (title.current) {
      title.current.style.opacity = String(f.title);
      title.current.style.transform = `translateY(${((1 - f.title) * 16).toFixed(1)}px)`;
    }
  }, []);

  return (
    <ScrollScene label="Animació: pastís de formatge en pel·lícula antiga" onFrame={onFrame} lengthVh={320}>
      <div
        ref={stage}
        className={styles.stage}
        style={{ '--grain': FINAL.grain, '--sepia': FINAL.sepia } as React.CSSProperties}
      >
        <div ref={leader} className={styles.leader} style={{ opacity: 0 }} aria-hidden="true">
          <span ref={leaderNumber} />
        </div>

        <div
          ref={card}
          className={styles.card}
          style={{ transform: cardTransform(FINAL.card), opacity: FINAL.card.opacity }}
        >
          <div className={styles.filmStrip}>
            <LayerImage {...img} ref={photo} className={styles.photo} style={{ filter: photoFilter(FINAL) }} />
          </div>
        </div>

        <div ref={title} className={styles.title} style={{ opacity: FINAL.title }}>
          <p className={styles.kicker}>Pastís de la casa</p>
          <p className={styles.name}>Formatge i macadàmia</p>
          <p className={styles.note}>Encarrega&apos;l a qualsevol botiga, personalitzat per a la teva celebració.</p>
        </div>

        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.scratches} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
      </div>
    </ScrollScene>
  );
}

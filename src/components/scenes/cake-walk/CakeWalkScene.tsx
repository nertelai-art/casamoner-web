'use client';

import Link from 'next/link';
import { useCallback, useRef } from 'react';
import layers from '@/data/scenes/layers.json';
import { cakeWalkFrame, type CakeWalkFrame } from '@/lib/scenes/cake-walk';
import { LayerImage } from '../LayerImage';
import { ScrollScene } from '../ScrollScene';
import styles from './CakeWalkScene.module.css';

const { width: W, height: H, background, cake } = layers.cake;
/** Base del pastís a la foto (px): hi pivota quan s'inclina i hi va l'ombra. */
const BASE = { x: 672, y: 1290, halfWidth: 400 };
const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;

const cakeTransform = (f: CakeWalkFrame) =>
  `translate3d(${f.x.toFixed(3)}%, ${f.y.toFixed(3)}%, 0) rotate(${f.rotate.toFixed(2)}deg) scale(${f.scaleX.toFixed(4)}, ${f.scaleY.toFixed(4)})`;
const FINAL = cakeWalkFrame(1);

export function CakeWalkScene() {
  const walker = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const hopper = useRef<HTMLDivElement>(null);

  const onFrame = useCallback((p: number) => {
    const f = cakeWalkFrame(p);
    if (walker.current) walker.current.style.transform = cakeTransform(f);
    if (shadow.current) {
      shadow.current.style.transform = `translate3d(${f.x.toFixed(3)}%, 0, 0)`;
      shadow.current.style.setProperty('--shadow', f.shadow.toFixed(3));
    }
  }, []);

  // Interacció: en passar-hi per sobre, el pastís fa un saltet.
  const hop = () => {
    const el = hopper.current;
    if (!el || el.dataset.hop === 'true') return;
    el.dataset.hop = 'true';
    el.addEventListener('animationend', () => (el.dataset.hop = 'false'), { once: true });
  };

  return (
    <ScrollScene label="Animació: el pastís de formatge arriba caminant" onFrame={onFrame} lengthVh={300}>
      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className="eyebrow">Pastís per encàrrec</p>
          <h3 className={styles.title}>Formatge i macadàmia</h3>
          <p className={styles.text}>Personalitza el teu pastís encarregant-lo a les nostres botigues.</p>
          <Link href="/botigues" className="button">
            Troba la teva botiga
          </Link>
        </div>

        <div className={styles.frame} style={{ aspectRatio: `${W} / ${H}` }} onPointerEnter={hop}>
          <LayerImage src={background} className={styles.background} loading="lazy" decoding="async" />
          <div
            ref={shadow}
            className={styles.full}
            style={{ transform: `translate3d(${FINAL.x}%, 0, 0)`, ['--shadow' as string]: FINAL.shadow }}
          >
            <span
              className={styles.shadow}
              style={{
                left: pct(BASE.x - BASE.halfWidth, W),
                width: pct(BASE.halfWidth * 2, W),
                top: pct(BASE.y - 70, H),
                height: pct(120, H),
              }}
            />
          </div>
          <div
            ref={walker}
            className={styles.full}
            style={{ transform: cakeTransform(FINAL), transformOrigin: `${pct(BASE.x, W)} ${pct(BASE.y, H)}` }}
          >
            <div ref={hopper} className={styles.hopper} style={{ transformOrigin: `${pct(BASE.x, W)} ${pct(BASE.y, H)}` }}>
              <LayerImage
                src={cake.src}
                alt="Pastís de formatge i macadàmia amb crocant i sucre llustre"
                className={styles.cake}
                loading="lazy"
                decoding="async"
                style={{ left: pct(cake.x, W), top: pct(cake.y, H), width: pct(cake.w, W) }}
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollScene>
  );
}

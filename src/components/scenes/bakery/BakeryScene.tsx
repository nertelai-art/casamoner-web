'use client';

import { useCallback, useRef } from 'react';
import layers from '@/data/scenes/bakery.json';
import { bakeryFrame } from '@/lib/scenes/bakery';
import { Steam } from '../Steam';
import { LayerImage } from '../LayerImage';
import { ScrollScene } from '../ScrollScene';
import { SceneSteps, type SceneStepsHandle } from '../SceneSteps';
import styles from './BakeryScene.module.css';

const STEPS = ['Pastar', 'Al forn', 'Acabat de sortir'];
const FINAL = bakeryFrame(1);

/** Radi (en % de clip-path circle) que cobreix tot el marc des del centre. */
const FULL = 78;

export function BakeryScene() {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const knead = useRef<HTMLImageElement>(null);
  const oven = useRef<HTMLDivElement>(null);
  const ovenPhoto = useRef<HTMLImageElement>(null);
  const loaf = useRef<HTMLDivElement>(null);
  const loafShadow = useRef<HTMLDivElement>(null);
  const steam = useRef(FINAL.steam);
  const steps = useRef<SceneStepsHandle>(null);

  const onFrame = useCallback((p: number) => {
    const f = bakeryFrame(p);
    stage.current?.style.setProperty('--glow', f.heat.toFixed(3));
    if (knead.current) knead.current.style.transform = `scale(${f.kneadZoom.toFixed(4)})`;
    if (oven.current) oven.current.style.clipPath = `circle(${(f.oven * FULL).toFixed(2)}% at 50% 55%)`;
    if (ovenPhoto.current) {
      ovenPhoto.current.style.transform = `scale(${f.ovenZoom.toFixed(4)})`;
      ovenPhoto.current.style.filter = `saturate(${(1 + 0.3 * f.heat).toFixed(3)}) brightness(${(1 + 0.1 * f.heat).toFixed(3)})`;
    }
    if (frame.current) frame.current.style.clipPath = `circle(${((1 - f.close) * FULL).toFixed(2)}% at 50% 50%)`;
    if (loaf.current) {
      loaf.current.style.opacity = String(Math.min(1, f.loaf * 2));
      loaf.current.style.transform = `translate(-50%, -50%) scale(${f.loafScale.toFixed(4)})`;
    }
    if (loafShadow.current) {
      const lift = f.loafScale - 1; // 0 quan reposa
      loafShadow.current.style.opacity = String(Math.min(1, f.loaf * 2) * (0.55 - lift));
      loafShadow.current.style.transform = `translate(calc(-50% + ${(4 + lift * 40).toFixed(1)}%), calc(-50% + ${(6 + lift * 60).toFixed(1)}%)) scale(${(1 + lift * 0.6).toFixed(3)})`;
    }
    steam.current = f.steam;
    steps.current?.setActive(f.stage, p);
  }, []);

  return (
    <div ref={stage} className={styles.oven}>
      <ScrollScene label="Animació: de la massa pastada al pa acabat de sortir del forn" onFrame={onFrame} lengthVh={340}>
        <div className={styles.layout}>
          <SceneSteps
            ref={steps}
            tone="dark"
            eyebrow="Massa mare i farines ecològiques"
            title="Del llevat a la crosta"
            text="Així es fa a l'obrador de casamoner: es pasta la massa, es cou al forn i surt el pa."
            steps={STEPS}
          />

          <div className={styles.visual}>
            <div ref={frame} className={styles.frame} style={{ clipPath: `circle(0% at 50% 50%)` }}>
              <LayerImage
                ref={knead}
                src={layers.knead.src}
                alt="Mans pastant la massa a l'obrador de casamoner"
                className={styles.photo}
                style={{ objectPosition: layers.knead.focus }}
                loading="lazy"
                decoding="async"
              />
              <div ref={oven} className={styles.ovenLayer} style={{ clipPath: `circle(${FULL}% at 50% 55%)` }}>
                <LayerImage
                  ref={ovenPhoto}
                  src={layers.oven.src}
                  alt="Barres de pa sobre les safates del forn de l'obrador"
                  className={styles.photo}
                  style={{ objectPosition: layers.oven.focus }}
                  loading="lazy"
                  decoding="async"
                />
                <div className={styles.glow} aria-hidden="true" />
                <div className={styles.haze} aria-hidden="true" />
              </div>
            </div>

            <div ref={loafShadow} className={`${styles.loaf} ${styles.loafShadow}`} aria-hidden="true">
              <LayerImage src={layers.loaf.src} loading="lazy" decoding="async" />
            </div>
            <div ref={loaf} className={styles.loaf} style={{ transform: 'translate(-50%, -50%)' }}>
              <LayerImage src={layers.loaf.src} alt="Pa de pagès de casamoner acabat de sortir del forn" loading="lazy" decoding="async" />
              <Steam level={steam} className={styles.steam} />
            </div>
          </div>
        </div>
      </ScrollScene>
    </div>
  );
}

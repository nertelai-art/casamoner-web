'use client';

import { getImageProps } from 'next/image';
import { useCallback, useRef } from 'react';
import { ovenFrame, type LoafState, type OvenStage } from '@/lib/scenes/oven';
import { bandMask, clipPath } from '@/lib/scenes/shapes';
import { LayerImage } from '../LayerImage';
import { ScrollScene } from '../ScrollScene';
import { SceneSteps, type SceneStepsHandle } from '../SceneSteps';
import styles from './OvenScene.module.css';

/** `general/obrador-safates.jpg` (1067 × 1600): cinc barres sobre safates. */
const SIZE = { width: 1067, height: 1600 };
const LOAVES = [
  { top: 18, bottom: 142 },
  { top: 342, bottom: 468 },
  { top: 668, bottom: 798 },
  { top: 982, bottom: 1112 },
  { top: 1304, bottom: 1442 },
] as const;
const BASE_MASK = bandMask(LOAVES, SIZE.height);
const FINAL = ovenFrame(1, LOAVES.length);

const STAGES: Record<OvenStage, number> = { fermentacio: 0, forn: 1, acabat: 2 };
const STEPS = ['Fermentació lenta', 'Al forn', 'Acabat de sortir'];

const loafTransform = (l: LoafState) => `scale(${l.scaleX.toFixed(4)}, ${l.scaleY.toFixed(4)})`;
const loafFilter = (l: LoafState) => `saturate(${l.saturate.toFixed(3)}) brightness(${l.brightness.toFixed(3)})`;

export function OvenScene() {
  const { props: img } = getImageProps({
    src: '/images/general/obrador-safates.jpg',
    alt: '',
    width: SIZE.width,
    height: SIZE.height,
    sizes: '(max-width: 900px) 80vw, 40vw',
  });

  const frame = useRef<HTMLDivElement>(null);
  const loaves = useRef<(HTMLImageElement | null)[]>([]);
  const hours = useRef<HTMLSpanElement>(null);
  const celsius = useRef<HTMLSpanElement>(null);
  const steps = useRef<SceneStepsHandle>(null);

  const onFrame = useCallback((p: number) => {
    const f = ovenFrame(p, LOAVES.length);
    f.loaves.forEach((l, i) => {
      const el = loaves.current[i];
      if (!el) return;
      el.style.transform = loafTransform(l);
      el.style.filter = loafFilter(l);
    });
    const el = frame.current;
    if (el) {
      el.style.setProperty('--glow', f.glow.toFixed(3));
      el.style.setProperty('--shimmer', f.shimmer.toFixed(3));
      el.style.setProperty('--steam', f.steam.toFixed(3));
    }
    if (hours.current) hours.current.textContent = String(f.gauge.hours);
    if (celsius.current) celsius.current.textContent = String(f.gauge.celsius);
    steps.current?.setActive(STAGES[f.stage], p);
  }, []);

  return (
    <ScrollScene label="Animació: el pa fermenta i es cou al forn" onFrame={onFrame} lengthVh={340}>
      <div className={styles.layout}>
        <SceneSteps
          ref={steps}
          tone="dark"
          eyebrow="Massa mare · 24 hores"
          title="El pa necessita temps"
          text="Deixem fermentar la massa mare amb calma perquè el pa sigui més digestiu, més aromàtic i duri més. Després, forn fort i crosta daurada."
          steps={STEPS}
        />

        <div className={styles.visual}>
          <div
            ref={frame}
            className={styles.frame}
            style={{
              aspectRatio: `${SIZE.width} / ${SIZE.height}`,
              ...({ '--glow': FINAL.glow, '--shimmer': FINAL.shimmer, '--steam': FINAL.steam } as React.CSSProperties),
            }}
          >
            <LayerImage {...img} className={styles.layer} style={{ maskImage: BASE_MASK, WebkitMaskImage: BASE_MASK }} />
            {LOAVES.map((band, i) => (
              <LayerImage
                {...img}
                key={band.top}
                ref={(el) => {
                  loaves.current[i] = el;
                }}
                className={styles.layer}
                style={{
                  clipPath: clipPath({ kind: 'rect', x: 0, y: band.top, w: SIZE.width, h: band.bottom - band.top }, SIZE),
                  transformOrigin: `50% ${((band.bottom / SIZE.height) * 100).toFixed(2)}%`,
                  transform: loafTransform(FINAL.loaves[i]!),
                  filter: loafFilter(FINAL.loaves[i]!),
                }}
                alt={i === 0 ? 'Barres de pa de massa mare sobre safates de forn a l’obrador de casamoner' : ''}
              />
            ))}
            <div className={styles.glow} aria-hidden="true" />
            <div className={styles.haze} aria-hidden="true" />
            <div className={styles.steam} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <dl className={styles.gauge}>
            <div>
              <dt>Fermentació</dt>
              <dd>
                <span ref={hours}>{FINAL.gauge.hours}</span> h
              </dd>
            </div>
            <div>
              <dt>Forn</dt>
              <dd>
                <span ref={celsius}>{FINAL.gauge.celsius}</span> °C
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </ScrollScene>
  );
}

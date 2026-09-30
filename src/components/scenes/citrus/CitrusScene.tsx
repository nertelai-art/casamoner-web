'use client';

import { getImageProps } from 'next/image';
import { useCallback, useRef } from 'react';
import { citrusFrame, type CitrusFrame } from '@/lib/scenes/citrus';
import { toTransform, type LayerState } from '@/lib/scenes/layer';
import { clipPath, featherMask, shapeOrigin } from '@/lib/scenes/shapes';
import { LayerImage } from '../LayerImage';
import { ScrollScene } from '../ScrollScene';
import { SceneSteps, type SceneStepsHandle } from '../SceneSteps';
import { CITRUS, CITRUS_IMAGE, CONFIG, CRUMBS, MADELEINE } from './citrus-geometry';
import styles from './CitrusScene.module.css';

const FINAL = citrusFrame(1, CONFIG);

const STEPS = ['La magdalena', 'Llimona i taronja', 'Fruita confitada'];
const stepFor = (p: number) => (p < 0.27 ? 0 : p < 0.63 ? 1 : 2);

const layerStyle = (state: LayerState) => ({ transform: toTransform(state), opacity: state.opacity });

function paint(el: HTMLElement | null | undefined, state: LayerState) {
  if (!el) return;
  el.style.transform = toTransform(state);
  el.style.opacity = String(state.opacity);
}

export function CitrusScene() {
  const { props: img } = getImageProps({
    src: CITRUS_IMAGE.src,
    alt: '',
    width: CITRUS_IMAGE.width,
    height: CITRUS_IMAGE.height,
    sizes: '(max-width: 900px) 100vw, 60vw',
  });

  const backdrop = useRef<HTMLImageElement>(null);
  const madeleine = useRef<HTMLImageElement>(null);
  const citrus = useRef<(HTMLImageElement | null)[]>([]);
  const crumbs = useRef<(HTMLImageElement | null)[]>([]);
  const finish = useRef<HTMLImageElement>(null);
  const steps = useRef<SceneStepsHandle>(null);

  const onFrame = useCallback((p: number) => {
    const f: CitrusFrame = citrusFrame(p, CONFIG);
    if (backdrop.current) backdrop.current.style.opacity = String(f.backdrop * 0.45);
    paint(madeleine.current, f.madeleine);
    f.citrus.forEach((s, i) => paint(citrus.current[i], s));
    f.crumbs.forEach((s, i) => paint(crumbs.current[i], s));
    if (finish.current) finish.current.style.opacity = String(f.finish);
    steps.current?.setActive(stepFor(p), p);
  }, []);

  const size = { width: CITRUS_IMAGE.width, height: CITRUS_IMAGE.height };

  return (
    <ScrollScene label="Animació: magdalena de cítrics" onFrame={onFrame} lengthVh={340}>
      <div className={styles.layout}>
        <SceneSteps
          ref={steps}
          eyebrow="Fet a mà cada matí"
          title="Magdalena de cítrics"
          text="Farina ecològica, llimona i taronja de veritat i fruita confitada a trossets. Res més."
          steps={STEPS}
        />
        <div className={styles.frame} style={{ aspectRatio: `${size.width} / ${size.height}` }}>
          <LayerImage {...img} ref={backdrop} className={`${styles.layer} ${styles.backdrop}`} style={{ opacity: 0.45 }} />
          {CRUMBS.map((shape, i) => (
            <LayerImage
              {...img}
              key={`crumb-${i}`}
              ref={(el) => {
                crumbs.current[i] = el;
              }}
              className={styles.layer}
              style={{
                maskImage: featherMask(shape, size),
                WebkitMaskImage: featherMask(shape, size),
                transformOrigin: shapeOrigin(shape, size),
                ...layerStyle(FINAL.crumbs[i]!),
              }}
            />
          ))}
          <LayerImage
            {...img}
            ref={madeleine}
            className={styles.layer}
            style={{
              clipPath: clipPath(MADELEINE, size),
              transformOrigin: shapeOrigin(MADELEINE, size),
              ...layerStyle(FINAL.madeleine),
            }}
          />
          {CITRUS.map((shape, i) => (
            <LayerImage
              {...img}
              key={`citrus-${i}`}
              ref={(el) => {
                citrus.current[i] = el;
              }}
              className={styles.layer}
              style={{ clipPath: clipPath(shape, size), transformOrigin: shapeOrigin(shape, size), ...layerStyle(FINAL.citrus[i]!) }}
            />
          ))}
          <LayerImage
            {...img}
            ref={finish}
            alt="Magdalena de cítrics amb sucre perlat, envoltada de llimones, taronges i fruita confitada"
            className={styles.layer}
            style={{ opacity: FINAL.finish }}
          />
        </div>
      </div>
    </ScrollScene>
  );
}

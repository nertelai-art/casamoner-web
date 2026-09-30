'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef } from 'react';
import { breadFrame } from '@/lib/scenes/bread';
import { Scene3DSection } from '@/components/three/Scene3DSection';
import { SceneSteps, type SceneStepsHandle } from '../SceneSteps';
import styles from './BreadScene.module.css';

const BreadCanvas = dynamic(() => import('./BreadCanvas'), { ssr: false });

const STEPS = ['Fermentació', 'Al forn', 'Acabat de sortir'];

export function BreadScene() {
  const stage = useRef<HTMLDivElement>(null);
  const steps = useRef<SceneStepsHandle>(null);

  const onProgress = useCallback((p: number) => {
    const f = breadFrame(p);
    stage.current?.style.setProperty('--glow', f.glow.toFixed(3));
    steps.current?.setActive(f.stage, p);
  }, []);

  return (
    <div ref={stage} className={styles.oven}>
      <Scene3DSection
        label="Animació: la massa fermenta, entra al forn i surt daurada"
        description="Una barra de pa de massa mare s'infla sobre la pala, es cou fins que la crosta es daura i les greixes s'obren, i surt del forn fumejant."
        Canvas={BreadCanvas}
        fallback={{ src: '/images/pans/nostalgia.jpg', alt: 'Forner de casamoner amb una barra de Pa Nostàlgia a les mans' }}
        onProgress={onProgress}
        lengthVh={340}
        tone="dark"
      >
        <SceneSteps
          ref={steps}
          tone="dark"
          eyebrow="Massa mare i farines ecològiques"
          title="Del llevat a la crosta"
          text="La massa mare fa pujar el pa a poc a poc. Després, forn: la crosta es daura i les greixes s'obren."
          steps={STEPS}
        />
      </Scene3DSection>
    </div>
  );
}

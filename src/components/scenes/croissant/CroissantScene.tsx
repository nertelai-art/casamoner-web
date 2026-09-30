'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef } from 'react';
import { croissantFrame } from '@/lib/scenes/croissant';
import { Scene3DSection } from '@/components/three/Scene3DSection';
import { SceneSteps, type SceneStepsHandle } from '../SceneSteps';

const CroissantCanvas = dynamic(() => import('./CroissantCanvas'), { ssr: false });

const STEPS = ['Croissant acabat de fer', 'Un cafè', 'El primer mos'];

export function CroissantScene() {
  const steps = useRef<SceneStepsHandle>(null);
  const onProgress = useCallback((p: number) => steps.current?.setActive(croissantFrame(p).stage, p), []);

  return (
    <section aria-labelledby="cafeteria-title">
      <Scene3DSection
        label="Animació: un croissant sobre el plat, un cafè i la primera mossegada"
        description="Un croissant cau sobre un plat, apareix una tassa que s'omple de cafè, en surt vapor i al final el croissant queda mossegat."
        Canvas={CroissantCanvas}
        fallback={{ src: '/images/dolcos/croissants.jpg', alt: "Safates de croissants acabats de sortir de l'obrador de casamoner" }}
        onProgress={onProgress}
        lengthVh={340}
      >
        <SceneSteps
          ref={steps}
          eyebrow="casamoner cafeteria"
          title="Bon dia"
          titleId="cafeteria-title"
          titleLevel={2}
          text="De l'obrador a les botigues, bolleria fresca cada dia."
          steps={STEPS}
        />
      </Scene3DSection>
    </section>
  );
}

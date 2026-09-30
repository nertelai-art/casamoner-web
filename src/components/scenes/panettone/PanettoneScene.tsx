'use client';

import { useCallback, useRef } from 'react';
import layers from '@/data/scenes/layers.json';
import { citrusFrame } from '@/lib/scenes/citrus';
import { toTransform, type LayerState } from '@/lib/scenes/layer';
import { LayerImage } from '../LayerImage';
import { ScrollScene } from '../ScrollScene';
import { SceneSteps, type SceneStepsHandle } from '../SceneSteps';
import styles from './PanettoneScene.module.css';

const { width: W, height: H, panettone, citrus, crumbs } = layers.panettone;
const CONFIG = { citrusCount: citrus.length, crumbCount: crumbs.length, seed: 11 };
const FINAL = citrusFrame(1, CONFIG);

const STEPS = ['El panettone', 'Llimona i taronja', 'Fruita confitada'];
const stepFor = (p: number) => (p < 0.27 ? 0 : p < 0.63 ? 1 : 2);

const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;
type Piece = (typeof crumbs)[number];

/** Les peces que la foto original talla pel marge s'esvaeixen per aquell costat. */
function edgeFade(piece: Piece) {
  const fades: string[] = [];
  if (piece.x + piece.w >= W - 2) fades.push('linear-gradient(to left, transparent, #000 28%)');
  if (piece.y <= 2) fades.push('linear-gradient(to bottom, transparent, #000 28%)');
  if (piece.y + piece.h >= H - 2) fades.push('linear-gradient(to top, transparent, #000 22%)');
  if (piece.x <= 2) fades.push('linear-gradient(to right, transparent, #000 22%)');
  if (!fades.length) return {};
  const maskImage = fades.join(', ');
  return { maskImage, WebkitMaskImage: maskImage, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' } as const;
}

function paint(el: HTMLElement | null | undefined, s: LayerState) {
  if (!el) return;
  el.style.transform = toTransform(s);
  el.style.opacity = String(s.opacity);
}

/**
 * Una peça: un contenidor de la mida de tota la composició (perquè la
 * translació en % sigui del conjunt) amb el retall col·locat a dins.
 */
function PieceLayer({ piece, state, alt, register }: { piece: Piece; state: LayerState; alt?: string; register: (el: HTMLDivElement | null) => void }) {
  return (
    <div
      ref={register}
      className={styles.piece}
      style={{
        transform: toTransform(state),
        opacity: state.opacity,
        transformOrigin: `${pct(piece.x + piece.w / 2, W)} ${pct(piece.y + piece.h / 2, H)}`,
      }}
    >
      <LayerImage
        src={piece.src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ left: pct(piece.x, W), top: pct(piece.y, H), width: pct(piece.w, W), ...edgeFade(piece) }}
      />
    </div>
  );
}

export function PanettoneScene() {
  const main = useRef<HTMLDivElement | null>(null);
  const fruit = useRef<(HTMLDivElement | null)[]>([]);
  const bits = useRef<(HTMLDivElement | null)[]>([]);
  const steps = useRef<SceneStepsHandle>(null);

  const onFrame = useCallback((p: number) => {
    const f = citrusFrame(p, CONFIG);
    paint(main.current, f.panettone);
    f.citrus.forEach((s, i) => paint(fruit.current[i], s));
    f.crumbs.forEach((s, i) => paint(bits.current[i], s));
    steps.current?.setActive(stepFor(p), p);
  }, []);

  return (
    <ScrollScene label="Animació: el panettone de Nadal es munta peça a peça" onFrame={onFrame} lengthVh={340}>
      <div className={styles.layout}>
        <SceneSteps
          ref={steps}
          eyebrow="Dolç Nadal"
          title="Panettone de Nadal ecològic"
          text="El panettone de Nadal de casamoner, amb cítrics i fruita confitada."
          steps={STEPS}
        />
        <div className={styles.composition} style={{ aspectRatio: `${W} / ${H}` }}>
          {crumbs.map((piece, i) => (
            <PieceLayer key={piece.src} piece={piece} state={FINAL.crumbs[i]!} register={(el) => void (bits.current[i] = el)} />
          ))}
          <PieceLayer
            piece={panettone}
            state={FINAL.panettone}
            alt="Panettone de Nadal ecològic amb sucre perlat, envoltat de llimones, taronges i fruita confitada"
            register={(el) => void (main.current = el)}
          />
          {citrus.map((piece, i) => (
            <PieceLayer key={piece.src} piece={piece} state={FINAL.citrus[i]!} register={(el) => void (fruit.current[i] = el)} />
          ))}
        </div>
      </div>
    </ScrollScene>
  );
}

'use client';

import { useCallback, useRef, type CSSProperties } from 'react';
import layers from '@/data/scenes/breakfast.json';
import { croissantFrame, type CroissantFrame } from '@/lib/scenes/croissant';
import { clamp, lerp } from '@/lib/motion/timeline';
import { LayerImage } from '../LayerImage';
import { ScrollScene } from '../ScrollScene';
import { SceneSteps, type SceneStepsHandle } from '../SceneSteps';
import { Steam } from './Steam';
import styles from './CafeteriaScene.module.css';

/** Proporció de la composició (amplada / alçada). */
const RATIO = 1.6;
type Spec = { cx: number; cy: number; w: number };
/** On va cada peça, en % de la composició (vista des de dalt). */
const PLATE: Spec = { cx: 36, cy: 55, w: 50 };
const CROISSANT: Spec = { cx: 35, cy: 53, w: 34 };
const CUP: Spec = { cx: 79, cy: 35, w: 29 };

const STEPS = ['Croissant acabat de fer', 'Un cafè', 'El primer mos'];

/** Caixa (left/top/width/height en %) d'una peça segons la seva proporció. */
function place(spec: Spec, sprite: { w: number; h: number }) {
  const h = spec.w * (sprite.h / sprite.w) * RATIO;
  return { left: spec.cx - spec.w / 2, top: spec.cy - h / 2, width: spec.w, height: h };
}
const pct = (box: ReturnType<typeof place>): CSSProperties => ({
  left: `${box.left}%`,
  top: `${box.top}%`,
  width: `${box.width}%`,
  height: `${box.height}%`,
});

const plateBox = place(PLATE, layers.plate);
const croissantBox = place(CROISSANT, layers.croissant);
const cupBox = place(CUP, layers.cup);

// On cauen les molles: al voltant del mos, sobre el plat (en % de la composició).
const biteAt = {
  x: croissantBox.left + layers.bite.cx * croissantBox.width,
  y: croissantBox.top + layers.bite.cy * croissantBox.height,
};
const CRUMB_SPOTS = [
  { dx: 3, dy: 6, rot: 20, w: 2.6 },
  { dx: -2, dy: 9, rot: -35, w: 2 },
  { dx: 6, dy: 2, rot: 60, w: 2.2 },
  { dx: 1, dy: 13, rot: 10, w: 3.4 },
  { dx: 7, dy: 10, rot: -15, w: 1.6 },
];

const FINAL = croissantFrame(1);

export function CafeteriaScene() {
  const plate = useRef<HTMLDivElement>(null);
  const plateShadow = useRef<HTMLDivElement>(null);
  const croissant = useRef<HTMLDivElement>(null);
  const croissantShadow = useRef<HTMLDivElement>(null);
  const whole = useRef<HTMLImageElement>(null);
  const bitten = useRef<HTMLImageElement>(null);
  const piece = useRef<HTMLImageElement>(null);
  const shadowWhole = useRef<HTMLImageElement>(null);
  const shadowBitten = useRef<HTMLImageElement>(null);
  const cup = useRef<HTMLDivElement>(null);
  const cupShadow = useRef<HTMLDivElement>(null);
  const coffee = useRef<HTMLImageElement>(null);
  const crumbs = useRef<(HTMLImageElement | null)[]>([]);
  const steam = useRef(FINAL.steam);
  const steps = useRef<SceneStepsHandle>(null);

  const onProgress = useCallback((p: number) => {
    const f: CroissantFrame = croissantFrame(p);
    // Plat: es posa a lloc.
    if (plate.current) {
      plate.current.style.opacity = String(clamp(f.plate * 1.6));
      plate.current.style.transform = `scale(${lerp(0.9, 1, f.plate)})`;
    }
    if (plateShadow.current) plateShadow.current.style.opacity = String(f.plate);

    // Croissant: cau des de dalt (més gran = més a prop de la càmera) i l'ombra s'hi acosta.
    const shown = f.croissant > 0 ? clamp(f.croissant * 8) : 0;
    const h = f.height;
    if (croissant.current) {
      croissant.current.style.opacity = String(shown);
      croissant.current.style.transform = `scale(${1 + 0.85 * h}) rotate(${(-32 * h).toFixed(2)}deg)`;
    }
    if (croissantShadow.current) {
      croissantShadow.current.style.opacity = String(shown * lerp(0.42, 0.12, h));
      croissantShadow.current.style.transform = `translate(${(1.5 + 14 * h).toFixed(2)}%, ${(3 + 22 * h).toFixed(2)}%) scale(${1 + 0.35 * h}) rotate(${(-32 * h).toFixed(2)}deg)`;
    }
    const didBite = f.bite >= 1;
    if (whole.current) whole.current.style.opacity = didBite ? '0' : '1';
    if (shadowWhole.current) shadowWhole.current.style.opacity = didBite ? '0' : '1';
    if (shadowBitten.current) shadowBitten.current.style.opacity = didBite ? '1' : '0';
    if (bitten.current) bitten.current.style.opacity = didBite ? '1' : '0';
    if (piece.current) {
      piece.current.style.opacity = didBite ? String(1 - f.piece) : '0';
      piece.current.style.transform = `translate(${(f.piece * 14).toFixed(2)}%, ${(-f.piece * 26).toFixed(2)}%) scale(${1 + 0.6 * f.piece})`;
    }

    // Tassa: entra lliscant i es posa sobre la taula.
    if (cup.current) {
      cup.current.style.opacity = String(clamp(f.cup * 3));
      cup.current.style.transform = `translateX(${((1 - f.cup) * 45).toFixed(2)}%) scale(${lerp(1.18, 1, f.cup)})`;
    }
    if (cupShadow.current) cupShadow.current.style.opacity = String(clamp(f.cup * 1.5));

    // Cafè: la superfície puja (el cercle creix cap a la vora) i gira una mica.
    if (coffee.current) {
      coffee.current.style.opacity = f.coffee > 0 ? String(clamp(f.coffee * 5)) : '0';
      coffee.current.style.transform = `translate(-50%, -50%) scale(${lerp(0.5, 1, f.coffee)}) rotate(${((1 - f.coffee) * 70).toFixed(1)}deg)`;
    }
    steam.current = f.steam;

    // Molles: surten del mos i cauen al plat.
    crumbs.current.forEach((el, i) => {
      if (!el) return;
      const t = clamp((f.crumbs - i * 0.1) / 0.45);
      const spot = CRUMB_SPOTS[i]!;
      el.style.opacity = t > 0 ? String(clamp(t * 4)) : '0';
      el.style.transform = `translate(${(-spot.dx * (1 - t) * 18).toFixed(1)}%, ${(-spot.dy * (1 - t) * 18).toFixed(1)}%) scale(${lerp(1.8, 1, t)}) rotate(${(spot.rot * t).toFixed(1)}deg)`;
    });

    steps.current?.setActive(f.stage, p);
  }, []);

  const interior = layers.cup.interior;

  return (
    <section aria-labelledby="cafeteria-title">
      <ScrollScene label="Animació: un croissant cau al plat, arriba el cafè i el primer mos" onFrame={onProgress} lengthVh={340}>
        <div className={styles.layout}>
          <SceneSteps
            ref={steps}
            eyebrow="casamoner cafeteria"
            title="Bon dia"
            titleId="cafeteria-title"
            titleLevel={2}
            text="De l'obrador a les botigues, bolleria fresca cada dia."
            steps={STEPS}
          />

          <div className={styles.composition} style={{ aspectRatio: `${RATIO}` }}>
            {/* Plat */}
            <div ref={plateShadow} className={styles.roundShadow} style={{ ...pct(plateBox), opacity: FINAL.plate }} />
            <div ref={plate} className={styles.piece} style={pct(plateBox)}>
              <LayerImage src={layers.plate.src} loading="lazy" decoding="async" />
            </div>

            {/* Ombra del croissant: la seva silueta, fosca i difuminada */}
            <div ref={croissantShadow} className={`${styles.piece} ${styles.silhouette}`} style={pct(croissantBox)}>
              <LayerImage ref={shadowWhole} src={layers.croissant.src} loading="lazy" decoding="async" style={{ opacity: 0 }} />
              <LayerImage ref={shadowBitten} src={layers.mossegat.src} loading="lazy" decoding="async" />
            </div>
            <div ref={croissant} className={styles.piece} style={pct(croissantBox)}>
              <LayerImage ref={whole} src={layers.croissant.src} loading="lazy" decoding="async" style={{ opacity: 0 }} />
              <LayerImage
                ref={bitten}
                src={layers.mossegat.src}
                alt="Croissant mossegat sobre un plat"
                loading="lazy"
                decoding="async"
              />
              <LayerImage ref={piece} src={layers.tros.src} loading="lazy" decoding="async" style={{ opacity: 0 }} />
            </div>

            {/* Molles */}
            {layers.crumbs.map((c, i) => {
              const spot = CRUMB_SPOTS[i]!;
              return (
                <LayerImage
                  key={c.src}
                  ref={(el) => {
                    crumbs.current[i] = el;
                  }}
                  src={c.src}
                  loading="lazy"
                  decoding="async"
                  className={styles.crumb}
                  style={{
                    left: `${biteAt.x + spot.dx}%`,
                    top: `${biteAt.y + spot.dy}%`,
                    width: `${spot.w}%`,
                    transform: `rotate(${spot.rot}deg)`,
                  }}
                />
              );
            })}

            {/* Tassa amb cafè i vapor */}
            <div ref={cupShadow} className={styles.roundShadow} style={pct(cupBox)} />
            <div ref={cup} className={styles.piece} style={pct(cupBox)}>
              <LayerImage src={layers.cup.src} alt="Tassa de cafè amb platet" loading="lazy" decoding="async" />
              <LayerImage
                ref={coffee}
                src={layers.coffee.src}
                loading="lazy"
                decoding="async"
                className={styles.coffee}
                style={{
                  left: `${interior.cx * 100}%`,
                  top: `${interior.cy * 100}%`,
                  width: `${interior.r * 200}%`,
                }}
              />
              <Steam
                level={steam}
                className={styles.steam}
              />
            </div>
          </div>
        </div>
      </ScrollScene>
    </section>
  );
}

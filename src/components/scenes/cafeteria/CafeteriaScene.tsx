'use client';

import Link from 'next/link';
import { useCallback, useRef, type CSSProperties } from 'react';
import { Logo } from '@/components/layout/Logo';
import layers from '@/data/scenes/breakfast.json';
import { croissantFrame, type CroissantFrame } from '@/lib/scenes/croissant';
import { clamp, lerp } from '@/lib/motion/timeline';
import { LayerImage } from '../LayerImage';
import { ScrollScene } from '../ScrollScene';
import { SceneSteps, type SceneStepsHandle } from '../SceneSteps';
import { Steam } from '../Steam';
import styles from './CafeteriaScene.module.css';

/** Proporció de la composició (amplada / alçada). */
const RATIO = 1.6;
type Spec = { cx: number; cy: number; w: number };
/** On va cada peça, en % de la composició (vista des de dalt). */
const TRAY: Spec = { cx: 50, cy: 50, w: 98 };
const PLATE: Spec = { cx: 26, cy: 57, w: 37 };
const CROISSANT: Spec = { cx: 25.5, cy: 55.5, w: 25 };
const CUP: Spec = { cx: 54, cy: 27, w: 20 };
const SANDWICH_PLATE: Spec = { cx: 71, cy: 64, w: 34 };
const SANDWICH: Spec = { cx: 71, cy: 63, w: 27 };
const JUICE: Spec = { cx: 85, cy: 23, w: 16 };


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

const trayBox = place(TRAY, layers.tray);
const sandwichPlateBox = place(SANDWICH_PLATE, layers.plate);
const sandwichBox = place(SANDWICH, layers.sandwich);
const juiceBox = place(JUICE, layers.juice);
const plateBox = place(PLATE, layers.plate);
const croissantBox = place(CROISSANT, layers.croissant);
const cupBox = place(CUP, layers.cup);

// On cauen les molles: al voltant del mos, sobre el plat (en % de la composició).
const biteAt = {
  x: croissantBox.left + layers.bite.cx * croissantBox.width,
  y: croissantBox.top + layers.bite.cy * croissantBox.height,
};
const CRUMB_SPOTS = [
  { dx: 2.2, dy: 4.5, rot: 20, w: 1.9 },
  { dx: -1.5, dy: 6.5, rot: -35, w: 1.5 },
  { dx: 4.4, dy: 1.5, rot: 60, w: 1.6 },
  { dx: 0.8, dy: 9.5, rot: 10, w: 2.5 },
  { dx: 5, dy: 7.5, rot: -15, w: 1.2 },
];

const FINAL = croissantFrame(1);

/** Tovalló de paper marró clar amb la marca, sota el menjar de cada plat. */
function Napkin({ className }: { className?: string }) {
  return (
    <span className={`${styles.napkin} ${className ?? ''}`} aria-hidden="true">
      <Logo className={styles.napkinLogo} />
    </span>
  );
}

export function CafeteriaScene() {
  const tray = useRef<HTMLDivElement>(null);
  const sandwichPlate = useRef<HTMLDivElement>(null);
  const sandwichPlateShadow = useRef<HTMLDivElement>(null);
  const sandwich = useRef<HTMLDivElement>(null);
  const sandwichShadow = useRef<HTMLDivElement>(null);
  const juice = useRef<HTMLDivElement>(null);
  const juiceShadow = useRef<HTMLDivElement>(null);
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
    // Safata: entra lliscant des de baix i s'atura.
    if (tray.current) {
      tray.current.style.opacity = String(clamp(f.tray * 2.5));
      tray.current.style.transform = `translateY(${((1 - f.tray) * 22).toFixed(2)}%) rotate(${((1 - f.tray) * -3).toFixed(2)}deg)`;
    }
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

    // Plat de l'entrepà, amb el tovalló: entra lliscant per baix.
    if (sandwichPlate.current) {
      sandwichPlate.current.style.opacity = String(clamp(f.sandwichPlate * 3));
      sandwichPlate.current.style.transform = `translateY(${((1 - f.sandwichPlate) * 40).toFixed(2)}%) scale(${lerp(1.12, 1, f.sandwichPlate)})`;
    }
    if (sandwichPlateShadow.current) sandwichPlateShadow.current.style.opacity = String(clamp(f.sandwichPlate * 1.5));
    // Entrepà: cau girant, com el croissant, i l'ombra s'hi acosta.
    const served = f.sandwich > 0 ? clamp(f.sandwich * 8) : 0;
    const sh = f.sandwichHeight;
    if (sandwich.current) {
      sandwich.current.style.opacity = String(served);
      sandwich.current.style.transform = `scale(${1 + 0.8 * sh}) rotate(${(26 * sh).toFixed(2)}deg)`;
    }
    if (sandwichShadow.current) {
      sandwichShadow.current.style.opacity = String(served * lerp(0.42, 0.12, sh));
      sandwichShadow.current.style.transform = `translate(${(1.5 + 14 * sh).toFixed(2)}%, ${(3.5 + 22 * sh).toFixed(2)}%) scale(${1 + 0.35 * sh}) rotate(${(26 * sh).toFixed(2)}deg)`;
    }
    // Suc: el got entra lliscant per la dreta.
    if (juice.current) {
      juice.current.style.opacity = String(clamp(f.juice * 3));
      juice.current.style.transform = `translateX(${((1 - f.juice) * 70).toFixed(2)}%) scale(${lerp(1.2, 1, f.juice)})`;
    }
    if (juiceShadow.current) juiceShadow.current.style.opacity = String(clamp(f.juice * 1.5));

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
      <ScrollScene
        label="Animació: l’esmorzar a la safata. Croissant, cafè, entrepà, suc de taronja i el primer mos"
        onFrame={onProgress}
        lengthVh={400}
      >
        <div className={styles.layout}>
          <SceneSteps
            ref={steps}
            eyebrow="Esmorzars a casamoner"
            title={
              <>
                Per tenir un bon dia, vine a <Logo className={styles.brand} />.
              </>
            }
            titleId="cafeteria-title"
            titleLevel={2}
            text="Agafa la safata, tria el que et ve de gust i seu. Avui et mereixes començar bé."
          >
            <Link href="/botigues" className={`button ${styles.cta}`}>
              Troba la teva fleca
            </Link>
          </SceneSteps>

          <div className={styles.composition} style={{ aspectRatio: `${RATIO}` }}>
            {/* Safata */}
            <div ref={tray} className={`${styles.piece} ${styles.tray}`} style={pct(trayBox)}>
              <LayerImage src={layers.tray.src} loading="lazy" decoding="async" />
            </div>

            {/* Plat */}
            <div ref={plateShadow} className={styles.roundShadow} style={{ ...pct(plateBox), opacity: FINAL.plate }} />
            <div ref={plate} className={styles.piece} style={pct(plateBox)}>
              <LayerImage src={layers.plate.src} loading="lazy" decoding="async" />
              <Napkin className={styles.napkinCroissant} />
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
                alt="Safata d’esmorzar amb un croissant mossegat sobre un plat"
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

            {/* Entrepà: plat amb tovalló, i l'entrepà retallat amb la seva ombra */}
            <div ref={sandwichPlateShadow} className={styles.roundShadow} style={pct(sandwichPlateBox)} />
            <div ref={sandwichPlate} className={styles.piece} style={pct(sandwichPlateBox)}>
              <LayerImage src={layers.plate.src} loading="lazy" decoding="async" />
              <Napkin className={styles.napkinSandwich} />
            </div>
            <div ref={sandwichShadow} className={`${styles.piece} ${styles.silhouette}`} style={pct(sandwichBox)}>
              <LayerImage src={layers.sandwich.src} loading="lazy" decoding="async" />
            </div>
            <div ref={sandwich} className={styles.piece} style={pct(sandwichBox)}>
              <LayerImage src={layers.sandwich.src} alt="Entrepà sobre un tovalló" loading="lazy" decoding="async" />
            </div>

            {/* Suc de taronja */}
            <div ref={juiceShadow} className={styles.roundShadow} style={pct(juiceBox)} />
            <div ref={juice} className={styles.piece} style={pct(juiceBox)}>
              <LayerImage src={layers.juice.src} alt="Got de suc de taronja" loading="lazy" decoding="async" />
            </div>

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

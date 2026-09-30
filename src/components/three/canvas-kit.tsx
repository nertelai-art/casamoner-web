'use client';

// Peces comunes dels canvas 3D (guia scroll-3d-scenes). Aquest fitxer importa
// three.js: només el poden fer servir mòduls carregats amb import() diferit.

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import {
  CanvasTexture,
  DoubleSide,
  MathUtils,
  PlaneGeometry,
  PMREMGenerator,
  SRGBColorSpace,
  Vector3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type PerspectiveCamera,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createPrng } from '@/lib/motion/prng';

const SMOOTHING = 5;
const MAX_DELTA = 1 / 30; // una pausa de pestanya no ha de fer saltar l'animació

/**
 * Progrés suavitzat cap al del scroll. Mentre no ha convergit, demana un altre
 * fotograma (frameloop="demand"). Retorna una ref: es llegeix dins useFrame.
 */
export function useDampedProgress(progress: RefObject<number>, reducedMotion: boolean) {
  const smooth = useRef(reducedMotion ? 1 : (progress.current ?? 0));
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const onScroll = () => invalidate();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [invalidate]);

  useFrame((_, rawDelta) => {
    const target = reducedMotion ? 1 : (progress.current ?? 0);
    smooth.current = MathUtils.damp(smooth.current, target, SMOOTHING, Math.min(rawDelta, MAX_DELTA));
    if (Math.abs(smooth.current - target) < 0.0005) smooth.current = target;
    else invalidate();
  });

  return smooth;
}

/**
 * Col·loca la càmera perquè hi càpiga `fitWidth` unitats, i desplaça el
 * frustum perquè l'escena quedi a la dreta del text en escriptori
 * (a sota en mòbil).
 */
export function useFramedCamera(fitWidth: number, fov: number) {
  const { camera, size } = useThree();
  return (azimuth: number, elevation: number, target: [number, number, number]) => {
    const aspect = size.width / size.height;
    const wide = aspect > 1.1;
    const effective = wide ? Math.min(aspect * 0.55, 1.4) : Math.min(aspect, 1.4);
    const radius = fitWidth / 2 / (Math.tan(MathUtils.degToRad(fov / 2)) * effective);
    camera.position.set(
      target[0] + Math.sin(azimuth) * Math.cos(elevation) * radius,
      target[1] + Math.sin(elevation) * radius,
      target[2] + Math.cos(azimuth) * Math.cos(elevation) * radius,
    );
    camera.lookAt(...target);
    const cam = camera as PerspectiveCamera;
    // Escriptori: l'escena a la dreta. Mòbil: a la meitat de baix.
    if (wide) cam.setViewOffset(size.width, size.height, -size.width * 0.2, 0, size.width, size.height);
    else cam.setViewOffset(size.width, size.height, 0, -size.height * 0.16, size.width, size.height);
    cam.updateProjectionMatrix();
  };
}

/** Il·luminació d'estudi sense xarxa: RoomEnvironment prefiltrat una sola vegada. */
function StudioEnvironment({ intensity = 0.8 }: { intensity?: number }) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const { gl, scene } = get();
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [get, intensity]);
  return null;
}

/** Compila els shaders en muntar, abans que la secció sigui visible. */
function Precompile() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    gl.compile(scene, camera);
  }, [gl, scene, camera]);
  return null;
}

export function SceneCanvas({ children, fov, envIntensity }: { children: ReactNode; fov: number; envIntensity?: number }) {
  const [dpr, setDpr] = useState(1.5);
  useEffect(() => {
    // dpr adaptatiu barat: en pantalles petites o màquines modestes, 1.
    if (window.innerWidth < 700 || (navigator.hardwareConcurrency ?? 8) <= 4) setDpr(1); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);
  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      camera={{ position: [0, 4, 10], fov }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }}
      aria-hidden="true"
    >
      <StudioEnvironment intensity={envIntensity} />
      {children}
      <Precompile />
    </Canvas>
  );
}

/** Textura pintada en un canvas amb atzar amb llavor (sRGB). */
export function useCanvasTexture(
  size: number,
  seed: number,
  paint: (ctx: CanvasRenderingContext2D, size: number, random: () => number) => void,
) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    paint(ctx, size, createPrng(seed));
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
    // La pintura és pura i determinista: només depèn de la mida i la llavor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, seed]);
}

/** Ombra difusa pintada una vegada (en lloc de re-renderitzar ombres a cada fotograma). */
export function useBlobShadow(color = '40,25,15', strength = 0.45) {
  return useCanvasTexture(128, 1, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, `rgba(${color},${strength})`);
    g.addColorStop(0.6, `rgba(${color},${strength * 0.35})`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
}

const worldPos = new Vector3();

/** Alfa d'una voluta: suau als costats i esvaïda a baix i a dalt. */
function useWispAlpha() {
  return useCanvasTexture(64, 8, (ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, s, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const v = ctx.createLinearGradient(0, 0, 0, s);
    v.addColorStop(0, 'rgba(0,0,0,1)');
    v.addColorStop(0.35, 'rgba(0,0,0,0)');
    v.addColorStop(0.85, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, s, s);
  });
}

interface SteamWispsProps {
  /** Nivell de vapor (0–1), llegit a cada fotograma. */
  level: () => number;
  positions: readonly number[];
  width?: number;
  height?: number;
  color?: string;
  maxOpacity?: number;
  position?: [number, number, number];
}

/**
 * Volutes de vapor: tires que s'ondulen, miren sempre a la càmera i pugen en
 * bucle. Demanen fotogrames només mentre hi ha vapor i el canvas és a la vista.
 */
export function SteamWisps({ level, positions, width = 0.26, height = 1.5, color = '#ffffff', maxOpacity = 0.5, position = [0, 0, 0] }: SteamWispsProps) {
  const group = useRef<Group>(null);
  const alpha = useWispAlpha();
  const invalidate = useThree((s) => s.invalidate);
  const gl = useThree((s) => s.gl);
  const wisps = useMemo(
    () =>
      positions.map((x, i) => {
        const g = new PlaneGeometry(width, height, 1, 32);
        g.translate(0, height / 2, 0);
        return { geometry: g, base: Float32Array.from(g.attributes.position!.array as Float32Array), phase: i * 2.1, x };
      }),
    [positions, width, height],
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const amount = level();
    g.visible = amount > 0;
    if (!g.visible) return;
    const t = state.clock.elapsedTime;
    g.getWorldPosition(worldPos);
    g.rotation.y = Math.atan2(state.camera.position.x - worldPos.x, state.camera.position.z - worldPos.z);
    g.children.forEach((child, i) => {
      const w = wisps[i]!;
      const pos = w.geometry.attributes.position!;
      for (let v = 0; v < pos.count; v++) {
        const y = w.base[v * 3 + 1]!;
        pos.setX(v, w.base[v * 3]! + w.x + Math.sin((y / height) * 4.8 - t * 1.6 + w.phase) * 0.09 * y);
      }
      pos.needsUpdate = true;
      ((child as Mesh).material as MeshBasicMaterial).opacity = amount * maxOpacity * (0.75 + 0.25 * Math.sin(t * 0.9 + w.phase));
    });
    const r = gl.domElement.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) invalidate();
  });

  return (
    <group ref={group} position={position} visible={false}>
      {wisps.map((w) => (
        <mesh key={w.phase} geometry={w.geometry}>
          <meshBasicMaterial color={color} alphaMap={alpha} transparent opacity={0} depthWrite={false} side={DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

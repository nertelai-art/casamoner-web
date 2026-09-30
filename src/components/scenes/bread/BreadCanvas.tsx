'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  BufferAttribute,
  Color,
  MathUtils,
  SphereGeometry,
  type Mesh,
  type PointLight,
} from 'three';
import { breadFrame } from '@/lib/scenes/bread';
import {
  SceneCanvas,
  useBlobShadow,
  useCanvasTexture,
  useDampedProgress,
  useFramedCamera,
  SteamWisps,
} from '@/components/three/canvas-kit';
import type { CanvasSceneProps } from '@/components/three/types';

const FOV = 30;
const LOAF = { length: 2.3, height: 0.85, width: 1.05 };
const SLASHES = [-1.05, 0, 1.05];
const STEAM_X = [-1.1, -0.35, 0.4, 1.1];

// Colors (sRGB → lineal via Color)
const DOUGH = new Color('#d6bf95');
const CRUST = new Color('#b8712f');
const CRUST_TOP = new Color('#7a3d15');
const CRUMB = new Color('#ecd3a0');

// Temporals reutilitzats: zero objectes nous per fotograma.
const tmpCrust = new Color();
const tmpGroove = new Color();
const tmp = new Color();

interface LoafGeometry {
  geometry: SphereGeometry;
  base: Float32Array;
  normals: Float32Array;
  groove: Float32Array;
  top: Float32Array;
}

/** Barra de pa: esfera allargada, base aplanada, extrems afuats i tres greixes. */
function buildLoaf(): LoafGeometry {
  const geometry = new SphereGeometry(1, 160, 72);
  const pos = geometry.attributes.position as BufferAttribute;
  const count = pos.count;
  for (let i = 0; i < count; i++) {
    const px = pos.getX(i);
    let y = pos.getY(i) * LOAF.height;
    const x = px * LOAF.length;
    const z = pos.getZ(i) * LOAF.width * (1 - 0.28 * px * px);
    if (y < -0.08) y = -0.08 + (y + 0.08) * 0.18; // base plana
    pos.setXYZ(i, x, y + 0.24, z); // origen a la base: s'infla des de la safata
  }
  geometry.computeVertexNormals();
  const base = Float32Array.from(pos.array as Float32Array);
  const normals = Float32Array.from(geometry.attributes.normal!.array as Float32Array);

  // Pes de cada greixa: distància al segment diagonal, només a la part de dalt.
  const groove = new Float32Array(count);
  const top = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const x = base[i * 3]!;
    const y = base[i * 3 + 1]!;
    const z = base[i * 3 + 2]!;
    top[i] = MathUtils.smoothstep(y, 0.35, 1.05);
    let w = 0;
    for (const cx of SLASHES) {
      const ax = cx - 0.5, az = -0.16, bx = cx + 0.5, bz = 0.16;
      const t = MathUtils.clamp(((x - ax) * (bx - ax) + (z - az) * (bz - az)) / ((bx - ax) ** 2 + (bz - az) ** 2), 0, 1);
      const d = Math.hypot(x - (ax + t * (bx - ax)), z - (az + t * (bz - az)));
      const ends = Math.sin(Math.PI * t) ** 0.5;
      w = Math.max(w, Math.exp(-((d / 0.075) ** 2)) * ends);
    }
    groove[i] = w * MathUtils.smoothstep(y, 0.55, 0.85);
  }
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(count * 3), 3));
  return { geometry, base, normals, groove, top };
}

/** Aplica el daurat i l'obertura de les greixes a la geometria (in situ). */
function paintLoaf(loaf: LoafGeometry, golden: number, open: number) {
  const { geometry, base, normals, groove, top } = loaf;
  const pos = geometry.attributes.position as BufferAttribute;
  const colors = geometry.attributes.color as BufferAttribute;
  const depth = open * 0.11;
  for (let i = 0; i < pos.count; i++) {
    const g = groove[i]!;
    const k = g * depth;
    pos.setXYZ(i, base[i * 3]! - normals[i * 3]! * k, base[i * 3 + 1]! - normals[i * 3 + 1]! * k, base[i * 3 + 2]! - normals[i * 3 + 2]! * k);
    tmpCrust.copy(CRUST).lerp(CRUST_TOP, top[i]! * 0.7);
    tmp.copy(DOUGH).lerp(tmpCrust, golden);
    tmpGroove.copy(DOUGH).lerp(CRUMB, golden);
    tmp.lerp(tmpGroove, Math.min(1, g * (0.4 + open)));
    colors.setXYZ(i, tmp.r, tmp.g, tmp.b);
  }
  pos.needsUpdate = true;
  colors.needsUpdate = true;
  geometry.computeVertexNormals();
}


function Choreography({ progress, reducedMotion }: CanvasSceneProps) {
  const smooth = useDampedProgress(progress, reducedMotion);
  const frame = useFramedCamera(6.2, FOV);

  const loaf = useMemo(() => buildLoaf(), []);
  const last = useRef({ golden: -1, open: -1 });
  const loafMesh = useRef<Mesh>(null);
  const glow = useRef<PointLight>(null);
  const steamLevel = useRef(0);
  const shadow = useBlobShadow();

  const flour = useCanvasTexture(512, 7, (ctx, s, random) => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 2600; i++) {
      const v = 225 + random() * 30;
      ctx.fillStyle = `rgba(${v},${v - 6},${v - 18},${0.25 + random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(random() * s, random() * s, 0.6 + random() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const wood = useCanvasTexture(512, 3, (ctx, s, random) => {
    ctx.fillStyle = '#8a5a34';
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 2) {
      const v = random() * 40 - 20;
      ctx.fillStyle = `rgba(${60 + v},${35 + v / 2},${18},${0.18 + random() * 0.2})`;
      ctx.fillRect(0, y, s, 1 + random() * 2);
    }
  });

  useFrame(() => {
    const p = smooth.current;
    const f = breadFrame(p);
    frame(MathUtils.lerp(0.62, 0.22, p), MathUtils.lerp(0.5, 0.36, p), [0, 0.45, 0]);

    if (Math.abs(f.golden - last.current.golden) > 0.004 || Math.abs(f.scoreOpen - last.current.open) > 0.004) {
      paintLoaf(loaf, f.golden, f.scoreOpen);
      last.current = { golden: f.golden, open: f.scoreOpen };
    }
    if (loafMesh.current) {
      loafMesh.current.scale.set(MathUtils.lerp(0.84, 1, f.rise), f.height, MathUtils.lerp(0.82, 1, f.rise));
    }
    if (glow.current) glow.current.intensity = f.glow * 26;

    steamLevel.current = f.steam;
  });

  return (
    <>
      <hemisphereLight args={['#fff1dc', '#5a3a22', 0.9]} />
      <directionalLight position={[3, 6, 4]} intensity={2.2} color="#fff0dc" />
      <directionalLight position={[-5, 3, -3]} intensity={0.7} color="#ffd9a8" />
      <pointLight ref={glow} position={[0, 0.2, -1.4]} color="#ff7a1a" distance={9} decay={1.2} intensity={0} />

      <mesh ref={loafMesh} geometry={loaf.geometry}>
        <meshStandardMaterial vertexColors map={flour} bumpMap={flour} bumpScale={1.2} roughness={0.88} metalness={0} />
      </mesh>

      {/* Pala de fusta */}
      <mesh position={[0, -0.07, 0]}>
        <boxGeometry args={[5.4, 0.14, 2.5]} />
        <meshStandardMaterial map={wood} roughness={0.8} />
      </mesh>
      <mesh position={[3.9, -0.07, 0]}>
        <boxGeometry args={[2.6, 0.12, 0.36]} />
        <meshStandardMaterial map={wood} roughness={0.8} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]} scale={[5.2, 2.4, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>

      <SteamWisps level={() => steamLevel.current} positions={STEAM_X} width={0.34} height={2.2} color="#f4e6d4" maxOpacity={0.4} position={[0, 0.95, 0]} />
    </>
  );
}

export default function BreadCanvas(props: CanvasSceneProps) {
  return (
    <SceneCanvas fov={FOV} envIntensity={0.45}>
      <Choreography {...props} />
    </SceneCanvas>
  );
}

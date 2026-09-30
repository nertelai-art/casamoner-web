'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  BufferAttribute,
  CircleGeometry,
  Color,
  DoubleSide,
  MathUtils,
  Object3D,
  Plane,
  SphereGeometry,
  Vector2,
  Vector3,
  type Group,
  type InstancedMesh,
  type Mesh,
  type MeshBasicMaterial,
} from 'three';
import { easeOutBack, easeOutBounce, easeOutCubic } from '@/lib/motion/timeline';
import { croissantFrame } from '@/lib/scenes/croissant';
import {
  SceneCanvas,
  SteamWisps,
  useBlobShadow,
  useCanvasTexture,
  useDampedProgress,
  useFramedCamera,
} from '@/components/three/canvas-kit';
import type { CanvasSceneProps } from '@/components/three/types';

const FOV = 30;
const SEGMENTS = 11;
/** Segments que desapareixen amb la mossegada (la punta de la dreta). */
const BITTEN = [SEGMENTS - 1, SEGMENTS - 2];
const EDGE = SEGMENTS - 3;
const CRUMBS = 6;
const STEAM_X = [-0.16, 0, 0.16];

const PLATE_AT = new Vector2(-0.75, 0.35);
const CUP_AT = new Vector2(1.75, -0.85);

// Temporals reutilitzats.
const dummy = new Object3D();
const tangent = new Vector3();
const cutPoint = new Vector3();
/** Pla on es talla el segment mossegat (en coordenades del món). */
const cutPlane = new Plane();
/** On es fa el tall, en fracció del semieix del segment (0 = centre, 1 = punta). */
const CUT = 0.18;

interface Segment {
  x: number;
  z: number;
  y: number;
  yaw: number;
  roll: number;
  length: number;
  thick: number;
}

/** Mitja lluna: segments al llarg d'un arc, gruixuts al mig i prims a les puntes. */
function croissantSegments(): Segment[] {
  const R = 0.95;
  return Array.from({ length: SEGMENTS }, (_, i) => {
    const u = (i / (SEGMENTS - 1)) * 2 - 1;
    const a = u * 1.22;
    const r = R * (1 - 0.12 * u * u); // les puntes es tanquen cap endins
    const thick = 0.13 + 0.33 * (1 - Math.abs(u) ** 1.7);
    return {
      x: r * Math.sin(a),
      z: -r * Math.cos(a) + R * 0.65,
      y: thick * 0.78 - 0.05 * u * u,
      yaw: -a,
      roll: (i % 2 === 0 ? 1 : -1) * 0.12,
      length: 0.25 + thick * 0.35,
      thick,
    };
  });
}

/** Perfil de revolució (radi, alçada). */
const lathe = (points: [number, number][]) => points.map(([x, y]) => new Vector2(x, y));

const PLATE = lathe([
  [0, 0.07], [1.45, 0.07], [1.75, 0.15], [1.95, 0.24], [2.0, 0.25], [2.01, 0.23], [1.94, 0.17],
  [1.6, 0.05], [1.2, 0.02], [1.15, 0], [0, 0],
]);
const CUP_OUT = lathe([[0, 0], [0.36, 0], [0.43, 0.06], [0.52, 0.42], [0.57, 0.8], [0.585, 0.86]]);
const CUP_IN = lathe([[0.555, 0.86], [0.54, 0.8], [0.49, 0.42], [0.41, 0.12], [0, 0.1]]);

function Choreography({ progress, reducedMotion }: CanvasSceneProps) {
  const smooth = useDampedProgress(progress, reducedMotion);
  const frame = useFramedCamera(6.4, FOV);

  const segments = useMemo(() => croissantSegments(), []);
  const plate = useRef<Group>(null);
  const croissant = useRef<Group>(null);
  const layers = useRef<InstancedMesh>(null);
  const biteFace = useRef<Mesh>(null);
  const edgeSegment = useRef<Mesh>(null);
  const get = useThree((s) => s.get);
  useLayoutEffect(() => {
    get().gl.localClippingEnabled = true;
  }, [get]);
  const crumbs = useRef<InstancedMesh>(null);
  const cup = useRef<Group>(null);
  const coffee = useRef<Mesh>(null);
  const steamLevel = useRef(0);
  const shadow = useBlobShadow('60,35,20', 0.35);
  const shadowMaterial = useRef<MeshBasicMaterial>(null);

  // Geometria base del croissant, amb la part de dalt més torrada.
  const segmentGeometry = useMemo(() => {
    const g = new SphereGeometry(1, 40, 28);
    const n = g.attributes.normal!;
    const colors = new Float32Array(n.count * 3);
    for (let i = 0; i < n.count; i++) {
      const k = MathUtils.lerp(1.08, 0.58, MathUtils.smoothstep(n.getY(i), -0.2, 0.95));
      colors.set([k, k, k], i * 3);
    }
    g.setAttribute('color', new BufferAttribute(colors, 3));
    return g;
  }, []);

  // Cara mossegada: cercle amb vora de dents.
  const biteGeometry = useMemo(() => {
    const g = new CircleGeometry(1, 64);
    const pos = g.attributes.position!;
    for (let i = 1; i < pos.count; i++) {
      const angle = Math.atan2(pos.getY(i), pos.getX(i));
      const r = 1 - 0.13 * Math.abs(Math.sin(angle * 4.5)) ** 0.6;
      pos.setXY(i, Math.cos(angle) * r, Math.sin(angle) * r * 0.85);
    }
    return g;
  }, []);

  const crumb = useCanvasTexture(256, 5, (ctx, s, random) => {
    ctx.fillStyle = '#f0dcb4';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(${180 + random() * 40},${140 + random() * 30},${80 + random() * 30},${0.35 + random() * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(random() * s, random() * s, 2 + random() * 9, 1 + random() * 4, random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // capes de massa fullada
    ctx.strokeStyle = 'rgba(200,150,80,0.5)';
    for (let r = 30; r < s / 2; r += 18 + random() * 10) {
      ctx.lineWidth = 2 + random() * 2;
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  const crema = useCanvasTexture(256, 6, (ctx, s, random) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, '#6b3a1c');
    g.addColorStop(0.55, '#8a4f24');
    g.addColorStop(0.85, '#b9814a');
    g.addColorStop(1, '#5a2e14');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = `rgba(210,160,100,${random() * 0.25})`;
      ctx.beginPath();
      ctx.arc(random() * s, random() * s, random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const crumbDrops = useMemo(
    () =>
      Array.from({ length: CRUMBS }, (_, i) => ({
        x: 0.55 + Math.sin(i * 2.3) * 0.3,
        z: 0.25 + Math.cos(i * 1.7) * 0.35,
        delay: (i / CRUMBS) * 0.5,
        size: 0.035 + ((i * 37) % 10) / 400,
      })),
    [],
  );

  // Colors de cada capa: el mig més torrat que les puntes.
  useLayoutEffect(() => {
    const mesh = layers.current;
    if (!mesh) return;
    const tip = new Color('#d58f41');
    const mid = new Color('#9d5215');
    segments.forEach((s, i) => {
      const u = Math.abs((i / (SEGMENTS - 1)) * 2 - 1);
      mesh.setColorAt(i, mid.clone().lerp(tip, u ** 1.3));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [segments]);

  useFrame(() => {
    const p = smooth.current;
    const f = croissantFrame(p);
    frame(MathUtils.lerp(0.95, 0.4, p), MathUtils.lerp(0.78, 0.62, p), [0.45, 0.25, -0.2]);

    if (shadowMaterial.current) shadowMaterial.current.opacity = f.plate;
    steamLevel.current = f.steam;

    // Plat
    if (plate.current) {
      const s = f.plate === 0 ? 0 : MathUtils.lerp(0.7, 1, f.plate);
      plate.current.scale.setScalar(s);
      plate.current.position.y = MathUtils.lerp(-0.4, 0, f.plate);
    }

    // Croissant: cau girant i rebota sobre el plat
    if (croissant.current) {
      const t = f.croissant;
      croissant.current.visible = t > 0;
      croissant.current.position.y = 0.07 + MathUtils.lerp(3, 0, easeOutBounce(t));
      croissant.current.rotation.y = 0.35 + (1 - easeOutCubic(t)) * 2.6;
      // mossegada: un petit sotrac del croissant quan es mossega
      const chomp = f.bite > 0 && f.crumbs < 0.15 ? 1 - Math.sin(Math.PI * Math.min(1, f.crumbs / 0.15)) * 0.03 : 1;
      croissant.current.scale.set(1, chomp, 1);
    }
    const mesh = layers.current;
    const bitten = f.bite >= 1;
    if (mesh) {
      segments.forEach((s, i) => {
        // Després del mos, el segment de la vora el dibuixa edgeSegment (tallat) i les puntes desapareixen.
        const hidden = bitten && (BITTEN.includes(i) || i === EDGE);
        dummy.position.set(s.x, s.y, s.z);
        dummy.rotation.set(s.roll, s.yaw, 0);
        if (hidden) dummy.scale.setScalar(0);
        else dummy.scale.set(s.length, s.thick * 0.82, s.thick);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    const edge = segments[EDGE]!;
    if (edgeSegment.current && biteFace.current && croissant.current) {
      edgeSegment.current.visible = bitten;
      biteFace.current.visible = bitten;
      edgeSegment.current.position.set(edge.x, edge.y, edge.z);
      edgeSegment.current.rotation.set(edge.roll, edge.yaw, 0);
      edgeSegment.current.scale.set(edge.length, edge.thick * 0.82, edge.thick);
      // La cara del mos: al pla de tall, de la mida de la secció en aquell punt.
      const section = Math.sqrt(1 - CUT * CUT);
      biteFace.current.position.copy(edgeSegment.current.position);
      biteFace.current.rotation.set(0, edge.yaw + Math.PI / 2, 0);
      biteFace.current.translateZ(edge.length * CUT);
      biteFace.current.scale.set(edge.thick * section, edge.thick * 0.82 * section, 1);
      // Pla de tall en coordenades del món: normal cap a la punta que ja no hi és.
      croissant.current.updateMatrixWorld();
      tangent.set(Math.cos(edge.yaw), 0, -Math.sin(edge.yaw)).transformDirection(croissant.current.matrixWorld);
      cutPoint.copy(biteFace.current.position).applyMatrix4(croissant.current.matrixWorld);
      cutPlane.setFromNormalAndCoplanarPoint(tangent.negate(), cutPoint);
    }
    if (crumbs.current) {
      crumbDrops.forEach((c, i) => {
        const t = MathUtils.clamp((f.crumbs - c.delay) / 0.5, 0, 1);
        dummy.position.set(c.x, 0.1 + (1 - easeOutBounce(t)) * 0.55, c.z);
        dummy.rotation.set(i, t * 4 + i, 0);
        dummy.scale.setScalar(t > 0 ? c.size : 0);
        dummy.updateMatrix();
        crumbs.current!.setMatrixAt(i, dummy.matrix);
      });
      crumbs.current.instanceMatrix.needsUpdate = true;
    }

    // Tassa i cafè
    if (cup.current) {
      const s = f.cup === 0 ? 0 : easeOutBack(f.cup);
      cup.current.scale.setScalar(s);
      cup.current.position.y = MathUtils.lerp(0.8, 0, easeOutCubic(f.cup));
    }
    if (coffee.current) {
      coffee.current.visible = f.coffee > 0;
      const h = MathUtils.lerp(0.12, 0.78, f.coffee);
      coffee.current.position.y = 0.12 + h;
      const r = MathUtils.lerp(0.42, 0.535, (h - 0.12) / 0.7);
      coffee.current.scale.set(r, r, 1);
    }

  });

  return (
    <>
      <hemisphereLight args={['#fff8ee', '#b99270', 1.0]} />
      <directionalLight position={[-3, 7, 5]} intensity={2.4} color="#fff3e2" />
      <directionalLight position={[5, 3, -4]} intensity={0.8} color="#ffe2bf" />

      <mesh rotation-x={-Math.PI / 2} position={[0.4, 0.002, -0.2]} scale={[7.5, 5, 1]}>
        <planeGeometry />
        <meshBasicMaterial ref={shadowMaterial} map={shadow} transparent depthWrite={false} opacity={0} />
      </mesh>

      <group position={[PLATE_AT.x, 0, PLATE_AT.y]}>
        <group ref={plate} scale={0}>
          <mesh>
            <latheGeometry args={[PLATE, 96]} />
            <meshStandardMaterial color="#f5f1e8" roughness={0.22} side={DoubleSide} />
          </mesh>
        </group>

        <group ref={croissant} visible={false}>
          <instancedMesh ref={layers} args={[segmentGeometry, undefined, SEGMENTS]}>
            <meshPhysicalMaterial vertexColors roughness={0.5} clearcoat={0.35} clearcoatRoughness={0.4} />
          </instancedMesh>
          <mesh ref={edgeSegment} geometry={segmentGeometry} visible={false}>
            <meshPhysicalMaterial
              vertexColors
              color="#a85a1a"
              roughness={0.5}
              clearcoat={0.35}
              clearcoatRoughness={0.4}
              clippingPlanes={[cutPlane]}
              side={DoubleSide}
            />
          </mesh>
          <mesh ref={biteFace} geometry={biteGeometry} visible={false}>
            <meshStandardMaterial map={crumb} roughness={0.95} side={DoubleSide} />
          </mesh>
        </group>

        <instancedMesh ref={crumbs} args={[undefined, undefined, CRUMBS]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#c98a45" roughness={0.8} />
        </instancedMesh>
      </group>

      <group position={[CUP_AT.x, 0, CUP_AT.y]}>
        <group ref={cup} scale={0}>
          <mesh scale={[0.58, 0.8, 0.58]}>
            <latheGeometry args={[PLATE, 72]} />
            <meshStandardMaterial color="#f5f1e8" roughness={0.22} side={DoubleSide} />
          </mesh>
          <group position={[0, 0.12, 0]}>
            <mesh>
              <latheGeometry args={[CUP_OUT, 72]} />
              <meshStandardMaterial color="#a4471b" roughness={0.35} side={DoubleSide} />
            </mesh>
            <mesh>
              <latheGeometry args={[CUP_IN, 72]} />
              <meshStandardMaterial color="#f3ece0" roughness={0.3} side={DoubleSide} />
            </mesh>
            <mesh position={[0.6, 0.46, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <torusGeometry args={[0.2, 0.05, 14, 28, Math.PI * 1.15]} />
              <meshStandardMaterial color="#a4471b" roughness={0.35} />
            </mesh>
          </group>
          <mesh ref={coffee} rotation-x={-Math.PI / 2} visible={false}>
            <circleGeometry args={[1, 48]} />
            <meshStandardMaterial map={crema} roughness={0.25} />
          </mesh>
          <SteamWisps level={() => steamLevel.current} positions={STEAM_X} color="#c9b9a6" maxOpacity={0.55} position={[0, 1.05, 0]} />
        </group>
      </group>
    </>
  );
}

export default function CroissantCanvas(props: CanvasSceneProps) {
  return (
    <SceneCanvas fov={FOV} envIntensity={0.7}>
      <Choreography {...props} />
    </SceneCanvas>
  );
}

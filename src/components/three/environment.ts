'use client';

import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';

let webgl: boolean | undefined;
function supportsWebGL() {
  if (webgl === undefined) {
    try {
      const canvas = document.createElement('canvas');
      webgl = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const noop = () => () => {};

/** «3d», «static» (sense WebGL) o «pending» al servidor fins que hidrata (M-6). */
export function useRenderMode(): '3d' | 'static' | 'pending' {
  return useSyncExternalStore(noop, () => (supportsWebGL() ? '3d' : 'static'), () => 'pending' as const);
}

/** Es torna `true` (per sempre) quan l'element és a menys de `margin` de la pantalla. */
export function useNearViewport(ref: RefObject<HTMLElement | null>, margin = '1500px') {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: `${margin} 0px` },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, margin]);
  return near;
}

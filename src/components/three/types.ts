import type { RefObject } from 'react';

/** Props de tots els canvas 3D: el progrés viu en una ref, mai en estat de React. */
export interface CanvasSceneProps {
  progress: RefObject<number>;
  reducedMotion: boolean;
}
